// render-khbd.js — Dựng file .docx KHBD đúng bố cục KHBD_MAU.docx từ JSON.
// Cài: npm i docx
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, VerticalAlign, TabStopType, LeaderType, LineRuleType,
} = require("docx");
const fs = require("fs");
const path = require("path");
const opentype = require("opentype.js");

// ---- Thông số lấy từ KHBD_MAU.docx: A4, Times New Roman 14pt, lề T/B 2cm, trái 3cm, phải 1.5cm
const FONT = "Times New Roman";
const SIZE = 28; // half-points = 14pt
const PAGE = {
  size: { width: 11907, height: 16839 },
  margin: { top: 1134, bottom: 1134, left: 1701, right: 850 },
};
const CONTENT_W = PAGE.size.width - PAGE.margin.left - PAGE.margin.right; // 9356
const COL_W = Math.floor(CONTENT_W / 2);

// ---- Tải phông từ KHBD_MAU.docx (Times New Roman; nếu máy chủ không có thì Liberation Serif)
function loadFont(isBold = false) {
  const filename = isBold ? "timesbd.ttf" : "times.ttf";
  const libFilename = isBold ? "LiberationSerif-Bold.ttf" : "LiberationSerif-Regular.ttf";

  // 1. Thư mục fonts/ trong khbd-renderer
  const localP = path.join(__dirname, "fonts", filename);
  if (fs.existsSync(localP)) {
    try {
      const buf = fs.readFileSync(localP);
      return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    } catch {}
  }

  // 2. Windows Fonts
  const winP = path.join(process.env.WINDIR || "C:\\Windows", "Fonts", filename);
  if (fs.existsSync(winP)) {
    try {
      const buf = fs.readFileSync(winP);
      return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    } catch {}
  }

  // 3. Liberation Serif trên Linux/Server
  const linuxPaths = [
    path.join(__dirname, "fonts", libFilename),
    "/usr/share/fonts/truetype/liberation/" + libFilename,
    "/usr/share/fonts/liberation-serif/" + libFilename,
    "/usr/share/fonts/truetype/liberation2/" + libFilename,
    "/usr/local/share/fonts/" + libFilename,
  ];
  for (const lp of linuxPaths) {
    if (fs.existsSync(lp)) {
      try {
        const buf = fs.readFileSync(lp);
        return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
      } catch {}
    }
  }

  return null;
}

const regularFont = loadFont(false);
const boldFont = loadFont(true) || regularFont;

// Đo số dòng chữ thật: chiều rộng ô (4678 dxa) trừ lề trong (100 + 100 dxa), trừ hao 2% chiều rộng
const CELL_PADDING_DXA = 100 + 100;
const INNER_W_PT = (COL_W - CELL_PADDING_DXA) / 20; // 223.9 pt
const MAX_W_PT = INNER_W_PT * 0.98; // 219.422 pt

function measureLines(text, font = regularFont, fontSizePt = 14, maxWidthPt = MAX_W_PT) {
  const str = String(text ?? "").trim();
  if (!str) return 1;
  const hardLines = str.split("\n");
  let totalLines = 0;

  for (const hardLine of hardLines) {
    const trimmed = hardLine.trim();
    if (!trimmed) {
      totalLines += 1;
      continue;
    }
    const words = trimmed.split(/\s+/);
    let curW = 0;
    let lines = 1;

    for (let i = 0; i < words.length; i++) {
      const wStr = (i === 0 ? "" : " ") + words[i];
      const wWidth = font ? font.getAdvanceWidth(wStr, fontSizePt) : wStr.length * (fontSizePt * 0.52);
      if (curW + wWidth <= maxWidthPt) {
        curW += wWidth;
      } else {
        lines++;
        curW = font ? font.getAdvanceWidth(words[i], fontSizePt) : words[i].length * (fontSizePt * 0.52);
      }
    }
    totalLines += lines;
  }
  return Math.max(1, totalLines);
}

// ---- Chuẩn hóa khoảng trắng & ký hiệu, không tự ý chèn thêm GV / HS vào câu
function normalizeActor(line, actor) {
  let s = String(line ?? "").trim();
  if (!s) return "";

  // Xử lý lỗi khoảng trắng đôi và dấu chấm đôi '..'
  s = s.replace(/[ \t]+/g, " ");
  s = s.replace(/\.{4,}/g, "...").replace(/(?<!\.)\.\.(?!\.)/g, ".");

  // Lưu rồi xóa ký hiệu '-' / '+' đầu câu (kể cả lặp: '- -', '+ -', '- +')
  const markerMatch = s.match(/^[-+\s]+/);
  let marker = "";
  if (markerMatch && /[-+]/.test(markerMatch[0])) {
    marker = "-";
    s = s.replace(/^[-+\s]+/, "");
  }

  return `${marker ? marker + " " : ""}${s}`.trim();
}

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

// ---- Bỏ nhãn "Liên hệ:" nếu Gemini lỡ ghi
const noLabel = (t) => t.replace(/^\s*Liên hệ\s*[:\-–]\s*/i, "");

