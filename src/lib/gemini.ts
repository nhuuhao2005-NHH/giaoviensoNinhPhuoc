import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateLessonWithGemini({
  apiKey,
  subject,
  grade,
  lessonTitle,
  duration,
  learningObjectives,
  infrastructureLevel,
}: {
  apiKey?: string;
  subject: string;
  grade: string;
  lessonTitle: string;
  duration: string;
  learningObjectives: string;
  infrastructureLevel: string;
}) {
  const activeKey = apiKey || process.env.GEMINI_API_KEY;

  if (!activeKey) {
    throw new Error(
      "Chưa có Gemini API Key. Vui lòng nhập API Key trong phần Cài đặt hoặc thiết lập biến môi trường GEMINI_API_KEY trên Vercel."
    );
  }

  const genAI = new GoogleGenerativeAI(activeKey);
  // Using gemini-2.5-flash as default, fallback to gemini-1.5-flash
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
Bạn là chuyên gia giáo dục phổ thông Việt Nam và chuyên gia chuyển đổi số sư phạm.
Nhiệm vụ của bạn là soạn KẾ HOẠCH BÀI DẠY (Giáo án) CHUẨN CÔNG VĂN 5512/BGDĐT-GDTrH với ĐIỂM NHẤN CỐT LÕI là:
TÍCH HỢP RÕ RÀNG, CHÍNH XÁC KHUNG NĂNG LỰC SỐ CHO HỌC SINH.

=== THÔNG TIN BÀI DẠY ===
- Môn học: ${subject}
- Lớp: ${grade}
- Tên bài dạy: ${lessonTitle}
- Thời lượng: ${duration}
- Yêu cầu cần đạt / Nội dung kiến thức: ${learningObjectives}
- Điều kiện thiết bị của trường: ${infrastructureLevel}

=== YÊU CẦU ĐỊNH DẠNG VÀ CẤU TRÚC THEO CV 5512 ===

I. MỤC TIÊU
1. Kiến thức:
- Nêu rõ các kiến thức cốt lõi học sinh nắm được sau bài học.
2. Năng lực:
a) Năng lực chung: Tự chủ và tự học, Giao tiếp và hợp tác, Giải quyết vấn đề và sáng tạo.
b) Năng lực đặc thù của môn học: (theo CT GDPT 2018 của môn ${subject}).
c) NĂNG LỰC SỐ (BẮT BUỘC NÊU RÕ VÀ CỤ THỂ):
- Chỉ ra cụ thể học sinh phát triển năng lực số nào (ví dụ: NLS1: Khai thác thông tin số; NLS2: Giao tiếp & hợp tác số; NLS3: Sáng tạo nội dung số; NLS5: Giải quyết vấn đề bằng công cụ số).
- Nêu rõ hành động đo lường được: Học sinh làm được gì với công cụ số (ví dụ: "Sử dụng phần mềm GeoGebra để xoay và quan sát hình 3D...", "Tương tác và gửi kết quả thảo luận nhóm lên Padlet...").
3. Phẩm chất:
- Chăm chỉ, trung thực, trách nhiệm (gắn với văn hóa ứng xử và bản quyền số).

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU SỐ
1. Giáo viên:
- Thiết bị (máy chiếu, laptop, mạng Internet...)
- Học liệu số & Phần mềm cụ thể: Nêu tên công cụ số cụ thể (ví dụ: GeoGebra, PhET, Padlet, Canva, Quizizz...), đường link truy cập, và học liệu số (video, phiếu học tập số, slide tương tác).
2. Học sinh:
- Thiết bị và học liệu số theo mức độ (${infrastructureLevel}).

III. TIẾN TRÌNH DẠY HỌC (GỒM 4 HOẠT ĐỘNG CHUẨN 5512)
Trong mỗi hoạt động, BẮT BUỘC phải chỉ ra:
- [TÍCH HỢP NĂNG LỰC SỐ]: Sử dụng công cụ số nào, phát triển chỉ số năng lực số nào.
- Đầy đủ 4 bước tổ chức:
  + Bước 1: Chuyển giao nhiệm vụ
  + Bước 2: Thực hiện nhiệm vụ
  + Bước 3: Báo cáo, thảo luận
  + Bước 4: Kết luận, nhận định

Cụ thể 4 hoạt động:
1. HOẠT ĐỘNG 1: MỞ ĐẦU / KHỞI ĐỘNG (Khoảng 5-7 phút)
- Tạo hứng thú hoặc nêu tình huống có vấn đề. Gợi ý tích hợp công cụ khảo sát nhanh (Kahoot, Quizizz, Mentimeter hoặc video trực quan).

2. HOẠT ĐỘNG 2: HÌNH THÀNH KIẾN THỨC MỚI (Khoảng 20-25 phút)
- Khám phá kiến thức trọng tâm. Gợi ý tích hợp mô phỏng trực quan, phần mềm chuyên dụng (GeoGebra, PhET, Google Earth), hoặc thảo luận nhóm trên bảng số (Padlet, Google Docs).

3. HOẠT ĐỘNG 3: LUYỆN TẬP (Khoảng 10-12 phút)
- Củng cố bài học. Gợi ý bài tập tương tác số hoặc trò chơi trắc nghiệm đánh giá nhanh.

4. HOẠT ĐỘNG 4: VẬN DỤNG (Khoảng 3-5 phút và giao về nhà)
- Mở rộng, liên hệ thực tế. Yêu cầu sản phẩm số (ví dụ: tạo infographic tóm tắt bài bằng Canva, quay video ngắn, tìm kiếm tư liệu số có trích dẫn nguồn).

=== LƯU Ý QUAN TRỌNG ===
- Trình bày mạch lạc, trang trọng, văn phong sư phạm chuẩn mực Bộ Giáo dục và Đào tạo Việt Nam.
- Đánh dấu nổi bật các phần [NĂNG LỰC SỐ TÍCH HỢP] và [CÔNG CỤ SỐ ĐỀ XUẤT] để giáo viên dễ dàng theo dõi và đưa vào giáo án thực tế.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    // Retry with gemini-1.5-flash if 2.5-flash is not available for this key
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
