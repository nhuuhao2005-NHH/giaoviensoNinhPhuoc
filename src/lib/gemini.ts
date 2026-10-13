import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  PRIMARY_DIGITAL_INDICATORS,
  PRIMARY_AI_INDICATORS,
} from "./digital-competency-framework";

export async function generateLessonWithGemini({
  apiKey,
  subject,
  grade = "Lớp 3",
  lessonTitle,
  duration,
  learningObjectives,
  infrastructureLevel,
  integrateDigital = true,
  integrateAI = true,
  selectedNLS = [],
  selectedAI = [],
  teacherSuggestions = "",
  uploadedPlanContent = "",
}: {
  apiKey?: string;
  subject: string;
  grade?: string;
  lessonTitle: string;
  duration: string;
  learningObjectives: string;
  infrastructureLevel: string;
  integrateDigital?: boolean;
  integrateAI?: boolean;
  selectedNLS?: string[];
  selectedAI?: string[];
  teacherSuggestions?: string;
  uploadedPlanContent?: string;
}) {
  const activeKey = apiKey || process.env.GEMINI_API_KEY;

  if (!activeKey) {
    throw new Error(
      "Chưa có Gemini API Key. Vui lòng bấm nút 'Cài API Key' màu vàng trên thanh công cụ để nhập khóa API miễn phí từ Google AI Studio."
    );
  }

  const genAI = new GoogleGenerativeAI(activeKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  // Indicator lookup for context
  const nlsContext = PRIMARY_DIGITAL_INDICATORS.map(
    (i) => `[${i.code}] (${i.domainName}): ${i.description}`
  ).join("\n");

  const aiContext = PRIMARY_AI_INDICATORS.map(
    (i) => `[${i.code}] (${i.strandName}): ${i.description}`
  ).join("\n");

  const nlsSelectionText =
    selectedNLS.length > 0
      ? `GIÁO VIÊN ĐÃ CHỈ ĐỊNH CÁC MÃ NLS SAU (BẮT BUỘC SỬ DỤNG): ${selectedNLS.join(", ")}`
      : `GIÁO VIÊN CHƯA CHỌN MÃ CỤ THỂ: Hãy tự động chọn 2-3 mã chỉ báo NLS phù hợp nhất từ danh sách NLS Lớp 1-3.`;

  const aiSelectionText =
    selectedAI.length > 0
      ? `GIÁO VIÊN ĐÃ CHỈ ĐỊNH CÁC MÃ AI SAU (BẮT BUỘC SỬ DỤNG): ${selectedAI.join(", ")}`
      : `GIÁO VIÊN CHƯA CHỌN MÃ CỤ THỂ: Hãy tự động chọn 1-2 mã chỉ báo AI phù hợp nhất từ danh sách AI Lớp 3.`;

  const uploadedPlanNote = uploadedPlanContent
    ? `=== NỘI DUNG KẾ HOẠCH BÀI DẠY GỐC ĐƯỢC TẢI LÊN ===
${uploadedPlanContent}

=== HƯỚNG DẪN XỬ LÝ NỘI DUNG TỪ BÀI DẠY GỐC ===
1. TỰ ĐỘNG TRÍCH XUẤT CHÍNH XÁC TÊN BÀI DẠY từ nội dung bài gốc để ghi vào dòng: BÀI: [TÊN BÀI DẠY].
2. GIỮ NGUYÊN TOÀN BỘ MỤC "1. Kiến thức" (chứa đầy đủ các Yêu cầu cần đạt của tiết học) từ Kế hoạch bài dạy gốc.
3. Kế thừa các năng lực chung, năng lực đặc thù và phẩm chất từ bài gốc, bổ sung các dòng *Tích hợp Năng lực số và *Tích hợp Trí tuệ nhân tạo (AI).
4. Giữ vững tiến trình các hoạt động của bài gốc nhưng cấu trúc lại thành 4 hoạt động chuẩn CV 2345 (chia rõ: Hoạt động của giáo viên | Hoạt động của học sinh) và lồng ghép học liệu số, công cụ AI theo các mã chỉ báo đã chọn.`
    : "";

  const prompt = `
Bạn là chuyên gia giáo dục Tiểu học tại Ninh Phước, am hiểu sâu sắc Chương trình GDPT 2018 cấp Tiểu học (đặc biệt là khối Lớp 3) và chuyển đổi số sư phạm.
Nhiệm vụ của bạn là soạn KẾ HOẠCH BÀI DẠY CẤP TIỂU HỌC chuẩn xác 100% THEO ĐÚNG CẤU TRÚC SAU:

=== CẤU TRÚC KẾ HOẠCH BÀI DẠY BẮT BUỘC (CHUẨN CV 2345) ===
KẾ HOẠCH BÀI DẠY
MÔN: ${subject.toUpperCase()} ; LỚP: ${grade.toUpperCase()}
BÀI: ${lessonTitle ? lessonTitle.toUpperCase() : "[TRÍCH XUẤT TỪ KẾ HOẠCH BÀI DẠY GỐC]"}
Ngày soạn: .../.../...

I. YÊU CẦU CẦN ĐẠT:
1. Kiến thức:
- Nêu rõ các yêu cầu cần đạt về kiến thức, kĩ năng môn học theo Chương trình GDPT 2018.
2. Năng lực: (Năng lực tự chủ, tự học; năng lực giao tiếp, hợp tác; năng lực giải quyết vấn đề và sáng tạo; năng lực đặc thù môn học).
- Năng lực tự chủ, tự học: ...
- Năng lực giao tiếp, hợp tác: ...
- Năng lực giải quyết vấn đề và sáng tạo: ...
- Năng lực đặc thù môn ${subject}: ...
3. Phẩm chất: (Yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm).
- ...
${
  integrateDigital
    ? `*Tích hợp Năng lực số: (Trích dẫn chính xác mã chỉ báo, ví dụ: [Mã 2.1.CB1a], [Mã 1.1.CB1b]... đi kèm hành vi cụ thể của học sinh tiểu học).`
    : ""
}
${
  integrateAI
    ? `*Tích hợp Trí tuệ nhân tạo (AI): (Trích dẫn chính xác mã chỉ báo AI Lớp 3, ví dụ: [Mã 3.A1.1], [Mã 3.A2.1], [Mã 3.C5.1]... đi kèm hành vi cụ thể của học sinh).`
    : ""
}

II. ĐỒ DÙNG DẠY HỌC: Phân định rõ đồ dùng của Giáo viên và đồ dùng của Học sinh.
1. Giáo viên:
- Ti vi/máy chiếu, bài giảng điện tử tương tác...
- Học liệu số cụ thể (trò chơi tương tác Wordwall/Quizizz/PowerPoint, video tư liệu, công cụ AI/mô phỏng minh họa...).
2. Học sinh:
- Sách giáo khoa, vở bài tập, đồ dùng học tập môn học...
- (Nếu có): Bảng con, thẻ học tập hoặc thiết bị theo nhóm.

III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU: (Chia thành 2 cột: Hoạt động của giáo viên và Hoạt động của học sinh)
Gồm 4 hoạt động:
1. Khởi động (Khoảng 5 phút)
- Mục tiêu: ... [Ghi rõ mã NLS / AI nếu có tích hợp]
- Hoạt động của giáo viên:
  + (Tổ chức hoạt động/trò chơi khởi động gắn với học liệu số...)
- Hoạt động của học sinh:
  + (Hào hứng tham gia tương tác, kết nối vào bài mới...)

2. Khám phá (Khoảng 12 - 15 phút)
- Mục tiêu: ... [Ghi rõ mã NLS / AI tích hợp]
- Hoạt động của giáo viên:
  + (Trình chiếu tranh ảnh/mô hình/video số, câu hỏi gợi mở, hướng dẫn học sinh thảo luận...)
- Hoạt động của học sinh:
  + (Quan sát, thảo luận nhóm, nêu ý kiến, phát hiện kiến thức mới...)

3. Luyện tập, thực hành (Khoảng 10 - 12 phút)
- Mục tiêu: ... [Ghi rõ mã NLS / AI tích hợp]
- Hoạt động của giáo viên:
  + (Giao bài tập/nhiệm vụ thực hành, tổ chức trò chơi tương tác củng cố...)
- Hoạt động của học sinh:
  + (Làm bài, thực hành, chữa bài trên bảng lớp/thiết bị, nhận xét...)

4. Vận dụng, trải nghiệm (Khoảng 3 - 5 phút)
- Mục tiêu: ... [Ghi rõ mã NLS / AI tích hợp]
- Hoạt động của giáo viên:
  + (Liên hệ thực tế đời sống, hướng dẫn thói quen an toàn và đạo đức số...)
- Hoạt động của học sinh:
  + (Liên hệ bản thân, chia sẻ câu chuyện, ghi nhớ nhắc nhở...)

IV. ĐIỀU CHỈNH SAU BÀI DẠY (Nếu có): Mục bắt buộc theo CV 2345.
- ...........................................................................................................................................
- ...........................................................................................................................................

=== THÔNG TIN BÀI DẠY CỦA GIÁO VIÊN ===
- Môn học: ${subject}
- Lớp: ${grade}
- Tên bài dạy: ${lessonTitle}
- Thời lượng: ${duration}
- Đồ dùng & Thiết bị hiện có: ${infrastructureLevel}
- Yêu cầu cần đạt cốt lõi: ${learningObjectives}
- Tùy chọn tích hợp Năng lực số: ${integrateDigital ? "CÓ" : "KHÔNG"}
- Tùy chọn tích hợp Trí tuệ nhân tạo (AI): ${integrateAI ? "CÓ" : "KHÔNG"}
${integrateDigital ? `- Chỉ đạo NLS: ${nlsSelectionText}` : ""}
${integrateAI ? `- Chỉ đạo AI: ${aiSelectionText}` : ""}
${
  teacherSuggestions
    ? `- GỢI Ý RIÊNG CỦA GIÁO VIÊN: "${teacherSuggestions}" (BẮT BUỘC đưa gợi ý này vào các hoạt động dạy học phù hợp).`
    : ""
}

${uploadedPlanNote}

=== DANH SÁCH MÃ CHỈ BÁO NLS LỚP 1-3 (PL CV 3456) ===
${nlsContext}

=== DANH SÁCH MÃ CHỈ BÁO AI LỚP 3 (PL CV 2422) ===
${aiContext}

=== QUY TẮC SƯ PHẠM QUAN TRỌNG ===
1. Giữ đúng chính xác định dạng tiêu đề (KẾ HOẠCH BÀI DẠY, I. YÊU CẦU CẦN ĐẠT, II. ĐỒ DÙNG DẠY HỌC, III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU, IV. ĐIỀU CHỈNH SAU BÀI DẠY (Nếu có)).
2. Phân tách rành mạch hai phần: "- Hoạt động của giáo viên:" và "- Hoạt động của học sinh:" trong từng hoạt động của mục III.
3. Hoạt động tích hợp phải thiết thực, sinh động, phù hợp lứa tuổi học sinh Tiểu học (${grade}).
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    try {
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const fallbackResult = await fallbackModel.generateContent(prompt);
      return fallbackResult.response.text();
    } catch (fallbackError: unknown) {
      const message =
        error instanceof Error ? error.message : "Đã xảy ra lỗi khi gọi Gemini AI.";
      throw new Error(`Lỗi khởi tạo giáo án từ AI: ${message}`);
    }
  }
}
