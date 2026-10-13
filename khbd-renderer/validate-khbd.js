// validate-khbd.js — Kiểm tra & chuẩn hoá JSON của Gemini trước khi dựng Word.
// Trả { data, errors }: errors là các lỗi KHÔNG tự sửa được -> nên gọi lại Gemini kèm danh sách lỗi.
const { clean } = require("./render-khbd");

const TOTAL_MINUTES = 35; // một tiết tiểu học; đổi nếu trường khác
const KHOI_DONG = /kh[ởo]i\s*đ[ộo]ng/i;
const bare = (m) => clean(m).replace(/[\[\]()]/g, "").replace(/^Mã\s*/i, "").trim();

function validateKhbd(raw, selectedCodes = []) {
  const errors = [];
  const d = JSON.parse(JSON.stringify(raw || {}));
  const want = selectedCodes.map(bare).filter(Boolean);

  // 1. Hoạt động
  d.hoat_dong = (d.hoat_dong || []).filter((h) => (h.cac_buoc || []).some((s) => clean(s.gv) || clean(s.hs)));
  if (!d.hoat_dong.length) errors.push("Thiếu hoat_dong / cac_buoc.");
  d.hoat_dong.forEach((h) => {
    h.cac_buoc = h.cac_buoc.filter((s) => clean(s.gv) || clean(s.hs));
    h.cac_buoc.forEach((s, i) => {
      if (!clean(s.gv) || !clean(s.hs))
        errors.push(`Hoạt động "${h.ten}", bước ${i + 1}: thiếu việc của ${clean(s.gv) ? "HS" : "GV"} — GV và HS phải song hành.`);
    });
  });

  // 2. Thời gian: Khởi động = 5; tổng = TOTAL_MINUTES (tự cân bằng vào hoạt động dài nhất nếu lệch)
  d.hoat_dong.forEach((h) => { h.thoi_gian_phut = KHOI_DONG.test(clean(h.ten)) ? 5 : Math.round(Number(h.thoi_gian_phut) || 0); });
  const others = d.hoat_dong.filter((h) => !KHOI_DONG.test(clean(h.ten)));
  if (others.length) {
    others.forEach((h) => { if (h.thoi_gian_phut <= 0) h.thoi_gian_phut = 1; });
    const hasKD = d.hoat_dong.some((h) => KHOI_DONG.test(clean(h.ten)));
    const diff = TOTAL_MINUTES - d.hoat_dong.reduce((a, h) => a + h.thoi_gian_phut, 0);
    if (diff !== 0 && hasKD) others.reduce((a, b) => (b.thoi_gian_phut > a.thoi_gian_phut ? b : a)).thoi_gian_phut += diff;
  }

  // 3. Mã Năng lực số: đúng các mã đã chọn, không thừa, mỗi mã được lồng vào hoạt động ít nhất 1 lần
  d.nang_luc_so = (d.nang_luc_so || []).map((x) => ({ ma: bare(x.ma), noi_dung: clean(x.noi_dung) }));
  if (want.length) {
    const got = d.nang_luc_so.map((x) => x.ma);
    d.nang_luc_so = d.nang_luc_so.filter((x) => want.includes(x.ma)); // bỏ mã thừa
    want.forEach((m) => {
      if (!got.includes(m)) errors.push(`Thiếu mã ${m} trong nang_luc_so.`);
      const used = d.hoat_dong.some((h) => h.cac_buoc.some((s) => bare(s.ma_nls) === m));
      if (!used) errors.push(`Mã ${m} chưa được lồng vào bước nào của hoạt động (ma_nls).`);
    });
    d.hoat_dong.forEach((h) => h.cac_buoc.forEach((s) => { if (s.ma_nls && !want.includes(bare(s.ma_nls))) delete s.ma_nls; }));
  }
  return { data: d, errors };
}
module.exports = { validateKhbd, TOTAL_MINUTES };
