// ai-rules.js — Quy chuẩn 5 bước Tích hợp Trí tuệ nhân tạo (AI) vào Kế hoạch bài dạy
// Căn cứ theo lựa chọn [3. Đồ dùng và thiết bị lớp học] & 32 mã chỉ báo AI Lớp 3 (PL CV 2422)

// ============================================================================
// BƯỚC 1 – XÁC ĐỊNH ĐIỀU KIỆN (từ "3. Đồ dùng và thiết bị lớp học")
// ============================================================================
function getCondition(infrastructureLevel) {
  const s = String(infrastructureLevel || "").toLowerCase().trim();
  if (s.includes("tivi") || s.includes("máy chiếu") || s.includes("may chieu") || s.includes("đk1") || s.includes("dk1")) {
    return { id: "ĐK1", name: "Tivi/máy chiếu" };
  }
  if (s.includes("màn hình tương tác") || s.includes("man hinh tuong tac") || s.includes("bảng tương tác") || s.includes("đk2") || s.includes("dk2")) {
    return { id: "ĐK2", name: "Màn hình tương tác" };
  }
  if (s.includes("phòng tin học") || s.includes("phong tin hoc") || s.includes("phòng máy tính") || s.includes("phong may tinh") || s.includes("đk3") || s.includes("dk3")) {
    return { id: "ĐK3", name: "Phòng máy tính / Phòng Tin học" };
  }
  if (s.includes("bảng") || s.includes("tranh") || s.includes("đk4") || s.includes("dk4")) {
    return { id: "ĐK4", name: "Chỉ có bảng lớp và tranh ảnh" };
  }
  // Mặc định
  return { id: "ĐK1", name: "Tivi/máy chiếu" };
}

// ============================================================================
// BƯỚC 2 – XÁC ĐỊNH NHÓM CHỈ BÁO (N, T, P, R, K, D, M)
// ============================================================================
const AI_GROUP_DEFINITIONS = {
  N: {
    name: "Nhận biết",
    description: "Nhận biết tình huống dùng AI, thiết bị AI quanh em, mục đích hỗ trợ của AI",
    codes: ["3.A1.1", "3.A2.1", "3.A2.2", "3.A2.3", "3.A2.MR1", "3.A2.MR3", "3.C5.3"],
  },
  T: {
    name: "Thực hành trợ lí",
    description: "Cách sử dụng trợ lí học tập thông minh, ứng dụng học ngôn ngữ",
    codes: ["3.A1.2", "3.A1.MR1"],
  },
  P: {
    name: "Phân biệt, nguyên tắc",
    description: "Phân biệt công cụ hỗ trợ và làm thay toàn bộ, hậu quả phụ thuộc, nguyên tắc dùng AI",
    codes: ["3.A1.3", "3.A1.MR2", "3.A2.MR2"],
  },
  R: {
    name: "Rủi ro, quyền riêng tư, đạo đức",
    description: "Tình huống rủi ro khi dùng AI, kiểm tra an toàn/quyền riêng tư, không dùng AI vào việc xấu",
    codes: ["3.A1.4", "3.A1.5", "3.A1.MR3", "3.B3.1"],
  },
  K: {
    name: "Kiểm chứng, AI có thể sai, sản phẩm AI tạo",
    description: "AI có thể sai sót, sản phẩm AI không đúng sự thật, so sánh đối chiếu đa nguồn",
    codes: ["3.A3.1", "3.A3.2", "3.B2.1"],
  },
  D: {
    name: "Dữ liệu",
    description: "Khái niệm dữ liệu, thuộc tính dữ liệu, dữ liệu dạy AI đúng/thiếu, kiểm tra thẻ dữ liệu",
    codes: ["3.B3.MR1", "3.C4.1", "3.C4.MR1", "3.D2.1", "3.D2.2", "3.D2.3", "3.D2.MR1"],
  },
  M: {
    name: "Học máy, luật 'nếu… thì…'",
    description: "Cấu trúc nếu...thì..., học máy trên dữ liệu, phân loại/dự đoán, Teachable Machine, huấn luyện AI",
    codes: ["3.C5.1", "3.C5.MR1", "3.C5.2", "3.C5.4", "3.C5.MR2", "3.D1.1"],
  },
};

