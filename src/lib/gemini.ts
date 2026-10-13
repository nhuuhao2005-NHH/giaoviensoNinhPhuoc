import { GoogleGenerativeAI } from "@google/generative-ai";
import { PRIMARY_DIGITAL_INDICATORS } from "./digital-competency-framework";

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
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const indicatorsContext = PRIMARY_DIGITAL_INDICATORS.map(
    (item) => `[${item.code}] (${item.domainName}): ${item.description}`
  ).join("\n");

  const prompt = `
Bạn là chuyên gia giáo dục Tiểu học tại Việt Nam. Hãy soạn KẾ HOẠCH BÀI DẠY CẤP TIỂU HỌC chuẩn xác 100% THEO ĐÚNG CẤU TRÚC sau đây:

=== CẤU TRÚC BẮT BUỘC ===
KẾ HOẠCH BÀI DẠY
MÔN: ${subject.toUpperCase()} ; LỚP: ${grade.toUpperCase()}
BÀI: ${lessonTitle.toUpperCase()}
Ngày soạn: .../.../...

I. YÊU CẦU CẦN ĐẠT:
1. Kiến thức:
- Nêu rõ các kiến thức, kĩ năng cốt lõi học sinh nắm được sau bài học (theo CT GDPT 2018).
2. Năng lực: (Năng lực tự chủ, tự học; năng lực giao tiếp, hợp tác; năng lực giải quyết vấn đề và sáng tạo; năng lực đặc thù môn học).
- Năng lực tự chủ, tự học: ...
- Năng lực giao tiếp, hợp tác: ...
- Năng lực giải quyết vấn đề và sáng tạo: ...
- Năng lực đặc thù môn ${subject}: ...
3. Phẩm chất: (Yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm).
- ...
*Tích hợp Năng lực số: (BẮT BUỘC trích dẫn chính xác từ 2 đến 3 mã chỉ báo phù hợp nhất từ danh sách mã chỉ báo, đi kèm hành vi cụ thể của học sinh tiểu học, ví dụ: [Mã 2.1.CB1a], [Mã 1.1.CB1b], [Mã 4.3.CB1a], [Mã 6.3.CB1a]...).

II. ĐỒ DÙNG DẠY HỌC: Phân định rõ đồ dùng của Giáo viên và đồ dùng của Học sinh.
1. Giáo viên:
- Ti vi/máy chiếu, bài giảng điện tử tương tác...
- Học liệu số cụ thể (trò chơi Wordwall/Quizizz/PowerPoint, video tư liệu, hình ảnh số sinh động...).
2. Học sinh:
- Sách giáo khoa, vở bài tập, đồ dùng học tập môn học...
- (Nếu có): Bảng con, thẻ trắc nghiệm hoặc thiết bị theo nhóm.

III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU: (Chia thành 2 cột: Hoạt động của giáo viên và Hoạt động của học sinh)
Gồm 4 hoạt động:
1. Khởi động (Khoảng 5 phút)
- Mục tiêu: ... [Ghi rõ mã NLS tích hợp, ví dụ [Mã 2.1.CB1a]]
- Hoạt động của giáo viên:
  + (Tổ chức trò chơi khởi động/kết nối bằng học liệu số sinh động...)
- Hoạt động của học sinh:
  + (Tham gia tương tác, hào hứng vào bài học...)

2. Khám phá (Khoảng 12 - 15 phút)
- Mục tiêu: ... [Ghi rõ mã NLS tích hợp, ví dụ [Mã 1.1.CB1b], [Mã 5.2.CB1b]]
- Hoạt động của giáo viên:
  + (Trình chiếu tranh ảnh/mô hình/video số, đặt câu hỏi gợi mở, hướng dẫn quan sát...)
- Hoạt động của học sinh:
  + (Quan sát, thảo luận nhóm, nêu ý kiến, hình thành kiến thức mới...)

3. Luyện tập, thực hành (Khoảng 10 - 12 phút)
- Mục tiêu: ... [Ghi rõ mã NLS tích hợp, ví dụ [Mã 3.1.CB1a], [Mã 5.1.CB1a]]
- Hoạt động của giáo viên:
  + (Giao nhiệm vụ bài tập, tổ chức trò chơi tương tác củng cố, quan sát hỗ trợ...)
- Hoạt động của học sinh:
  + (Thực hành làm bài, tương tác trên bảng lớp/thiết bị, nhận xét đánh giá...)

4. Vận dụng, trải nghiệm (Khoảng 3 - 5 phút)
- Mục tiêu: ... [Ghi rõ mã NLS tích hợp, ví dụ [Mã 4.3.CB1a] hoặc [Mã 6.3.CB1a]]
- Hoạt động của giáo viên:
  + (Liên hệ thực tế đời sống, dặn dò vận dụng kiến thức...)
- Hoạt động của học sinh:
  + (Chia sẻ liên hệ bản thân, ghi nhớ thói quen tốt...)

IV. ĐIỀU CHỈNH SAU BÀI DẠY (Nếu có): Mục bắt buộc theo CV 2345.
- ...........................................................................................................................................
- ...........................................................................................................................................

=== THÔNG TIN BÀI DẠY CỦA GIÁO VIÊN ===
- Môn: ${subject}
- Lớp: ${grade}
- Tên bài: ${lessonTitle}
- Thời lượng: ${duration}
- Yêu cầu cần đạt cốt lõi: ${learningObjectives}
- Điều kiện thiết bị: ${infrastructureLevel}

=== DANH SÁCH MÃ CHỈ BÁO NĂNG LỰC SỐ LỚP 1-3 ĐỂ TRÍCH DẪN ===
${indicatorsContext}

=== NGUYÊN TẮC QUAN TRỌNG ===
- Tuân thủ chính xác từng tiêu đề La Mã (I, II, III, IV) và các tiêu đề con (1, 2, 3).
- Dòng "*Tích hợp Năng lực số:" đặt ngay dưới mục "3. Phẩm chất".
- Trong từng hoạt động của mục III, BẮT BUỘC có 2 phần riêng biệt rõ ràng: "- Hoạt động của giáo viên:" và "- Hoạt động của học sinh:".
- Hoạt động sư phạm phải gần gũi, phù hợp với tâm lý học sinh Tiểu học (${grade}).
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