// ---- Mỗi hoạt động gồm các "bước" song hành {gv, hs, ma_nls?} sử dụng trực tiếp nội dung giáo án
function steps(h) {
  let st = Array.isArray(h.cac_buoc) ? h.cac_buoc : [];
  if (!st.length) { // dự phòng định dạng cũ: ghép theo thứ tự gv[i] <-> hs[i]
    const g = list(h.gv), p = list(h.hs);
    st = Array.from({ length: Math.max(g.length, p.length) }, (_, i) => ({ gv: g[i], hs: p[i] }));
  }
  return st
    .map((x) => {
      const ma = x.ma_nls ? bareCode(x.ma_nls) : "";
      const rawGv = inlineCodes(noLabel(clean(x.gv))) + (ma ? ` (${ma})` : "");
      const rawHs = inlineCodes(noLabel(clean(x.hs)));
      const gv = clean(x.gv) ? rawGv.trim() : "";
      const hs = clean(x.hs) ? rawHs.trim() : "";
      return { gv, hs };
    })
    .filter((x) => x.gv || x.hs);
}

// ---- Các khối dựng sẵn (Spacing Paragraph trước và sau cố định là 0, giãn dòng cố định Exactly)
const run = (text, o = {}) => new TextRun({ text, font: FONT, size: SIZE, ...o });
const para = (children, o = {}) =>
  new Paragraph({ spacing: { line: 276, lineRule: LineRuleType.EXACTLY, before: 0, after: 0 }, children, ...o });
const center = (text, o = {}) =>
  para([run(text, o)], { alignment: AlignmentType.CENTER });
const heading = (text) => para([run(text, { bold: true })], { spacing: { line: 276, lineRule: LineRuleType.EXACTLY, before: 0, after: 0 } });
const dashLine = (text, o = {}) => {
  const t = String(text ?? "").trim();
  if (!t) return null;
  const content = t.replace(/^[-+]\s*/, "");
  return new Paragraph({
    spacing: { line: 276, lineRule: LineRuleType.EXACTLY, before: 0, after: 0 },
    alignment: AlignmentType.JUSTIFIED,
    children: [run(`- ${content}`)],
    ...o,
  });
};
const empty = () =>
  new Paragraph({
    spacing: { line: 276, lineRule: LineRuleType.EXACTLY, before: 0, after: 0 },
    children: [run("")],
  });

function normalizeActivityName(raw) {
  let name = clean(raw).replace(/^\d+[.)]\s*/, "");
  name = name.replace(/Luyện\s*tập\s*thực\s*hành/gi, "Luyện tập, thực hành");
  name = name.replace(/Vận\s*dụng\s*trải\s*nghiệm/gi, "Vận dụng, trải nghiệm");
  name = name.replace(/Luyện\s*tập\s*[\-–/]\s*thực\s*hành/gi, "Luyện tập, thực hành");
  name = name.replace(/Vận\s*dụng\s*[\-–/]\s*trải\s*nghiệm/gi, "Vận dụng, trải nghiệm");
  return name;
}

const B = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
const NONE = { style: BorderStyle.NONE, size: 0, color: "auto" };
const BORDERS = { top: B, bottom: B, left: B, right: B };

