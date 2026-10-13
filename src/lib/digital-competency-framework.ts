/**
 * KHUNG THAM CHIẾU NĂNG LỰC SỐ CHO HỌC SINH PHỔ THÔNG VIỆT NAM
 * (Dựa trên hướng dẫn Bộ GD&ĐT, GDPT 2018 và chuẩn DigComp 2.2)
 */

export interface DigitalCompetencyArea {
  id: string;
  name: string;
  code: string;
  description: string;
  indicators: string[];
}

export const DIGITAL_COMPETENCY_FRAMEWORK: DigitalCompetencyArea[] = [
  {
    id: "info-data",
    code: "NLS1",
    name: "Khai thác thông tin và dữ liệu số",
    description: "Khả năng tìm kiếm, chọn lọc, đánh giá và quản lý thông tin số phục vụ việc học tập.",
    indicators: [
      "Xác định từ khóa và tìm kiếm tài liệu, hình ảnh, video học tập an toàn trên Internet",
      "Đánh giá tính tin cậy, khách quan của nguồn học liệu số",
      "Lưu trữ, sắp xếp dữ liệu học tập trên ổ đĩa trực tuyến (Google Drive, OneDrive)",
    ],
  },
  {
    id: "communication-collaboration",
    code: "NLS2",
    name: "Giao tiếp và hợp tác trong môi trường số",
    description: "Khả năng tương tác, chia sẻ và làm việc nhóm hiệu quả qua các nền tảng kỹ thuật số.",
    indicators: [
      "Thảo luận, chia sẻ quan điểm học tập qua bảng cộng tác (Padlet, Linoit)",
      "Làm việc nhóm trực tuyến đồng bộ trên tài liệu chia sẻ (Google Docs, Canva for Education)",
      "Tuân thủ quy tắc văn hóa ứng xử trực tuyến (Netiquette)",
    ],
  },
  {
    id: "content-creation",
    code: "NLS3",
    name: "Sáng tạo nội dung số",
    description: "Khả năng tạo mới và chỉnh sửa các sản phẩm học tập kỹ thuật số.",
    indicators: [
      "Thiết kế sơ đồ tư duy, infographic, bài trình chiếu (Canva, Mindmeister, PowerPoint)",
      "Ghi âm, quay video ngắn hoặc thuyết trình đa phương tiện báo cáo dự án học tập",
      "Hiểu và tôn trọng bản quyền số, trích dẫn nguồn hình ảnh/tài liệu hợp lệ",
    ],
  },
  {
    id: "safety-security",
    code: "NLS4",
    name: "An toàn và bảo vệ môi trường số",
    description: "Khả năng tự bảo vệ thiết bị, dữ liệu cá nhân và sức khỏe khi sử dụng thiết bị số.",
    indicators: [
      "Bảo mật thông tin tài khoản học tập cá nhân",
      "Nhận diện các rủi ro, thông tin lừa đảo, mã độc trên Internet",
      "Cân bằng thời gian học trực tuyến với vận động thể chất",
    ],
  },
  {
    id: "problem-solving",
    code: "NLS5",
    name: "Giải quyết vấn đề bằng công nghệ số",
    description: "Khả năng lựa chọn và sử dụng công cụ số để mô phỏng, phân tích và giải quyết nhiệm vụ bài học.",
    indicators: [
      "Sử dụng phần mềm mô phỏng (PhET, GeoGebra, Stellarium) để khám phá quy luật khoa học",
      "Sử dụng bảng tính (Excel/Sheets) để thu thập, vẽ biểu đồ và xử lý số liệu thí nghiệm",
      "Vận dụng công cụ AI (như hỏi đáp AI có hướng dẫn) để mở rộng kiến thức bài học",
    ],
  },
];

export const POPULAR_EDTECH_TOOLS = [
  { name: "GeoGebra", category: "Mô phỏng Toán học & Hình học 2D/3D", url: "https://www.geogebra.org" },
  { name: "PhET Interactive Simulations", category: "Mô phỏng Vật lý, Hóa học, Sinh học", url: "https://phet.colorado.edu" },
  { name: "Padlet", category: "Bảng cộng tác số, thu thập ý kiến học sinh", url: "https://padlet.com" },
  { name: "Canva Giáo Dục", category: "Thiết kế infographic, poster, bài thuyết trình số", url: "https://www.canva.com" },
  { name: "Quizizz / Kahoot", category: "Trò chơi hóa ôn tập & kiểm tra đánh giá", url: "https://quizizz.com" },
  { name: "Google Forms / Azota", category: "Khảo sát đầu giờ & bài tập đánh giá thường xuyên", url: "https://forms.google.com" },
  { name: "Google Earth", category: "Khám phá địa lý, không gian 3D thế giới", url: "https://earth.google.com" },
];
