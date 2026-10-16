// validate-khbd.js — Kiểm tra & chuẩn hoá JSON của Gemini trước khi dựng Word.
// Trả { data, errors }: errors là các lỗi KHÔNG tự sửa được -> nên gọi lại Gemini kèm danh sách lỗi.
const { clean, formatLessonTitle } = require("./render-khbd");
const {
  resolveAIPlan,
  generateDefaultAIBlock,
  generateDefaultAIHsBlock,
  normalizeAIBlock,
} = require("./ai-rules");

const TOTAL_MINUTES = 35; // một tiết tiểu học; đổi nếu trường khác
const KHOI_DONG = /kh[ởo]i\s*đ[ộo]ng/i;
const bare = (m) => clean(m).replace(/[\[\]()]/g, "").replace(/^Mã\s*/i, "").trim();

function validateKhbd(raw, selectedCodes = [], selectedAiCodes = [], aiPlan = null) {
  const errors = [];
  const d = JSON.parse(JSON.stringify(raw || {}));
  const want = selectedCodes.map(bare).filter(Boolean);
  const wantAi = (selectedAiCodes || []).map(bare).filter(Boolean);

  // Chuẩn hóa tên bài (xóa chữ Bài bị lặp)
  if (d.bai) {
    d.bai = formatLessonTitle(d.bai);
  }

  // 1. Hoạt động
  d.hoat_dong = (d.hoat_dong || []).filter((h) => (h.cac_buoc || []).some((s) => clean(s.gv) || clean(s.hs)));
  if (!d.hoat_dong.length) errors.push("Thiếu hoat_dong / cac_buoc.");
  d.hoat_dong.forEach((h) => {
    h.ten = clean(h.ten)
      .replace(/Luyện\s*tập\s*thực\s*hành/gi, "Luyện tập, thực hành")
      .replace(/Vận\s*dụng\s*trải\s*nghiệm/gi, "Vận dụng, trải nghiệm");
    h.cac_buoc = h.cac_buoc.filter((s) => clean(s.gv) || clean(s.hs));
    h.cac_buoc.forEach((s) => {
      const gvClean = clean(s.gv);
      const hsClean = clean(s.hs);
      if (gvClean && !hsClean) {
        // Tôn trọng 100% nội dung của GV, tự động bổ sung việc của HS để đảm bảo tính nhất quán và song hành
        s.hs = "Lắng nghe, quan sát và thực hiện theo hướng dẫn.";
      } else if (!gvClean && hsClean) {
        // Tự động bổ sung việc của GV
        s.gv = "Quan sát, hướng dẫn và hỗ trợ học sinh thực hiện.";
      }
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
      if (!got.includes(m)) {
        d.nang_luc_so.push({ ma: m, noi_dung: "" });
      }
      const used = d.hoat_dong.some((h) => h.cac_buoc.some((s) => bare(s.ma_nls) === m));
      if (!used) {
        // Tự động gán mã vào một bước phù hợp thay vì báo lỗi bắt Gemini viết lại làm hỏng nội dung gốc
        let assigned = false;
        for (const h of d.hoat_dong) {
          const name = h.ten.toLowerCase();
          if (name.includes("khám phá") || name.includes("luyện tập")) {
            const stepWithoutCode = h.cac_buoc.find((st) => !st.ma_nls);
            if (stepWithoutCode) {
              stepWithoutCode.ma_nls = m;
              assigned = true;
              break;
            }
          }
        }
        if (!assigned && d.hoat_dong[0] && d.hoat_dong[0].cac_buoc[0]) {
          d.hoat_dong[0].cac_buoc[0].ma_nls = m;
        }
      }
    });
    d.hoat_dong.forEach((h) => h.cac_buoc.forEach((s) => { if (s.ma_nls && !want.includes(bare(s.ma_nls))) delete s.ma_nls; }));
  }

  // 4. Mã Trí tuệ nhân tạo (AI): chuẩn hóa & lọc đúng mã đã chọn nếu có
  d.tich_hop_ai = (d.tich_hop_ai || []).map((x) => ({ ma: bare(x.ma), noi_dung: clean(x.noi_dung) }));
  if (wantAi.length) {
    const gotAi = d.tich_hop_ai.map((x) => x.ma);
    d.tich_hop_ai = d.tich_hop_ai.filter((x) => wantAi.includes(x.ma));
    wantAi.forEach((m) => {
      if (!gotAi.includes(m)) {
        d.tich_hop_ai.push({ ma: m, noi_dung: "" });
      }
    });

    // Chuẩn bị plan AI nếu chưa truyền vào
    const activePlan = aiPlan || resolveAIPlan("Tivi/máy chiếu", wantAi);

    // Tìm xem trong hoat_dong đã có bước Tích hợp AI chưa
    let foundAIStep = false;
    for (const h of d.hoat_dong) {
      for (const st of h.cac_buoc) {
        const gvText = String(st.gv || "");
        if (gvText.includes("*Tích hợp AI:") || /tích hợp\s*(?:trí tuệ nhân tạo\s*)?ai/i.test(gvText)) {
          foundAIStep = true;
          const normalized = normalizeAIBlock(st.gv, st.hs, activePlan);
          st.gv = normalized.gv;
          st.hs = normalized.hs;
          break;
        }
      }
      if (foundAIStep) break;
    }

    // Nếu chưa có khối Tích hợp AI, tự động bổ sung vào cuối Khám phá hoặc Luyện tập
    if (!foundAIStep && d.hoat_dong.length > 0) {
      let targetAct = d.hoat_dong.find((h) => h.ten.toLowerCase().includes("khám phá"));
      if (!targetAct) {
        targetAct = d.hoat_dong.find((h) => h.ten.toLowerCase().includes("luyện tập"));
      }
      if (!targetAct) {
        targetAct = d.hoat_dong.find((h) => h.ten.toLowerCase().includes("vận dụng"));
      }
      if (!targetAct) {
        targetAct = d.hoat_dong[d.hoat_dong.length - 1];
      }

      if (targetAct && Array.isArray(targetAct.cac_buoc)) {
        targetAct.cac_buoc.push({
          gv: generateDefaultAIBlock(activePlan),
          hs: generateDefaultAIHsBlock(activePlan),
        });
      }
    }
  }

  return { data: d, errors };
}
module.exports = { validateKhbd, TOTAL_MINUTES };

