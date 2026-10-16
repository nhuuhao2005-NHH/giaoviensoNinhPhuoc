// ai-integration.js — Phân loại & sinh prompt tích hợp Trí tuệ nhân tạo (AI) Lớp 3 theo module chuẩn.

const PRIMARY_AI_INDICATORS = [
  // Mạch A
  { code: "3.A1.1", group: "N", description: "Nhận biết được một số tình huống sử dụng AI hỗ trợ học sinh trong quá trình học tập." },
  { code: "3.A1.2", group: "T", description: "Nêu được cách sử dụng trợ lí học tập thông minh, ứng dụng học ngôn ngữ để hỗ trợ quá trình học tập." },
  { code: "3.A1.MR1", group: "T", description: "Thực hành sử dụng trợ lí học tập thông minh, ứng dụng học ngôn ngữ." },
  { code: "3.A1.3", group: "P", description: "Phân biệt được giữa việc sử dụng AI như công cụ hỗ trợ (đúng đắn, chủ động, có kiểm soát) và việc để AI làm thay toàn bộ (thụ động, thiếu tự lập)." },
  { code: "3.A1.MR2", group: "P", description: "Nêu được hậu quả của việc phụ thuộc quá mức vào AI, như: giảm khả năng tư duy độc lập và sáng tạo; mất dần kĩ năng giải quyết vấn đề; ảnh hưởng đến sự tự tin và bản lĩnh cá nhân." },
  { code: "3.A1.4", group: "R", description: "Nêu được một số tình huống có thể gây rủi ro hoặc hậu quả không mong muốn khi sử dụng AI." },
  { code: "3.A1.5", group: "R", description: "Trả lời được một câu hỏi trước khi quyết định sử dụng AI trong một tình huống cụ thể, ví dụ: Việc này có cần dùng AI không? Nếu AI đưa ra kết quả sai thì điều gì có thể xảy ra? …" },
  { code: "3.A1.MR3", group: "R", description: "Giải thích được rằng việc suy nghĩ và kiểm tra trước khi dùng AI giúp con người phòng tránh rủi ro, bảo vệ an toàn và quyền riêng tư, đồng thời đảm bảo AI được sử dụng vì mục đích tốt." },
  { code: "3.A2.1", group: "N", description: "Nhận biết được một số ứng dụng hoặc thiết bị có sử dụng AI trong trường học, chẳng hạn như: robot hoặc bảng thông minh, ứng dụng chấm bài hoặc nhận dạng chữ viết." },
  { code: "3.A2.2", group: "N", description: "Nêu được mục đích của việc sử dụng AI trong trường học là hỗ trợ giáo viên và học sinh học tập hiệu quả hơn, giúp: cá nhân hoá việc học theo năng lực từng học sinh; tăng hứng thú học tập thông qua các hoạt động tương tác." },
  { code: "3.A2.MR1", group: "N", description: "Hình dung và mô tả được trường học trong tương lai nơi có sự xuất hiện của một số ứng dụng, thiết bị AI." },
  { code: "3.A2.MR2", group: "P", description: "Đề xuất được một số nguyên tắc khi sử dụng AI trong học tập." },
  { code: "3.A2.3", group: "N", description: "Nêu được các đối tượng trong trường học mà AI có thể hỗ trợ, bao gồm: học sinh, giáo viên, …" },
  { code: "3.A2.MR3", group: "N", description: "Nêu được mục tiêu của AI trong bối cảnh trường học là hỗ trợ tất cả các thành viên của nhà trường, giúp việc dạy và học trở nên dễ dàng, hiệu quả và công bằng hơn." },
  { code: "3.A3.1", group: "K", description: "Nêu được một số ví dụ cụ thể về việc AI có thể sai, như: ứng dụng dịch sai nghĩa từ hoặc câu; AI nhận diện nhầm hình ảnh hoặc khuôn mặt; chatbot đưa ra thông tin không đúng sự thật." },
  { code: "3.A3.2", group: "K", description: "Trình bày được rằng khi sử dụng AI, học sinh cần kiểm tra lại kết quả, so sánh với nhiều nguồn thông tin khác nhau và trao đổi với giáo viên hoặc người lớn để xác minh." },

  // Mạch B
  { code: "3.B2.1", group: "K", description: "Nhận biết và nêu được ví dụ về việc thông tin hoặc sản phẩm do AI tạo ra có thể không đúng với sự thật." },
  { code: "3.B3.1", group: "R", description: "Nhận biết được rằng không nên tạo ra hoặc sử dụng AI cho các mục đích xấu như lừa đảo, bắt nạt hay gây hại cho người khác." },
  { code: "3.B3.MR1", group: "D", description: "Nêu được rằng con người cần cung cấp dữ liệu đúng và đa dạng để AI hoạt động chính xác, công bằng." },

  // Mạch C
  { code: "3.C4.1", group: "D", description: "Trình bày được khái niệm dữ liệu thông qua một số ví dụ." },
  { code: "3.C4.MR1", group: "D", description: "Phân biệt được đặc trưng và thuộc tính của dữ liệu." },
  { code: "3.C5.1", group: "M", description: "Mô tả được cấu trúc nếu … thì … trong việc giải quyết tình huống hoặc phân loại." },
  { code: "3.C5.MR1", group: "M", description: "Nêu được một số công cụ AI đơn giản sử dụng cấu trúc 'nếu … thì …'." },
  { code: "3.C5.2", group: "M", description: "Nêu được đặc điểm chính của học máy là học trên dữ liệu." },
  { code: "3.C5.3", group: "N", description: "Nêu được một số tình huống có thể áp dụng học máy như phân loại rau củ trong nông trại thông minh, dự báo mưa lũ." },
  { code: "3.C5.4", group: "M", description: "Nhận biết được bài toán học máy phân loại và bài toán học máy dự đoán thông qua tình huống cụ thể." },
  { code: "3.C5.MR2", group: "M", description: "Minh họa được bài toán học máy phân loại và bài toán học máy dự đoán bằng các công cụ mã nguồn mở hoặc miễn phí, chẳng hạn: Teachable Machine, Google Colab hoặc các ứng dụng AI học máy trực tuyến tương tự." },

  // Mạch D
  { code: "3.D1.1", group: "M", description: "Trình bày được quá trình đơn giản để huấn luyện AI gồm các bước: thu thập ví dụ và cho AI học từ các ví dụ đó." },
  { code: "3.D2.1", group: "D", description: "Nêu được rằng dữ liệu dùng để dạy AI có thể bị thiếu, nhầm lẫn hoặc không đúng sự thật." },
  { code: "3.D2.2", group: "D", description: "Nêu được một số yêu cầu cơ bản đối với dữ liệu dùng để huấn luyện AI." },
  { code: "3.D2.MR1", group: "D", description: "Thực hành kiểm tra một bộ thẻ dữ liệu mẫu và loại bỏ được các thẻ gán nhãn nhầm, thẻ không đúng sự thật." },
  { code: "3.D2.3", group: "D", description: "Trình bày được rằng nếu dữ liệu sai hoặc không tốt thì AI sẽ không hiệu quả, thậm chí hoạt động sai." },
];