// Chuẩn hóa tên bài: tất cả tên bài phải là chữ in hoa, xóa chữ "Bài" / "BÀI" bị lặp ở đầu chuỗi (ví dụ: "Bài Bài 1:...", "Bài Bài:...")
function formatLessonTitle(raw) {
  let s = clean(raw).trim();
  if (!s) return "BÀI: …";

  // Xóa mọi từ "Bài" / "BÀI" bị lặp ở đầu chuỗi
  s = s.replace(/^(?:bài\s*)+/i, "").trim();

  if (s.startsWith(":")) {
    const rest = s.replace(/^:\s*/, "").trim();
    return rest ? `BÀI: ${rest.toUpperCase()}` : "BÀI: …";
  }
  if (/^\d+/.test(s)) {
    return `BÀI ${s.toUpperCase()}`.trim();
  }
  return `BÀI: ${s.toUpperCase()}`.trim();
}
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
    center(formatLessonTitle(d.bai), { bold: true }),
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
    dashLine(`Giáo viên: ${clean(d.do_dung_gv).replace(/^(?:giáo viên|gv)\s*[-:.,–\s]*/i, "").trim()}`),
    dashLine(`Học sinh: ${clean(d.do_dung_hs).replace(/^(?:học sinh|hs)\s*[-:.,–\s]*/i, "").trim()}`),
    heading("III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:")
  );

  // Bảng 2 cột chuẩn KHBD_MAU.docx:
  // Hàng 1: Tiêu đề cột GV | HS (viền bao quanh)
  // Các hoạt động tiếp theo: mỗi hoạt động gồm 2 hàng:
  // - Hàng tiêu đề hoạt động: hàng bảng gộp 2 cột (columnSpan: 2), viền CHỈ 2 BÊN trái & phải (top: NONE, bottom: NONE)
  // - Hàng các bước của hoạt động: 2 ô (GV và HS) song hành, các cặp câu được cân bằng dòng bằng đoạn trống
  const tableRows = [];

  console.log("=== BẮT ĐẦU CĂN HÀNG BẢNG 2 CỘT KHBD BẰNG ĐOẠN TRỐNG ===");

  hds.forEach((h, hIdx) => {
    const ten = normalizeActivityName(h.ten);
    const tg = thoiGian(h, ten);
    const titleText = `${hIdx + 1}. ${ten}: ${tg}`;

    // 1. Hàng tiêu đề hoạt động: 1 hàng bảng riêng biệt (TableRow), tuyệt đối không gộp 2 cột của bảng
    // Viền chỉ 2 bên: left: SINGLE (size 6), right: SINGLE (size 6), top: NONE, bottom: NONE. Ở giữa: SINGLE (size 6).
    const titleCellGv = new TableCell({
      width: { size: COL_W, type: WidthType.DXA },
      borders: {
        top: NONE,
        bottom: NONE,
        left: B,
        right: B,
      },
      margins: { top: 80, bottom: 60, left: 100, right: 100 },
      children: [
        new Paragraph({
          spacing: { line: 276, lineRule: LineRuleType.EXACTLY, before: 0, after: 0 },
          children: [run(titleText, { bold: true })],
        }),
      ],
    });

    const titleCellHs = new TableCell({
      width: { size: COL_W, type: WidthType.DXA },
      borders: {
        top: NONE,
        bottom: NONE,
        left: B,
        right: B,
      },
      margins: { top: 80, bottom: 60, left: 100, right: 100 },
      children: [empty()],
    });

    tableRows.push(new TableRow({ children: [titleCellGv, titleCellHs] }));
    console.log(`[Hoạt động ${hIdx + 1}] "${titleText}": Đã tạo hàng bảng tiêu đề 2 ô riêng biệt (không gộp cột, viền 2 bên & ở giữa)`);

    // 2. Hàng nội dung của hoạt động: 2 ô (GV và HS)
    const gvChildren = [];
    const hsChildren = [];

    // Từng cặp câu song hành giữa GV và HS
    steps(h).forEach((st, sIdx) => {
      const cleanLine = (t) => String(t ?? "").trim().replace(/^[-+•*]\s*/, "");
      const gvClean = cleanLine(st.gv);
      const hsClean = cleanLine(st.hs);

      const dashGv = gvClean ? `- ${gvClean}` : "";
      const dashHs = hsClean ? `- ${hsClean}` : "";

      // Đo số dòng chữ thật
      const n_gv = measureLines(dashGv, regularFont, 14, MAX_W_PT);
      const n_hs = measureLines(dashHs, regularFont, 14, MAX_W_PT);

      // Thêm dòng gạch đầu dòng của GV và HS
      gvChildren.push(dashLine(dashGv));
      hsChildren.push(dashLine(dashHs));

      // Bên nào ít hơn thì thêm |n_gv - n_hs| đoạn trống ngay SAU câu đó, rồi mới sang cặp kế tiếp
      const diff = Math.abs(n_gv - n_hs);
      if (n_gv > n_hs) {
        for (let k = 0; k < diff; k++) {
          hsChildren.push(empty());
        }
        console.log(`  [Cặp ${sIdx + 1}] n_gv=${n_gv}, n_hs=${n_hs} -> bù ${diff} đoạn trống vào HS`);
      } else if (n_hs > n_gv) {
        for (let k = 0; k < diff; k++) {
          gvChildren.push(empty());
        }
        console.log(`  [Cặp ${sIdx + 1}] n_gv=${n_gv}, n_hs=${n_hs} -> bù ${diff} đoạn trống vào GV`);
      } else {
        console.log(`  [Cặp ${sIdx + 1}] n_gv=${n_gv}, n_hs=${n_hs} -> cân bằng (0 đoạn trống)`);
      }
    });

    const isLastActivity = hIdx === hds.length - 1;
    const bottomBorder = isLastActivity ? B : NONE;

    const gvCell = new TableCell({
      width: { size: COL_W, type: WidthType.DXA },
      borders: {
        top: NONE,
        bottom: bottomBorder,
        left: B,
        right: B,
      },
      margins: { top: 60, bottom: 80, left: 100, right: 100 },
      children: gvChildren.filter(Boolean),
    });

    const hsCell = new TableCell({
      width: { size: COL_W, type: WidthType.DXA },
      borders: {
        top: NONE,
        bottom: bottomBorder,
        left: B,
        right: B,
      },
      margins: { top: 60, bottom: 80, left: 100, right: 100 },
      children: hsChildren.filter(Boolean),
    });

    tableRows.push(new TableRow({ children: [gvCell, hsCell] }));
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

  body.push(
    new Table({
      width: { size: COL_W * 2, type: WidthType.DXA },
      columnWidths: [COL_W, COL_W],
      borders: {
        top: B,
        bottom: B,
        left: B,
        right: B,
        insideHorizontal: NONE,
        insideVertical: B,
      },
      rows: [head, ...tableRows],
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
module.exports = { renderKhbd, clean, normalizeActor, measureLines, formatLessonTitle };