// Tra cứu nhóm từ mã chỉ báo
function getAIGroup(code) {
  const cleanCode = String(code || "").replace(/[\[\]()]/g, "").replace(/^Mã\s*/i, "").trim();
  for (const [groupKey, grp] of Object.entries(AI_GROUP_DEFINITIONS)) {
    if (grp.codes.includes(cleanCode)) {
      return groupKey;
    }
  }
  // Dự phòng tra cứu theo tiền tố
  if (cleanCode.startsWith("3.A1.2") || cleanCode === "3.A1.MR1") return "T";
  if (cleanCode.startsWith("3.A1.3") || cleanCode === "3.A1.MR2" || cleanCode === "3.A2.MR2") return "P";
  if (cleanCode.startsWith("3.A1.4") || cleanCode.startsWith("3.A1.5") || cleanCode === "3.A1.MR3" || cleanCode === "3.B3.1") return "R";
  if (cleanCode.startsWith("3.A3") || cleanCode === "3.B2.1") return "K";
  if (cleanCode.startsWith("3.D2") || cleanCode.startsWith("3.C4") || cleanCode === "3.B3.MR1") return "D";
  if (cleanCode.startsWith("3.C5") || cleanCode.startsWith("3.D1")) return "M";
  if (cleanCode.startsWith("3.A1") || cleanCode.startsWith("3.A2")) return "N";
  return "N";
}

// ============================================================================
// BƯỚC 3 – MA TRẬN VÀ MÔ TẢ HOẠT ĐỘNG (1A–4E)
// ============================================================================
const AI_ACTIVITIES = {
  "1A": { name: "Đoán trước, xem sau", desc: "chiếu câu hỏi, HS đoán AI trả lời gì, rồi chiếu đáp án." },
  "1B": { name: "Tìm lỗi", desc: "chiếu kết quả AI có 1 lỗi cài sẵn, HS phát hiện." },
  "1C": { name: "Thật hay AI tạo?", desc: "chiếu 2 ảnh, HS giơ thẻ chọn ảnh do AI tạo." },
  "1D": { name: "Bình chọn thẻ màu", desc: "HS giơ thẻ Đ/S, Nên/Không nên, Hỗ trợ/Làm thay." },
  "1E": { name: "Thầy làm, trò đoán", desc: "GV demo công cụ, dừng hỏi 'máy làm gì tiếp?'." },
  "2A": { name: "Kéo vào hai ô", desc: "HS kéo thẻ vào hai ô đối lập trên màn hình tương tác." },
  "2B": { name: "Nối cặp", desc: "nối thiết bị với công dụng, 'nếu' với 'thì'." },
  "2C": { name: "Khoanh chỗ sai", desc: "phóng to ảnh/câu trả lời, khoanh phần AI nhầm." },
  "2D": { name: "Xếp thứ tự", desc: "kéo các bước vào đúng thứ tự." },
  "2E": { name: "Vẽ và ký", desc: "vẽ sản phẩm hoặc ký cam kết trên màn hình tương tác." },
  "3A": { name: "Hỏi, ghi, tắt máy, tự làm", desc: "mỗi cặp xin AI 1 gợi ý, ghi vào phiếu, tắt máy rồi tự làm." },
  "3B": { name: "Thử hai lần", desc: "chạy công cụ với dữ liệu đúng, rồi có 1 thẻ sai, so kết quả." },
  "3C": { name: "Máy nói, sách nói", desc: "ghi câu trả lời AI cạnh SGK/bản đồ, đánh dấu chỗ khác nhau." },
  "3D": { name: "Phiếu trên máy", desc: "điền phiếu tình huống (thông tin giả)." },
  "3E": { name: "Đổi phiếu kiểm tra", desc: "cặp này làm xong đổi cho cặp khác kiểm tra." },
  "4A": { name: "Một bạn đóng vai AI", desc: "HS đọc phiếu GV viết sẵn (có lỗi), lớp kiểm tra." },
  "4B": { name: "Dạy máy bằng thẻ", desc: "nhóm xem 5–6 thẻ đã xếp nhóm rồi đoán thẻ mới." },
  "4C": { name: "Che tranh đoán", desc: "che một phần ảnh, HS đoán, giải thích vì sao AI dễ nhầm." },
  "4D": { name: "Đi tìm AI", desc: "dán ảnh quanh lớp, nhóm chọn Có AI/Không AI." },
  "4E": { name: "Bảng hai cột", desc: "HS dán thẻ vào bảng (AI gợi ý/Em chọn, Hỗ trợ/Làm thay…)." },
};

