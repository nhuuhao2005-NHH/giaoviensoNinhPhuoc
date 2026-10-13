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

  // Prepare string of all indicator codes for context
  const indicatorsContext = PRIMARY_DIGITAL_INDICATORS.map(
    (item) => `[${item.code}] (${item.domainName}): ${item.description}`
  ).join("\n");

  const prompt = `
Bạn là chuyên gia giáo dục Tiểu học tại Việt Nam, am hiểu sâu sắc Chương trình GDPT 2018 cấp Tiểu học và Chuyển đổi số giáo dục.
Nhiệm vụ của bạn là soạn KẾ HOẠCH BÀI DẠY (Giáo án) CẤP TIỂU HỌC chuẩn theo:
👉 **CÔNG VĂN SỐ 2345/BGDĐT-GDTH (Phụ lục 3)**.
👉 **TÍCH HỢP CHÍNH XÁC CÁC MÃ CHỈ BÁO NĂNG LỰC SỐ LỚP 1, 2, 3 (Theo Khung NLS Phụ lục Công văn 3456/BGDĐT)**.

=== THÔNG TIN BÀI DẠY TIỂU HỌC ===
- Môn học: ${subject}
- Lớp: ${grade} (Độ tuổi học sinh tiểu học Lớp 1-3)
- Tên bài dạy: ${lessonTitle}
- Thời lượng: ${duration}
- Yêu cầu cần đạt cốt lõi của bài: ${learningObjectives}
- Điều kiện thiết bị/học liệu: ${infrastructureLevel}

=== DANH SÁCH TOÀN BỘ MÃ CHỈ BÁO NĂNG LỰC SỐ LỚP 1-3 CẦN SỬ DỤNG ===
${indicatorsContext}

=== YÊU CẦU CẤU TRÚC CHUẨN PHỤ LỤC 3 CÔNG VĂN 2345/BGDĐT-GDTH ===

KẾ HOẠCH BÀI DẠY
MÔN: ${subject.toUpperCase()} - ${grade.toUpperCase()}
BÀI: ${lessonTitle.toUpperCase()}
(Thời lượng: ${duration})

I. YÊU CẦU CẦN ĐẠT
1. Năng lực đặc thù:
- Nêu rõ các yêu cầu cần đạt về kiến thức, kĩ năng môn ${subject} theo Chương trình GDPT 2018 cấp Tiểu học mà học sinh cần đạt sau bài học.
2. Năng lực chung:
- Tự chủ và tự học: (Ví dụ: tự giác thực hiện nhiệm vụ học tập, chuẩn bị đồ dùng...).
- Giao tiếp và hợp tác: (Ví dụ: trao đổi, chia sẻ với bạn trong nhóm...).
- Giải quyết vấn đề và sáng tạo: (Ví dụ: biết đưa ra cách làm mới, giải quyết tình huống...).
3. Năng lực số (BẮT BUỘC TRÍCH DẪN ĐÚNG MÃ CHỈ BÁO PHÙ HỢP TỪ DANH SÁCH TRÊN):
- Chọn từ 2 đến 3 mã chỉ báo năng lực số thiết thực nhất với bài học này (Ví dụ: [1.1.CB1a], [2.1.CB1a], [3.1.CB1a], [4.1.CB1a], [5.1.CB1a], [6.3.CB1a]...).
- Với mỗi mã, ghi rõ hành vi cụ thể của học sinh lứa tuổi tiểu học trong bài này.
  Ví dụ mẫu:
  + [Mã 2.1.CB1a]: Học sinh biết chọn và bấm vào đáp án đúng trên trò chơi tương tác (Wordwall/Quizizz/PowerPoint) trên màn hình ti vi/máy chiếu.
  + [Mã 1.1.CB1b]: Học sinh biết quan sát video/hình ảnh học liệu số do giáo viên trình chiếu và chỉ ra chi tiết bài học.
  + [Mã 4.3.CB1a]: Học sinh giữ khoảng cách mắt an toàn khi quan sát màn hình máy chiếu/ti vi của lớp.
4. Phẩm chất:
- Yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm (gắn với sự cẩn thận khi sử dụng đồ dùng, thiết bị số).

II. ĐỒ DÙNG DẠY HỌC
1. Giáo viên:
- Ti vi/máy chiếu, máy tính, bài giảng điện tử tương tác.
- Học liệu số cụ thể: Video sinh động, bài tập trò chơi (Wordwall, Quizizz, PowerPoint tương tác, sách điện tử Hành Trang Số), tranh ảnh số.
2. Học sinh:
- Sách giáo khoa, vở bài tập, đồ dùng học tập môn học.
- (Nếu có điều kiện): Bảng con, thẻ trắc nghiệm (hoặc thiết bị theo nhóm nếu điều kiện cho phép).

III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU
(Tiểu học chuẩn CV 2345: Mỗi hoạt động phải phân định rành mạch giữa HOẠT ĐỘNG CỦA GIÁO VIÊN và HOẠT ĐỘNG CỦA HỌC SINH).

1. HOẠT ĐỘNG 1: KHỞI ĐỘNG (KẾT NỐI) (Khoảng 5 phút)
- Mục tiêu: Tạo tâm thế hào hứng, kết nối vào bài mới. [Ghi rõ mã NLS tích hợp, ví dụ [Mã 2.1.CB1a]]
- Cách tiến hành:
  + Hoạt động của giáo viên: (Tổ chức trò chơi khởi động qua học liệu số/video bài hát/Wordwall...).
  + Hoạt động của học sinh: (Tham gia tương tác, hát múa hoặc chọn đáp án, hào hứng vào bài).

2. HOẠT ĐỘNG 2: KHÁM PHÁ (HÌNH THÀNH KIẾN THỨC MỚI) (Khoảng 12 - 15 phút)
- Mục tiêu: Học sinh khám phá kiến thức cốt lõi của bài. [Ghi rõ mã NLS tích hợp, ví dụ [Mã 1.1.CB1a], [Mã 5.2.CB1b]]
- Cách tiến hành:
  + Hoạt động của giáo viên: (Trình chiếu tranh ảnh/mô hình số, đặt câu hỏi gợi mở, hướng dẫn học sinh quan sát, thảo luận nhóm...).
  + Hoạt động của học sinh: (Quan sát học liệu số, thảo luận, phát biểu ý kiến, rút ra kết luận bài học).

3. HOẠT ĐỘNG 3: LUYỆN TẬP, THỰC HÀNH (Khoảng 10 - 12 phút)
- Mục tiêu: Củng cố và thực hành kiến thức vừa học. [Ghi rõ mã NLS tích hợp, ví dụ [Mã 3.1.CB1a], [Mã 5.1.CB1a]]
- Cách tiến hành:
  + Hoạt động của giáo viên: (Giao bài tập/nhiệm vụ thực hành, tổ chức trò chơi tương tác, theo dõi, hỗ trợ học sinh...).
  + Hoạt động của học sinh: (Làm bài vào vở/bảng con hoặc lên bảng tương tác thực hiện, nhận xét bài của bạn).

4. HOẠT ĐỘNG 4: VẬN DỤNG, TRẢI NGHIỆM (Khoảng 3 - 5 phút)
- Mục tiêu: Vận dụng kiến thức vào thực tế đời sống. [Ghi rõ mã NLS tích hợp, ví dụ [Mã 4.3.CB1a] hoặc [Mã 6.3.CB1a]]
- Cách tiến hành:
  + Hoạt động của giáo viên: (Nêu tình huống thực tế, liên hệ đời sống gia đình/trường lớp, dặn dò về nhà...).
  + Hoạt động của học sinh: (Liên hệ bản thân, chia sẻ câu chuyện, ghi nhớ nhắc nhở).

IV. ĐIỀU CHỈNH SAU BÀI DẠY (MỤC BẮT BUỘC THEO CV 2345)
- ...........................................................................................................................................
- ...........................................................................................................................................

=== NGUYÊN TẮC QUAN TRỌNG KHI SOẠN ===
- Ngôn ngữ, hoạt động PHẢI PHÙ HỢP VỚI TÂM LÝ LỨA TUỔI HỌC SINH LỚP 1, 2, 3 (nhẹ nhàng, trực quan, nhiều hình ảnh, trò chơi học tập vui vẻ).
- Tuyệt đối không giao nhiệm vụ quá khó về công nghệ cho học sinh tiểu học (học sinh tiểu học chủ yếu tương tác trực quan, làm quen thao tác đơn giản, quan sát và hình thành thói quen an toàn số).
- Phải ghi đúng định dạng mã chỉ báo: [Mã X.X.CB1x].
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
