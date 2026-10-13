import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  PRIMARY_DIGITAL_INDICATORS,
  PRIMARY_AI_INDICATORS,
} from "./digital-competency-framework";

export async function generateLessonWithGemini({
  apiKey,
  subject,
  grade = "Lớp 3",
  lessonTitle = "",
  duration = "1 tiết (35 phút)",
  learningObjectives = "",
  infrastructureLevel = "Ti vi / Màn hình tương tác",
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
  lessonTitle?: string;
  duration?: string;
  learningObjectives?: string;
  infrastructureLevel?: string;
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

  // Map selected indicators with details
  const selectedNLSDetails = selectedNLS
    .map((code) => {
      const found = PRIMARY_DIGITAL_INDICATORS.find((i) => i.code === code);
      return found ? `[Mã ${found.code}] (${found.domainName}): ${found.description}` : `[Mã ${code}]`;
    })
    .join("\n");

  const selectedAIDetails = selectedAI
    .map((code) => {
      const found = PRIMARY_AI_INDICATORS.find((i) => i.code === code);
      return found ? `[Mã ${found.code}] (${found.strandName}): ${found.description}` : `[Mã ${code}]`;
    })
    .join("\n");

  // Lookup contexts for reference if none selected
  const nlsReference = PRIMARY_DIGITAL_INDICATORS.slice(0, 15)
    .map((i) => `[Mã ${i.code}]: ${i.description}`)
    .join("\n");

  const aiReference = PRIMARY_AI_INDICATORS.slice(0, 10)
    .map((i) => `[Mã ${i.code}]: ${i.description}`)
    .join("\n");

  const nlsInstruction = integrateDigital
    ? selectedNLS.length > 0
      ? `GIÁO VIÊN ĐÃ CHỌN CÁC MÃ NĂNG LỰC SỐ SAU ĐÂY:
${selectedNLSDetails}
* QUY TẮC BẮT BUỘC VỀ NLS:
- Trong mục "*Tích hợp Năng lực số:", CHỈ ĐƯỢC PHÉP LIỆT KÊ ĐÚNG các mã chỉ báo đã chọn ở trên kèm nội dung của mã và hành vi cụ thể của học sinh.
- TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ BỊA HOẶC BỔ SUNG THÊM BẤT KỲ MÃ CHỈ BÁO NÀO KHÁC NGOÀI DANH SÁCH NÀY!`
      : `GIÁO VIÊN CHỌN TÍCH HỢP NLS NHƯNG CHƯA CHỈ ĐỊNH MÃ CỤ THỂ:
Hãy chọn đúng 1 đến 2 mã chỉ báo NLS phù hợp nhất từ khung chuẩn Lớp 1-3 và ghi rõ mã kèm hành vi học sinh.`
    : `KHÔNG TÍCH HỢP NĂNG LỰC SỐ (Bỏ qua hoàn toàn dòng "*Tích hợp Năng lực số:").`;

  const aiInstruction = integrateAI
    ? selectedAI.length > 0
      ? `GIÁO VIÊN ĐÃ CHỌN CÁC MÃ TRÍ TUỆ NHÂN TẠO (AI) SAU ĐÂY:
${selectedAIDetails}
* QUY TẮC BẮT BUỘC VỀ AI:
- Trong mục "*Tích hợp AI:", CHỈ ĐƯỢC PHÉP LIỆT KÊ ĐÚNG các mã chỉ báo đã chọn ở trên kèm nội dung của mã và hành vi cụ thể của học sinh.
- TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ BỊA HOẶC BỔ SUNG THÊM BẤT KỲ MÃ CHỈ BÁO NÀO KHÁC NGOÀI DANH SÁCH NÀY!`
      : `GIÁO VIÊN CHỌN TÍCH HỢP AI NHƯNG CHƯA CHỈ ĐỊNH MÃ CỤ THỂ:
Hãy chọn đúng 1 mã chỉ báo AI Lớp 3 phù hợp nhất từ khung chuẩn và ghi rõ mã kèm hành vi học sinh.`
    : `KHÔNG TÍCH HỢP AI (Bỏ qua hoàn toàn dòng "*Tích hợp AI:").`;

  const uploadedPlanNote = uploadedPlanContent
    ? `=== NỘI DUNG KẾ HOẠCH BÀI DẠY GỐC ĐƯỢC TẢI LÊN ===
${uploadedPlanContent}

=== HƯỚNG DẪN XỬ LÝ ĐẶC BIỆT TỪ FILE GIÁO ÁN GỐC ===
1. TÊN BÀI: Tự động trích xuất chính xác Tên bài và Tiết (nếu có) từ file gốc để điền vào dòng tiêu đề "BÀI …: [TÊN BÀI]".
2. MỤC "1. Kiến thức:": BẮT BUỘC SAO CHÉP ĐẦY ĐỦ VÀ NGUYÊN VẸN toàn bộ các yêu cầu cần đạt về kiến thức, kĩ năng từ mục "1. Kiến thức" của file giáo án gốc tải lên. Không tóm tắt làm mất nội dung chi tiết.
3. TIẾN TRÌNH HOẠT ĐỘNG: Kế thừa nội dung giảng dạy của bài gốc, nhưng cấu trúc lại thật chuẩn xác theo 4 hoạt động của Công văn 2345/BGDĐT-GDTH và lồng ghép khéo léo các mã chỉ báo NLS/AI đã chọn vào hoạt động của GV và HS.
(LƯU Ý: Nếu bài học là bài luyện tập/ôn tập và bài gốc không có hoạt động Khám phá, thì chuyển thành 3 hoạt động: 1. Khởi động; 2. Luyện tập, thực hành; 3. Vận dụng, trải nghiệm).`
    : "";

  const prompt = `
Bạn là chuyên gia giáo dục Tiểu học tại Ninh Phước, chuyên gia hướng dẫn giáo viên thực hiện Công văn 2345/BGDĐT-GDTH và chuyển đổi số sư phạm.
Nhiệm vụ của bạn là xây dựng KẾ HOẠCH BÀI DẠY chuẩn 100% THEO ĐÚNG CẤU TRÚC VÀ QUY CÁCH CỦA FILE MẪU CHUẨN CỦA PHÒNG GIÁO DỤC (KHBD_MAU.docx):

=== CẤU TRÚC KẾ HOẠCH BÀI DẠY CHUẨN MẪU (KHBD_MAU.docx) ===
KẾ HOẠCH BÀI DẠY
MÔN: ${subject.toUpperCase()} ; LỚP: ${grade.toUpperCase()}
BÀI …: ${lessonTitle ? lessonTitle.toUpperCase() : "[TRÍCH XUẤT CHÍNH XÁC TỪ FILE GỐC]"}
Ngày soạn: … /… /…

I. YÊU CẦU CẦN ĐẠT
1. Kiến thức:
- (Bổ sung đầy đủ theo mục 1. Kiến thức của file giáo án tải lên)
- ...
2. Năng lực: Năng lực tự chủ, tự học; năng lực giải quyết vấn đề và sáng tạo; năng lực giao tiếp và hợp tác.
(Nếu giáo án gốc có nêu Năng lực đặc thù của môn học, hãy bổ sung tiếp sau đó).
3. Phẩm chất: Phẩm chất yêu nước, nhân ái, chăm chỉ, trách nhiệm.
${
  integrateDigital
    ? `*Tích hợp Năng lực số: (Liệt kê đúng mã được chọn kèm nội dung của mã và hành vi của học sinh tiểu học, KHÔNG liệt kê thêm chỉ báo khác)`
    : ""
}
${
  integrateAI
    ? `*Tích hợp AI: (Liệt kê đúng mã được chọn kèm nội dung của mã và hành vi của học sinh tiểu học, KHÔNG liệt kê thêm chỉ báo khác)`
    : ""
}

II. ĐỒ DÙNG DẠY HỌC:
- Giáo viên: …. (chắt lọc trọng tâm, ngắn gọn, phù hợp với thiết bị: ${infrastructureLevel}, bài giảng số, học liệu điện tử...)
- Học sinh: …. (chắt lọc trọng tâm, ngắn gọn: SGK, vở bài tập, đồ dùng học tập môn học...)

III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU:
Tiến trình dạy học phải phân định rành mạch giữa Hoạt động của giáo viên và Hoạt động của học sinh theo từng hoạt động:

1. Khởi động: (khoảng 5 phút)
- Hoạt động của giáo viên:
  + (Tổ chức trò chơi, học liệu số tương tác mở đầu bài học, kết nối bài mới...)
- Hoạt động của học sinh:
  + (Tham gia trò chơi, trả lời câu hỏi, tạo tâm thế tích cực...)

2. Khám phá: (khoảng 15 phút) (LƯU Ý: Nếu bài học không có hoạt động này thì bỏ qua, chuyển sang 2. Luyện tập, thực hành; 3. Vận dụng, trải nghiệm)
- Hoạt động của giáo viên:
  + (Tổ chức cho HS quan sát hình ảnh/video/học liệu số, đặt câu hỏi gợi mở, lồng ghép hoạt động đạt mã [Mã chỉ báo]...)
- Hoạt động của học sinh:
  + (Quan sát, thảo luận nhóm, trả lời, rút ra kiến thức mới...)

3. Luyện tập, thực hành: (khoảng 10 - 12 phút)
- Hoạt động của giáo viên:
  + (Giao bài tập/nhiệm vụ thực hành, tổ chức trò chơi củng cố, hướng dẫn, nhận xét...)
- Hoạt động của học sinh:
  + (Làm bài tập cá nhân/nhóm, chia sẻ kết quả, nhận xét bạn...)

4. Vận dụng, trải nghiệm: (khoảng 3 - 5 phút)
- Hoạt động của giáo viên:
  + (Hướng dẫn liên hệ bài học vào thực tế, củng cố dặn dò, lưu ý an toàn số / văn hóa số nếu có...)
- Hoạt động của học sinh:
  + (Chia sẻ liên hệ bản thân, ghi nhớ thực hiện...)

IV. ĐIỀU CHỈNH SAU BÀI DẠY (Nếu có):
......................................................................................................................................................
......................................................................................................................................................

=== CHỈ ĐẠO TÍCH HỢP CHO BÀI DẠY NÀY ===
- Môn học: ${subject}
- Khối lớp: ${grade}
- Thiết bị & Đồ dùng hiện có: ${infrastructureLevel}
${teacherSuggestions ? `- Gợi ý riêng của giáo viên: "${teacherSuggestions}"` : ""}

${nlsInstruction}

${aiInstruction}

${uploadedPlanNote}

=== QUY TẮC CỐT LÕI BẮT BUỘC ===
1. TUYỆT ĐỐI TUÂN THỦ cấu trúc và từng đề mục như trên.
2. Mục "2. Năng lực:" và "3. Phẩm chất:" phải giữ đúng văn phong chuẩn mực của file KHBD_MAU.docx.
3. Không tự ý bịa thêm mã chỉ báo NLS hoặc AI ngoài những mã giáo viên đã chỉ định.
4. Trong mỗi hoạt động ở Mục III, bắt buộc có đủ 2 phần rõ ràng: "- Hoạt động của giáo viên:" và "- Hoạt động của học sinh:".
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