const GROUP_NAMES = {
  N: "Nhận biết",
  T: "Thực hành trợ lí",
  P: "Phân biệt, nguyên tắc",
  R: "Rủi ro, quyền riêng tư, đạo đức",
  K: "Kiểm chứng, AI có thể sai, sản phẩm AI tạo",
  D: "Dữ liệu",
  M: "Học máy, 'nếu… thì…'",
};

const MATRIX = {
  N: { ĐK1: "1D/1A", ĐK2: "2A/2B", ĐK3: "3D/3C", ĐK4: "4D/4E" },
  T: { ĐK1: "1E/1D", ĐK2: "2A/2E", ĐK3: "3A/3E", ĐK4: "4A/4E" },
  P: { ĐK1: "1D/1A", ĐK2: "2A/2E", ĐK3: "3D/3E", ĐK4: "4A/4E" },
  R: { ĐK1: "1D/1A", ĐK2: "2A/2D", ĐK3: "3D/3E", ĐK4: "4A/4E" },
  K: { ĐK1: "1B/1C", ĐK2: "2C/2A", ĐK3: "3C/3E", ĐK4: "4A/4C" },
  D: { ĐK1: "1D/1B", ĐK2: "2A/2C", ĐK3: "3B/3E", ĐK4: "4B/4C" },
  M: { ĐK1: "1E/1A", ĐK2: "2D/2A", ĐK3: "3B/3D", ĐK4: "4B/4E" },
};