// Ma trận hoạt động theo Nhóm và Điều kiện: [Chính / Phụ]
const AI_MATRIX = {
  N: {
    ĐK1: { main: "1D", sub: "1A", dk4: "4D" },
    ĐK2: { main: "2A", sub: "2B", dk4: "4D" },
    ĐK3: { main: "3D", sub: "3C", dk4: "4D" },
    ĐK4: { main: "4D", sub: "4E", dk4: "4D" },
  },
  T: {
    ĐK1: { main: "1E", sub: "1D", dk4: "4A" },
    ĐK2: { main: "2A", sub: "2E", dk4: "4A" },
    ĐK3: { main: "3A", sub: "3E", dk4: "4A" },
    ĐK4: { main: "4A", sub: "4E", dk4: "4A" },
  },
  P: {
    ĐK1: { main: "1D", sub: "1A", dk4: "4A" },
    ĐK2: { main: "2A", sub: "2E", dk4: "4A" },
    ĐK3: { main: "3D", sub: "3E", dk4: "4A" },
    ĐK4: { main: "4A", sub: "4E", dk4: "4A" },
  },
  R: {
    ĐK1: { main: "1D", sub: "1A", dk4: "4A" },
    ĐK2: { main: "2A", sub: "2D", dk4: "4A" },
    ĐK3: { main: "3D", sub: "3E", dk4: "4A" },
    ĐK4: { main: "4A", sub: "4E", dk4: "4A" },
  },
  K: {
    ĐK1: { main: "1B", sub: "1C", dk4: "4A" },
    ĐK2: { main: "2C", sub: "2A", dk4: "4A" },
    ĐK3: { main: "3C", sub: "3E", dk4: "4A" },
    ĐK4: { main: "4A", sub: "4C", dk4: "4A" },
  },
  D: {
    ĐK1: { main: "1D", sub: "1B", dk4: "4B" },
    ĐK2: { main: "2A", sub: "2C", dk4: "4B" },
    ĐK3: { main: "3B", sub: "3E", dk4: "4B" },
    ĐK4: { main: "4B", sub: "4C", dk4: "4B" },
  },
  M: {
    ĐK1: { main: "1E", sub: "1A", dk4: "4B" },
    ĐK2: { main: "2D", sub: "2A", dk4: "4B" },
    ĐK3: { main: "3B", sub: "3D", dk4: "4B" },
    ĐK4: { main: "4B", sub: "4E", dk4: "4B" },
  },
};

