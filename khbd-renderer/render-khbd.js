// render-khbd.js — Dựng file .docx KHBD đúng bố cục KHBD_MAU.docx từ JSON.
// Cài: npm i docx
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, VerticalAlign, TabStopType, LeaderType,
} = require("docx");

// ---- Thông số lấy từ KHBD_MAU.docx: A4, Times New Roman 14pt, lề T/B 2cm, trái 3cm, phải 1.5cm
const FONT = "Times New Roman";
const SIZE = 28; // half-points = 14pt
const PAGE = {
  size: { width: 11907, height: 16839 },
  margin: { top: 1134, bottom: 1134, left: 1701, right: 850 },
};
const CONTENT_W = PAGE.size.width - PAGE.margin.left - PAGE.margin.right; // 9356
const COL_W = Math.floor(CONTENT_W / 2);

// ---- Làm sạch văn bản do LLM trả về (chặn markdown, gạch đầu dòng thừa, lời chào…)
function clean(s) {
  return String(s ?? "")
    .replace(/\*\*|__|`/g, "")
    .replace(/^\s*[#>]+\s*/g, "")
    .replace(/^\s*(?:[-*•+]|\d+[.)])\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}
const list = (a) => (Array.isArray(a) ? a.map(clean).filter(Boolean) : []);

// ---- Thời gian: Khởi động luôn 5 phút; các hoạt động khác là một số cố định, không có "khoảng"
function thoiGian(h, ten) {
  if (/kh[ơo]̉?i\s*đ[ôo]̣?ng/i.test(ten.normalize("NFC"))) return "5 phút";
  let m = Number(h.thoi_gian_phut);
  if (!m) {
    // dự phòng: lấy số đầu tiên trong chuỗi cũ; khoảng "10 - 12" lấy số lớn hơn
    const nums = (String(h.thoi_gian || "").match(/\d+/g) || []).map(Number);
    m = nums.length ? Math.max(...nums) : 0;
  }
  return m ? `${m} phút` : "… phút";
}

// ---- Câu luôn mở đầu bằng "GV" hoặc "HS"; bỏ nhãn "Liên hệ:" nếu Gemini lỡ ghi
const noLabel = (t) => t.replace(/^\s*Liên hệ\s*[:\-–]\s*/i, "");
function withRole(role, t) {
  if (!t) return "";
  if (new RegExp(`^${role}\\b`).test(t)) return t;
  return `${role} ${t.charAt(0).toLowerCase()}${t.slice(1)}`;
}

// ---- Mỗi hoạt động gồm các "bước" song hành {gv, hs, ma_nls?}
function steps(h) {
  let st = Array.isArray(h.cac_buoc) ? h.cac_buoc : [];
  if (!st.length) { // dự phòng định dạng cũ: ghép theo thứ tự gv[i] <-> hs[i]
    const g = list(h.gv), p = list(h.hs);
    st = Array.from({ length: Math.max(g.length, p.length) }, (_, i) => ({ gv: g[i], hs: p[i] }));
  }
  return st
    .map((x) => {
      const ma = x.ma_nls ? bareCode(x.ma_nls) : "";
      const gv = withRole("GV", inlineCodes(noLabel(clean(x.gv)))) + (ma ? ` (${ma})` : "");
      return { gv: clean(x.gv) ? gv : "", hs: withRole("HS", inlineCodes(noLabel(clean(x.hs)))) };
    })
    .filter((x) => x.gv || x.hs);
}

// ---- Các khối dựng sẵn
const run = (text, o = {}) => new TextRun({ text, font: FONT, size: SIZE, ...o });
const para = (children, o = {}) =>
  new Paragraph({ spacing: { line: 276, after: 0 }, children, ...o });
const center = (text, o = {}) =>
  para([run(text, o)], { alignment: AlignmentType.CENTER });
const heading = (text) => para([run(text, { bold: true })], { spacing: { line: 276, before: 120, after: 0 } });
const dashLine = (text, o = {}) => {
  const t = clean(text);
  if (!t) return null;
  return new Paragraph({
    spacing: { line: 276, after: 60 },
    alignment: AlignmentType.JUSTIFIED,
    children: [run(`- ${t}`)],
    ...o,
  });
};
const empty = () => para([run("")]);

function normalizeActivityName(raw) {
  let name = clean(raw).replace(/^\d+[.)]\s*/, "");
  name = name.replace(/Luyện\s*tập\s*thực\s*hành/gi, "Luyện tập, thực hành");
  name = name.replace(/Vận\s*dụng\s*trải\s*nghiệm/gi, "Vận dụng, trải nghiệm");
  name = name.replace(/Luyện\s*tập\s*[\-–/]\s*thực\s*hành/gi, "Luyện tập, thực hành");
  name = name.replace(/Vận\s*dụng\s*[\-–/]\s*trải\s*nghiệm/gi, "Vận dụng, trải nghiệm");
  return name;
}

const B = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
const BORDERS = { top: B, bottom: B, left: B, right: B };
const cell = (children, o = {}) =>
  new TableCell({
    width: { size: COL_W, type: WidthType.DXA },
    borders: BORDERS,
    margins: { top: 40, bottom: 40, left: 100, right: 100 },
    children,
    ...o,
  });

// Mã chỉ báo: bỏ chữ "Mã" và ngoặc vuông nếu có -> "4.1.CB1a"
const bareCode = (m) => clean(m).replace(/[\[\]()]/g, "").replace(/^Mã\s*/i, "").trim();

function codeList(items) {
  // [{ma, noi_dung}] -> "- 4.1.CB1a: nội dung"
  return (items || [])
    .map((x) => ({ ma: bareCode(x.ma), nd: clean(x.noi_dung) }))
    .filter((x) => x.ma || x.nd)
    .map((x) => dashLine(x.ma ? `${x.ma}: ${x.nd}` : x.nd))
    .filter(Boolean);
}

// Mã nằm trong lời văn của hoạt động: "[Mã 4.1.CB1a]" -> "(4.1.CB1a)"
const inlineCodes = (t) => t.replace(/\[\s*Mã\s*([^\]]+?)\s*\]/gi, "($1)");

function buildDoc(d0, opts = {}) {
  // Môn học lấy từ ô chọn môn của giáo viên trên web app (ưu tiên hơn dữ liệu Gemini)
  const d = { ...d0, mon: opts.mon || d0.mon, tiet: opts.tiet || d0.tiet };
  const kt = list(d.kien_thuc);
  const hds = (d.hoat_dong || []).filter((h) => steps(h).length);
  if (!hds.length) throw new Error("JSON thiếu hoat_dong");

  const body = [
    center("KẾ HOẠCH BÀI DẠY", { bold: true }),
    para(
      [run(`MÔN: ${clean(d.mon).toUpperCase()}`, { bold: true }), run("\t"), run(`TIẾT: ${clean(d.tiet) || "…"}`, { bold: true })],
      { alignment: AlignmentType.CENTER, tabStops: [{ type: TabStopType.CENTER, position: 4678 }] }
    ),
    center(`BÀI ${clean(d.bai)}`, { bold: true }),
    center(`Ngày soạn: ${clean(d.ngay_soan) || "… /… /…"}`),
    empty(),

    heading("I. YÊU CẦU CẦN ĐẠT"),
    para([run("1. Kiến thức:", { bold: true })]),
    ...(kt.length ? kt.map((t) => dashLine(t)).filter(Boolean) : [dashLine("…")]),
    para([run("2. Năng lực: ", { bold: true }), run("Năng lực tự chủ, tự học; năng lực giải quyết vấn đề và sáng tạo; năng lực giao tiếp và hợp tác.")], { alignment: AlignmentType.JUSTIFIED }),
    para([run("3. Phẩm chất: ", { bold: true }), run("Phẩm chất yêu nước, nhân ái, chăm chỉ, trách nhiệm.")]),
  ];
  const nls = codeList(d.nang_luc_so);
  if (nls.length) body.push(para([run("*Tích hợp Năng lực số:", { bold: true, italics: true })]), ...nls);
  const ai = codeList(d.tich_hop_ai);
  if (ai.length) body.push(para([run("*Tích hợp AI:", { bold: true, italics: true })]), ...ai);

  body.push(
    heading("II. ĐỒ DÙNG DẠY HỌC:"),
    dashLine(`Giáo viên: ${clean(d.do_dung_gv)}`),
    dashLine(`Học sinh: ${clean(d.do_dung_hs)}`),
    heading("III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:")
  );

  // Bảng 2 cột chuẩn KHBD_MAU.docx: gồm đúng 2 hàng
  // Hàng 1: Tiêu đề cột GV | HS
  // Hàng 2: Toàn bộ hoạt động GV và HS song hành bằng khoảng trống xuống dòng (spacing.after)
  const gvChildren = [];
  const hsChildren = [];

  hds.forEach((h, hIdx) => {
    const ten = normalizeActivityName(h.ten);
    const tg = thoiGian(h, ten);

    // Tiêu đề hoạt động GV (In đậm)
    gvChildren.push(
      new Paragraph({
        spacing: { line: 276, before: hIdx > 0 ? 140 : 40, after: 60 },
        children: [run(`${hIdx + 1}. ${ten}: ${tg}`, { bold: true })],
      })
    );

    // Dòng giữ chỗ tương ứng bên HS để các bước bên dưới song hành
    hsChildren.push(
      new Paragraph({
        spacing: { line: 276, before: hIdx > 0 ? 140 : 40, after: 60 },
        children: [run("")],
      })
    );

    // Từng bước song hành giữa GV và HS
    steps(h).forEach((st) => {
      const gvText = clean(st.gv);
      const hsText = clean(st.hs);

      // Ước lượng số dòng chữ (khoảng 42 ký tự/dòng ở font 14pt cột rộng 4678 dxa)
      const gvLines = Math.max(1, Math.ceil((gvText.length + 2) / 42));
      const hsLines = Math.max(1, Math.ceil((hsText.length + 2) / 42));

      let gvAfter = 60;
      let hsAfter = 60;

      if (gvLines > hsLines) {
        hsAfter += (gvLines - hsLines) * 276;
      } else if (hsLines > gvLines) {
        gvAfter += (hsLines - gvLines) * 276;
      }

      gvChildren.push(dashLine(gvText, { spacing: { line: 276, after: gvAfter } }));
      hsChildren.push(dashLine(hsText, { spacing: { line: 276, after: hsAfter } }));
    });
  });

  const head = new TableRow({
    children: [
      new TableCell({
        width: { size: COL_W, type: WidthType.DXA },
        borders: { top: B, bottom: B, left: B, right: B },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [center("Hoạt động của giáo viên", { bold: true })],
        verticalAlign: VerticalAlign.CENTER,
      }),
      new TableCell({
        width: { size: COL_W, type: WidthType.DXA },
        borders: { top: B, bottom: B, left: B, right: B },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [center("Hoạt động của học sinh", { bold: true })],
        verticalAlign: VerticalAlign.CENTER,
      }),
    ],
  });

  const contentRow = new TableRow({
    children: [
      new TableCell({
        width: { size: COL_W, type: WidthType.DXA },
        borders: { top: B, bottom: B, left: B, right: B },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: gvChildren.filter(Boolean),
      }),
      new TableCell({
        width: { size: COL_W, type: WidthType.DXA },
        borders: { top: B, bottom: B, left: B, right: B },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: hsChildren.filter(Boolean),
      }),
    ],
  });

  body.push(
    new Table({
      width: { size: COL_W * 2, type: WidthType.DXA },
      columnWidths: [COL_W, COL_W],
      borders: {
        top: B,
        bottom: B,
        left: B,
        right: B,
        insideH: B,
        insideV: B,
      },
      rows: [head, contentRow],
    })
  );

  // mỗi dòng chấm vừa khít một dòng, kéo hết lề phải (tab có dẫn chấm)
  const dotLine = () => para([run("\t")], { tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W, leader: LeaderType.DOT }] });
  body.push(
    heading("IV. ĐIỀU CHỈNH SAU BÀI DẠY (Nếu có):"),
    dotLine(),
    dotLine()
  );

  return new Document({
    styles: { default: { document: { run: { font: FONT, size: SIZE } } } },
    sections: [{ properties: { page: PAGE }, children: body }],
  });
}

// opts.mon: môn giáo viên chọn trên web app, ví dụ "Công nghệ" -> "MÔN: CÔNG NGHỆ"
// opts.tiet: tiết giáo viên chọn/nhập trên web app, ví dụ "2" -> "TIẾT: 2" (không truyền thì dùng data.tiet, rồi "…")
async function renderKhbd(data, opts = {}) {
  return Packer.toBuffer(buildDoc(data, opts)); // Buffer .docx
}
module.exports = { renderKhbd, clean };