const ACTIVITIES_DESC = {
  "1A": "Đoán trước, xem sau (chiếu câu hỏi, HS đoán AI trả lời gì, rồi chiếu đáp án)",
  "1B": "Tìm lỗi (chiếu kết quả AI có 1 lỗi cài sẵn, HS phát hiện)",
  "1C": "Thật hay AI tạo? (chiếu 2 ảnh, HS giơ thẻ chọn ảnh do AI tạo)",
  "1D": "Bình chọn thẻ màu (HS giơ thẻ Đ/S, Nên/Không nên, Hỗ trợ/Làm thay)",
  "1E": "Thầy làm, trò đoán (GV demo công cụ, dừng hỏi 'máy làm gì tiếp?')",
  "2A": "Kéo vào hai ô (HS thao tác trên màn hình)",
  "2B": "Nối cặp (HS thao tác trên màn hình)",
  "2C": "Khoanh chỗ sai (HS thao tác trên màn hình)",
  "2D": "Xếp thứ tự (HS thao tác trên màn hình)",
  "2E": "Vẽ và ký (HS thao tác trên màn hình)",
  "3A": "Hỏi, ghi, tắt máy, tự làm (mỗi cặp xin AI 1 gợi ý, ghi phiếu, tắt máy rồi tự làm)",
  "3B": "Thử hai lần (dữ liệu đúng, rồi có 1 thẻ sai, so kết quả)",
  "3C": "Máy nói, sách nói (ghi câu trả lời AI cạnh SGK/bản đồ, đánh dấu chỗ khác)",
  "3D": "Phiếu trên máy (thông tin giả)",
  "3E": "Đổi phiếu kiểm tra giữa các cặp",
  "4A": "Một bạn đóng vai AI đọc phiếu có lỗi",
  "4B": "Dạy máy bằng thẻ",
  "4C": "Che tranh đoán",
  "4D": "Đi tìm AI (Có AI/Không AI)",
  "4E": "Bảng hai cột",
};

// Bước 1: Thiết bị -> Điều kiện
function getCondition(deviceStr) {
  const s = String(deviceStr || "").toLowerCase();
  if (s.includes("tivi") || s.includes("chiếu") || s.includes("đk1")) return "ĐK1";
  if (s.includes("tương tác") || s.includes("đk2")) return "ĐK2";
  if (s.includes("máy tính") || s.includes("tin học") || s.includes("đk3")) return "ĐK3";
  if (s.includes("bảng") || s.includes("tranh") || s.includes("đk4") || s.includes("không có")) return "ĐK4";
  return "ĐK1";
}

// Bước 2: Mã chỉ báo -> Nhóm
function getGroupOfCode(code) {
  const c = String(code || "").trim();
  const found = PRIMARY_AI_INDICATORS.find((i) => i.code.toLowerCase() === c.toLowerCase());
  return found ? found.group : "N";
}

// Vị trí ưu tiên theo nhóm chỉ báo
function getPreferredActivityForGroup(group) {
  if (["N", "D", "M"].includes(group)) return "Khám phá";
  if (["T", "P", "K"].includes(group)) return "Luyện tập, thực hành";
  if (group === "R") return "Vận dụng, trải nghiệm";
  return "Khám phá";
}

// Môn học -> Nhóm ưu tiên khi GV không chọn mã
function getDefaultGroupsForSubject(mon) {
  const m = String(mon || "").toLowerCase();
  if (m.includes("tiếng việt") || m.includes("văn")) return ["T", "K", "R"];
  if (m.includes("toán")) return ["K", "D", "N"];
  if (m.includes("tự nhiên") || m.includes("tnxh")) return ["K", "M", "N"];
  if (m.includes("trải nghiệm") || m.includes("hđtn")) return ["N", "R", "P", "M"];
  if (m.includes("công nghệ")) return ["R", "M"];
  if (m.includes("đạo đức")) return ["P", "R"];
  if (m.includes("tin học") || m.includes("tin")) return ["M", "D", "R"];
  return ["N", "K", "R"];
}