// ============================================================================
// HÀM TỔNG HỢP KẾ HOẠCH TÍCH HỢP AI (5 BƯỚC)
// ============================================================================
function resolveAIPlan(infrastructureLevel, aiCodes = [], teacherSuggestions = "") {
  const cond = getCondition(infrastructureLevel);
  const condId = cond.id;

  // Lấy danh sách nhóm
  const groups = [];
  const groupCodesMap = {};
  (aiCodes || []).forEach((c) => {
    const ma = c.ma || c;
    const grp = getAIGroup(ma);
    if (!groups.includes(grp)) {
      groups.push(grp);
      groupCodesMap[grp] = [];
    }
    groupCodesMap[grp].push(ma);
  });

  // Nếu không có nhóm nào, mặc định nhóm N
  if (groups.length === 0) {
    groups.push("N");
    groupCodesMap["N"] = ["3.A1.1"];
  }

  const primaryGroup = groups[0];
  const primaryRow = AI_MATRIX[primaryGroup] || AI_MATRIX["N"];
  const condMatrix = primaryRow[condId] || primaryRow["ĐK1"];

  // Hoạt động chính của nhóm thứ nhất
  const mainActCode = condMatrix.main;
  const mainAct = {
    code: mainActCode,
    name: AI_ACTIVITIES[mainActCode]?.name || "",
    desc: AI_ACTIVITIES[mainActCode]?.desc || "",
    group: primaryGroup,
    groupName: AI_GROUP_DEFINITIONS[primaryGroup]?.name || "",
  };

  // Hoạt động thứ hai:
  // Nếu có 2 chỉ báo khác nhóm: hoạt động phụ của chỉ báo thứ hai
  let secondAct = null;
  if (groups.length > 1) {
    const secondaryGroup = groups[1];
    const secRow = AI_MATRIX[secondaryGroup] || AI_MATRIX["N"];
    const secCondMatrix = secRow[condId] || secRow["ĐK1"];
    const secCode = secCondMatrix.sub || secCondMatrix.main;
    secondAct = {
      code: secCode,
      name: AI_ACTIVITIES[secCode]?.name || "",
      desc: AI_ACTIVITIES[secCode]?.desc || "",
      group: secondaryGroup,
      groupName: AI_GROUP_DEFINITIONS[secondaryGroup]?.name || "",
      isSecondaryGroup: true,
    };
  }

  // Hoạt động nhỏ của ĐK4 làm phần chốt (áp dụng cho ĐK1, ĐK2, ĐK3)
  let dk4ClosingAct = null;
  if (condId !== "ĐK4") {
    const dk4Code = condMatrix.dk4 || "4E";
    dk4ClosingAct = {
      code: dk4Code,
      name: AI_ACTIVITIES[dk4Code]?.name || "",
      desc: AI_ACTIVITIES[dk4Code]?.desc || "",
    };
  }

  // Các quy tắc nghiệp vụ đặc thù
  const specialRules = [];
  if (condId === "ĐK3") {
    specialRules.push("ĐIỀU KIỆN 3 (Phòng máy tính): Bắt buộc phải có bước 'tắt máy, tự làm' hoặc bước đối chiếu với SGK / tranh ảnh / bản đồ / đo đạc thực tế.");
  }
  if (groups.includes("K") || aiCodes.some((c) => (c.ma || c).includes("3.A3") || (c.ma || c).includes("3.B2.1"))) {
    specialRules.push("NHÓM K (Kiểm chứng, AI có thể sai): Bắt buộc phải cài sẵn ít nhất 1 lỗi sai trong câu trả lời / hình ảnh của AI và có bước cho học sinh phát hiện, kiểm tra lại.");
  }
  if (teacherSuggestions && teacherSuggestions.trim()) {
    specialRules.push(`ƯU TIÊN GỢI Ý CỦA GIÁO VIÊN: "${teacherSuggestions.trim()}" (miễn là an toàn và phù hợp điều kiện ${condId}).`);
  }

  return {
    condition: condId,
    conditionName: cond.name,
    groups,
    groupCodesMap,
    mainAct,
    secondAct,
    dk4ClosingAct,
    specialRules,
    teacherSuggestions: teacherSuggestions.trim(),
  };
}

// ============================================================================
// XÂY DỰNG LỜI CHỈ DẪN 5 BƯỚC ĐƯA VÀO PROMPT CHO GEMINI
// ============================================================================
function buildAIInstructionPrompt(plan) {
  const { condition, conditionName, groups, mainAct, secondAct, dk4ClosingAct, specialRules } = plan;

  const actDescriptions = [];
  actDescriptions.push(
    `- Hoạt động chính [Mã ${mainAct.code} - ${mainAct.name}]: ${mainAct.desc} (Gắn với nhóm ${mainAct.group}: ${mainAct.groupName})`
  );

  if (secondAct) {
    actDescriptions.push(
      `- Hoạt động phụ kết hợp [Mã ${secondAct.code} - ${secondAct.name}]: ${secondAct.desc} (Gắn với nhóm ${secondAct.group}: ${secondAct.groupName})`
    );
  }

  if (dk4ClosingAct) {
    actDescriptions.push(
      `- Hoạt động nhỏ làm phần chốt [Mã ${dk4ClosingAct.code} - ${dk4ClosingAct.name}]: ${dk4ClosingAct.desc} (Để tiết học đa dạng mà đơn giản)`
    );
  }

  const specialSection = specialRules.length
    ? `LƯU Ý ĐẶC THÙ BẮT BUỘC:\n` + specialRules.map((r) => `* ${r}`).join("\n")
    : "";

  return `QUY CHUẨN 5 BƯỚC BẮT BUỘC KHI TÍCH HỢP TRÍ TUỆ NHÂN TẠO (AI):

BƯỚC 1 – ĐIỀU KIỆN THỰC TẾ:
- ${condition}: ${conditionName}.

BƯỚC 2 – NHÓM CHỈ BÁO:
- Các nhóm được chọn: ${groups.join(", ")}.

BƯỚC 3 – HOẠT ĐỘNG TÍCH HỢP ĐÃ XÁC ĐỊNH THEO MA TRẬN:
${actDescriptions.join("\n")}
${specialSection ? "\n" + specialSection : ""}

BƯỚC 4 – VỊ TRÍ CHÈN TRONG KẾ HOẠCH BÀI DẠY:
- Vị trí: Chèn vào cột "Hoạt động của giáo viên", ưu tiên CUỐI hoạt động "Khám phá" hoặc CUỐI hoạt động "Luyện tập, thực hành" (hoặc cuối "Vận dụng, trải nghiệm" nếu không có chỗ khác phù hợp).
- KHÔNG chèn vào giữa các lời thoại bài học gốc. Tạo thêm một bước mới hoàn chỉnh gồm cả việc của GV và việc tương ứng của HS.
- Mỗi bài dạy chỉ chèn đúng 1 khối "*Tích hợp AI:" (tổng thời lượng 5–10 phút).

BƯỚC 5 – ĐỊNH DẠNG KHỐI TÍCH HỢP BẮT BUỘC (VIẾT CHÍNH XÁC NHƯ SAU):
Ở trường "gv" của bước đó, viết đúng định dạng:
*Tích hợp AI:
- <Nội dung hoạt động gắn với tích hợp 1: Giáo viên làm gì theo hoạt động ${mainAct.code} (${mainAct.name})>
- <Nội dung hoạt động gắn với tích hợp 2: ${secondAct ? `Theo hoạt động ${secondAct.code}` : dk4ClosingAct ? `Theo hoạt động ${dk4ClosingAct.code} làm phần chốt / HS tự thực hành` : "HS độc lập làm việc / tương tác"}>
- GV liên hệ giáo dục: <1–2 câu liên hệ giáo dục đạo đức, an toàn, hoặc giá trị bài học>

Ở trường "hs" tương ứng của bước đó:
- <Hành động tương ứng song hành của học sinh tham gia hoạt động 1>
- <Hành động tương ứng song hành của học sinh tham gia hoạt động 2 / thực hành>
- <Học sinh lắng nghe và ghi nhớ lời dặn dò của giáo viên>

ĐẶC ĐIỂM BẮT BUỘC CỦA KHỐI TÍCH HỢP AI:
1. Dòng đầu tiên của trường "gv" phải đúng từng ký tự: "*Tích hợp AI:"
2. Ở giữa có 2 đến 3 gạch đầu dòng ngắn gọn (mỗi gạch đầu dòng bắt đầu bằng "- ").
3. Dòng cuối cùng của trường "gv" phải bắt đầu bằng: "- GV liên hệ giáo dục: "
4. Tổng dung lượng toàn khối từ 80 đến 150 từ (tương đương 5–10 phút trên lớp).
5. TUYỆT ĐỐI KHÔNG GHI MÃ CHỈ BÁO (như 3.A1.1 hay 1D) bên trong lời văn của khối này (chỉ mã NLS mới ghi mã_nls).
6. TÔN TRỌNG NỘI DUNG GỐC: Khối tích hợp này chỉ bổ sung thêm vào cuối hoạt động phù hợp, TUYỆT ĐỐI KHÔNG LÀM MẤT BẤT KỲ CÂU TỪ HAY HOẠT ĐỘNG BÀI DẠY GỐC NÀO CỦA GIÁO VIÊN.`;
}