/**
 * Xây dựng đoạn prompt bổ sung cho AI Integration khi GV tích "Trí tuệ nhân tạo AI".
 * Nếu options.integrateAI === false -> trả về "" (bỏ qua hoàn toàn).
 */
function buildAiModulePrompt(options) {
  const shouldIntegrate = Boolean(
    options.integrateAI === true ||
    (options.integrateAI !== false && options.aiCodes && options.aiCodes.length > 0)
  );

  if (!shouldIntegrate) {
    return `[LƯU Ý: Giáo viên KHÔNG tích hợp Trí tuệ nhân tạo (AI). Để mảng tich_hop_ai rỗng [], không chèn khối *Tích hợp AI trong hoạt động, và không có ghi_chu_tich_hop.]`;
  }

  const mon = options.mon || "Tin học";
  const tiet = options.tiet || "";
  const thietBi = options.infrastructureLevel || "Tivi/máy chiếu";
  const condition = getCondition(thietBi);
  const goiY = options.teacherSuggestions ? options.teacherSuggestions.trim() : "";

  // 1. Phân loại mã chỉ báo đã chọn (tối đa 2 mã)
  let chosenCodes = (options.aiCodes || []).map((c) => ({
    code: c.ma || c.code || "",
    description: c.noi_dung || c.description || "",
  })).filter((c) => Boolean(c.code));

  if (chosenCodes.length > 2) {
    chosenCodes = chosenCodes.slice(0, 2);
  }

  // 2. Xác định nhóm chỉ báo
  let groups = [];
  if (chosenCodes.length > 0) {
    groups = chosenCodes.map((c) => getGroupOfCode(c.code));
  } else {
    // Không có mã: ưu tiên nhóm theo môn học
    groups = getDefaultGroupsForSubject(mon);
  }

  const primaryGroup = groups[0] || "N";
  const secondaryGroup = groups[1] || null;

  // 3. Ma trận hoạt động
  const matrixEntry = MATRIX[primaryGroup] ? MATRIX[primaryGroup][condition] : "1D/1A";
  const [actMain, actSub] = matrixEntry.split("/");
  const dk4Closing = MATRIX[primaryGroup] ? MATRIX[primaryGroup]["ĐK4"].split("/")[0] : "4D";

  // Vị trí ưu tiên chèn
  const preferredActivity = getPreferredActivityForGroup(primaryGroup);

  // Danh sách toàn bộ 32 chỉ báo Lớp 3
  const tableStr = PRIMARY_AI_INDICATORS.map(
    (i) => `- ${i.code} (Nhóm ${i.group} - ${GROUP_NAMES[i.group]}): ${i.description}`
  ).join("\n");

  const promptText = `
================================================================================
[BỔ SUNG – CHỈ ÁP DỤNG KHI GV TÍCH "Trí tuệ nhân tạo AI"]
Đây là phần bổ sung bắt buộc vì giáo viên ĐÃ TÍCH HỢP AI.
Mọi hướng dẫn khác của hệ thống (kể cả phần Năng lực số và giữ nguyên văn 100% nội dung gốc của GV) giữ nguyên, không thay đổi.

DỮ LIỆU ĐẦU VÀO ĐÃ ĐƯỢC PHÂN LOẠI:
- Môn học: ${mon}
- Tiết dạy: ${tiet || "Không rõ tiết (nếu có, chỉ chèn trong tiết này)"}
- Thiết bị lớp học: ${thietBi} -> Điều kiện xác định: ${condition}
- Mã chỉ báo AI do GV chọn: ${chosenCodes.length ? chosenCodes.map((c) => c.code + (c.code.includes("MR") ? " (Mở rộng)" : "")).join(", ") : "Chưa chọn (hãy tự chọn 1 mã phù hợp từ nhóm " + groups.join(", ") + " theo môn " + mon + ")"}
- Gợi ý hoạt động tích hợp của GV: ${goiY || "Không có (tự phân loại theo ma trận)"}
- Hoạt động ưu tiên chèn: "${preferredActivity}" (chỉ chèn ở CUỐI một trong ba hoạt động: "Khám phá", "Luyện tập, thực hành" hoặc "Vận dụng, trải nghiệm")
- Hoạt động ma trận khuyến nghị:
  + Hoạt động chính: ${actMain} - ${ACTIVITIES_DESC[actMain] || ""}
  + Hoạt động phụ: ${actSub} - ${ACTIVITIES_DESC[actSub] || ""}
  + Hoạt động chốt theo ĐK4: ${dk4Closing} - ${ACTIVITIES_DESC[dk4Closing] || ""}

BẢNG 32 MÃ CHỈ BÁO AI LỚP 3 CỦA HỆ THỐNG:
${tableStr}

QUY TẮC BẮT BUỘC THỰC HIỆN:
1. Xác định mã chỉ báo (tối đa 2 mã):
   - Đưa đúng 1 hoặc 2 mã AI vào trường "tich_hop_ai": [{ "ma": "...", "noi_dung": "..." }].
   - Mã có hậu tố MR thì ghi "(Mở rộng)" trong phần Ghi chú tích hợp.
2. Vị trí chèn:
   - MUST chỉ chèn ở CUỐI một trong ba hoạt động: "${preferredActivity}" (hoặc 1 trong 2 hoạt động còn lại: "Khám phá", "Luyện tập, thực hành", "Vận dụng, trải nghiệm" nếu bài không có hoạt động ưu tiên).
   - "Cuối hoạt động" nghĩa là ngay sau bước cuối cùng của giáo viên trong hoạt động đó, trong cột "Hoạt động của giáo viên" (hoạt động của HS để việc đáp ứng hoặc tự làm sản phẩm).
3. ĐÚNG ĐỊNH DẠNG KHỐI TÍCH HỢP AI:
   Khối tích hợp AI được viết vào trường "gv" ở bước cuối của hoạt động đó (hoặc trường "khoi_tich_hop_ai"):
   *Tích hợp AI:
   - <hoạt động gắn với tích hợp: GV làm gì, HS làm gì theo ma trận hoặc theo gợi ý GV>
   - <hoạt động tiếp theo hoặc hoạt động ĐK4 làm phần chốt; HS tự làm sản phẩm>
   - GV liên hệ giáo dục: <1–2 câu gắn với giá trị của bài>

   * Lưu ý cụ thể:
   - Tổng 2–4 gạch hoạt động, mỗi gạch 1–2 câu bắt đầu bằng "GV…"; tổng độ dài 80–150 từ (thời lượng 5–10 phút).
   - Nếu là ĐK3 (Phòng máy tính/tin học): BẮT BUỘC có bước "tắt máy, tự làm" hoặc đối chiếu với SGK/bản đồ/đo thật.
   - Nếu là Nhóm K (Kiểm chứng): BẮT BUỘC có 1 lỗi cài sẵn và bước kiểm tra lại.
   - Luôn nhắc HS không nhập thông tin cá nhân (dùng thông tin giả).
   - Phương án dự phòng: nếu mất mạng hoặc thiết bị lỗi, chuyển sang hoạt động ĐK4 (${dk4Closing}).
   - HS luôn tự làm sản phẩm cuối cùng; AI chỉ đóng vai trò hỗ trợ.
4. "GHI CHÚ TÍCH HỢP" (ghi_chu_tich_hop):
   Thêm trường "ghi_chu_tich_hop" vào JSON (tối đa 3 dòng):
   Dòng 1: Mã chỉ báo đã dùng (kèm "(Mở rộng)" nếu là mã MR).
   Dòng 2: Điều kiện thiết bị (${condition}) và vị trí hoạt động đã chèn.
   Dòng 3: Điểm GV cần kiểm tra trước khi dạy (ví dụ: nội dung AI do GV kiểm duyệt trước, tài khoản/thông tin cá nhân, chuẩn bị phương án dự phòng ${dk4Closing}).
================================================================================
`;

  return promptText;
}

module.exports = {
  PRIMARY_AI_INDICATORS,
  GROUP_NAMES,
  MATRIX,
  ACTIVITIES_DESC,
  getCondition,
  getGroupOfCode,
  getPreferredActivityForGroup,
  getDefaultGroupsForSubject,
  buildAiModulePrompt,
};