// ============================================================================
// HÀM TẠO KHỐI TÍCH HỢP AI MẪU (DỰ PHÒNG HOẶC CHUẨN HÓA KHI GEMINI CHƯA TẠO)
// ============================================================================
function generateDefaultAIBlock(plan) {
  const { condition, mainAct, secondAct, dk4ClosingAct } = plan;
  const lines = ["*Tích hợp AI:"];

  lines.push(`- GV tổ chức hoạt động ${mainAct.name}: ${mainAct.desc}`);

  if (secondAct) {
    lines.push(`- GV kết hợp hoạt động ${secondAct.name}: ${secondAct.desc}`);
  } else if (dk4ClosingAct) {
    lines.push(`- GV chốt nhanh bằng hoạt động ${dk4ClosingAct.name}: ${dk4ClosingAct.desc}`);
  } else if (condition === "ĐK3") {
    lines.push(`- GV hướng dẫn học sinh tắt máy tính, đối chiếu câu trả lời với SGK và hoàn thiện phiếu tự làm.`);
  } else {
    lines.push(`- GV hướng dẫn học sinh độc lập suy nghĩ, hoàn thành nhiệm vụ thực tế và trao đổi cùng bạn.`);
  }

  lines.push(
    `- GV liên hệ giáo dục: Nhắc nhở các em luôn sử dụng AI như một trợ lí hỗ trợ, rèn luyện tư duy độc lập và kiểm chứng thông tin cẩn thận.`
  );

  return lines.join("\n");
}

function generateDefaultAIHsBlock(plan) {
  const { condition } = plan;
  const lines = [
    "- HS tích cực tham gia hoạt động, quan sát và làm theo hướng dẫn của giáo viên.",
    condition === "ĐK3"
      ? "- HS ghi chép thông tin cần thiết, tắt máy tính và tự giác làm bài tập theo nhóm."
      : "- HS chủ động tương tác, phân biệt và hoàn thành nhiệm vụ được giao.",
    "- HS chăm chú lắng nghe, ghi nhớ và thực hiện tốt lời dặn dò của giáo viên.",
  ];
  return lines.join("\n");
}

function normalizeAIBlock(gvRaw, hsRaw, plan) {
  let gv = String(gvRaw || "").trim();
  let hs = String(hsRaw || "").trim();

  // Đảm bảo dòng đầu đúng là "*Tích hợp AI:"
  if (!gv.startsWith("*Tích hợp AI:")) {
    // Có thể Gemini viết "* Tích hợp AI:" hoặc "Tích hợp AI:"
    gv = gv.replace(/^\*?\s*Tích hợp\s*(?:Trí tuệ nhân tạo\s*)?AI\s*[:\-–]?\s*/i, "");
    gv = `*Tích hợp AI:\n${gv}`;
  }

  // Đảm bảo có dòng "- GV liên hệ giáo dục:"
  if (!gv.includes("GV liên hệ giáo dục:") && !gv.includes("liên hệ giáo dục:")) {
    gv += `\n- GV liên hệ giáo dục: Nhắc nhở học sinh luôn chủ động tư duy, sử dụng công nghệ an toàn và có trách nhiệm.`;
  } else {
    // Chuẩn hóa thành đúng cú pháp "- GV liên hệ giáo dục:"
    gv = gv.replace(/(?:^|\n)[-+•*]?\s*(?:GV\s*)?liên hệ giáo dục\s*[:\-–]\s*/i, "\n- GV liên hệ giáo dục: ");
  }

  // Đảm bảo HS có việc song hành
  if (!hs || hs.length < 15) {
    hs = generateDefaultAIHsBlock(plan);
  }

  return { gv: gv.trim(), hs: hs.trim() };
}

module.exports = {
  getCondition,
  getAIGroup,
  AI_GROUP_DEFINITIONS,
  AI_ACTIVITIES,
  AI_MATRIX,
  resolveAIPlan,
  buildAIInstructionPrompt,
  generateDefaultAIBlock,
  generateDefaultAIHsBlock,
  normalizeAIBlock,
};

