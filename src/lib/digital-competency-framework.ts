/**
 * BẢNG MÃ CHỈ BÁO NĂNG LỰC SỐ LỚP 1, 2, 3 (CẤP TIỂU HỌC)
 * Nguồn: Phụ lục Công văn 3456/BGDĐT & Khung Năng lực số người học
 */

export interface IndicatorItem {
  code: string;
  domainId: number;
  domainName: string;
  description: string;
}

export interface DomainGroup {
  id: number;
  name: string;
  description: string;
  indicators: IndicatorItem[];
}

export const PRIMARY_DIGITAL_INDICATORS: IndicatorItem[] = [
  // Miền 1: Thông tin và dữ liệu
  { code: "1.1.CB1a", domainId: 1, domainName: "Thông tin và dữ liệu", description: "Xác định được nhu cầu thông tin, tìm kiếm dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số." },
  { code: "1.1.CB1b", domainId: 1, domainName: "Thông tin và dữ liệu", description: "Tìm được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng." },
  { code: "1.1.CB1c", domainId: 1, domainName: "Thông tin và dữ liệu", description: "Xác định được các chiến lược tìm kiếm đơn giản." },
  { code: "1.2.CB1a", domainId: 1, domainName: "Thông tin và dữ liệu", description: "Phát hiện được độ tin cậy và độ chính xác của các nguồn chung của dữ liệu, thông tin và nội dung số." },
  { code: "1.3.CB1a", domainId: 1, domainName: "Thông tin và dữ liệu", description: "Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số." },
  { code: "1.3.CB1b", domainId: 1, domainName: "Thông tin và dữ liệu", description: "Nhận biết được nơi để sắp xếp dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường có cấu trúc." },

  // Miền 2: Giao tiếp và hợp tác
  { code: "2.1.CB1a", domainId: 2, domainName: "Giao tiếp và hợp tác", description: "Lựa chọn được các công nghệ số đơn giản để tương tác." },
  { code: "2.1.CB1b", domainId: 2, domainName: "Giao tiếp và hợp tác", description: "Xác định được các phương tiện giao tiếp đơn giản thích hợp cho một bối cảnh cụ thể." },
  { code: "2.2.CB1a", domainId: 2, domainName: "Giao tiếp và hợp tác", description: "Nhận biết được các công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung kỹ thuật số." },
  { code: "2.2.CB1b", domainId: 2, domainName: "Giao tiếp và hợp tác", description: "Nhận biết được phương pháp trích dẫn và ghi nguồn cơ bản." },
  { code: "2.3.CB1a", domainId: 2, domainName: "Giao tiếp và hợp tác", description: "Xác định được các dịch vụ số đơn giản để có thể tham gia vào xã hội." },
  { code: "2.3.CB1b", domainId: 2, domainName: "Giao tiếp và hợp tác", description: "Nhận biết được các công nghệ số đơn giản, phù hợp để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân." },
  { code: "2.4.CB1a", domainId: 2, domainName: "Giao tiếp và hợp tác", description: "Chọn được những công cụ và công nghệ số đơn giản cho các quá trình cộng tác." },
  { code: "2.5.CB1a", domainId: 2, domainName: "Giao tiếp và hợp tác", description: "Phân biệt được các chuẩn mực hành vi đơn giản và biết cách sử dụng công nghệ số và tương tác trong môi trường số." },
  { code: "2.5.CB1b", domainId: 2, domainName: "Giao tiếp và hợp tác", description: "Chọn được các phương thức và chiến lược giao tiếp đơn giản phù hợp trong môi trường số." },
  { code: "2.5.CB1c", domainId: 2, domainName: "Giao tiếp và hợp tác", description: "Phân biệt các khía cạnh đơn giản của sự đa dạng về văn hóa và thế hệ cần được tính đến trong môi trường số." },
  { code: "2.6.CB1a", domainId: 2, domainName: "Giao tiếp và hợp tác", description: "Xác định được danh tính số." },
  { code: "2.6.CB1b", domainId: 2, domainName: "Giao tiếp và hợp tác", description: "Mô tả được những cách đơn giản để bảo vệ danh tiếng trực tuyến của bản thân." },
  { code: "2.6.CB1c", domainId: 2, domainName: "Giao tiếp và hợp tác", description: "Nhận biết được dữ liệu đơn giản do mình tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số." },

  // Miền 3: Sáng tạo nội dung số
  { code: "3.1.CB1a", domainId: 3, domainName: "Sáng tạo nội dung số", description: "Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản." },
  { code: "3.1.CB1b", domainId: 3, domainName: "Sáng tạo nội dung số", description: "Chọn được cách thể hiện bản thân thông qua việc tạo ra các nội dung số đơn giản." },
  { code: "3.2.CB1a", domainId: 3, domainName: "Sáng tạo nội dung số", description: "Chọn được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục đơn giản có nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo." },
  { code: "3.3.CB1a", domainId: 3, domainName: "Sáng tạo nội dung số", description: "Xác định được các quy tắc đơn giản về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số." },
  { code: "3.4.CB1a", domainId: 3, domainName: "Sáng tạo nội dung số", description: "Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản." },

  // Miền 4: An toàn số
  { code: "4.1.CB1a", domainId: 4, domainName: "An toàn số", description: "Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản." },
  { code: "4.1.CB1b", domainId: 4, domainName: "An toàn số", description: "Phân biệt được rủi ro và mối đe dọa đơn giản trong môi trường số." },
  { code: "4.1.CB1c", domainId: 4, domainName: "An toàn số", description: "Chọn lựa được các biện pháp an toàn và bảo mật đơn giản." },
  { code: "4.1.CB1d", domainId: 4, domainName: "An toàn số", description: "Nhận biết được những cách thức đơn giản để quan tâm đến mức độ tin cậy và quyền riêng tư." },
  { code: "4.2.CB1a", domainId: 4, domainName: "An toàn số", description: "Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số." },
  { code: "4.2.CB1b", domainId: 4, domainName: "An toàn số", description: "Nhận biết được các cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn, có khả năng bảo vệ bản thân và người khác." },
  { code: "4.2.CB1c", domainId: 4, domainName: "An toàn số", description: "Nhận diện được các tuyên bố cơ bản trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân trong dịch vụ số." },
  { code: "4.3.CB1a", domainId: 4, domainName: "An toàn số", description: "Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số." },
  { code: "4.3.CB1b", domainId: 4, domainName: "An toàn số", description: "Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số." },
  { code: "4.3.CB1c", domainId: 4, domainName: "An toàn số", description: "Nhận biết được những công nghệ số đơn giản cho tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội." },
  { code: "4.4.CB1a", domainId: 4, domainName: "An toàn số", description: "Nhận biết được tác động cơ bản của công nghệ số và việc sử dụng công nghệ số đối với môi trường." },

  // Miền 5: Giải quyết vấn đề
  { code: "5.1.CB1a", domainId: 5, domainName: "Giải quyết vấn đề", description: "Xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị và sử dụng môi trường số." },
  { code: "5.1.CB1b", domainId: 5, domainName: "Giải quyết vấn đề", description: "Xác định được các giải pháp đơn giản để giải quyết chúng." },
  { code: "5.2.CB1a", domainId: 5, domainName: "Giải quyết vấn đề", description: "Xác định được nhu cầu cá nhân." },
  { code: "5.2.CB1b", domainId: 5, domainName: "Giải quyết vấn đề", description: "Nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó." },
  { code: "5.2.CB1c", domainId: 5, domainName: "Giải quyết vấn đề", description: "Chọn được những cách đơn giản để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân." },
  { code: "5.3.CB1a", domainId: 5, domainName: "Giải quyết vấn đề", description: "Xác định được các công cụ và công nghệ số đơn giản có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình cũng như sản phẩm." },
  { code: "5.3.CB1b", domainId: 5, domainName: "Giải quyết vấn đề", description: "Thể hiện được sự quan tâm của cá nhân và tập thể đến quá trình xử lý nhận thức đơn giản để hiểu và giải quyết các vấn đề khái niệm đơn giản và các tình huống có vấn đề trong môi trường số." },
  { code: "5.4.CB1a", domainId: 5, domainName: "Giải quyết vấn đề", description: "Nhận ra được NLS của tôi cần được cải thiện hoặc cập nhật ở đâu." },
  { code: "5.4.CB1b", domainId: 5, domainName: "Giải quyết vấn đề", description: "Xác định được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển công nghệ số." },

  // Miền 6: Trí tuệ nhân tạo (AI)
  { code: "6.1.CB1a", domainId: 6, domainName: "Trí tuệ nhân tạo (AI)", description: "Xác định được các khái niệm cơ bản của AI." },
  { code: "6.1.CB1b", domainId: 6, domainName: "Trí tuệ nhân tạo (AI)", description: "Nhớ lại được các ứng dụng đơn giản của AI trong cuộc sống hàng ngày." },
  { code: "6.2.CB1a", domainId: 6, domainName: "Trí tuệ nhân tạo (AI)", description: "Nhận diện được các công cụ AI đơn giản." },
  { code: "6.2.CB1b", domainId: 6, domainName: "Trí tuệ nhân tạo (AI)", description: "Thực hiện được các thao tác cơ bản với các công cụ AI." },
  { code: "6.2.CB1c", domainId: 6, domainName: "Trí tuệ nhân tạo (AI)", description: "Nhận thức được cơ bản về các vấn đề đạo đức và pháp lý liên quan đến AI." },
  { code: "6.3.CB1a", domainId: 6, domainName: "Trí tuệ nhân tạo (AI)", description: "Nhận diện được một số vật dụng/trò chơi thông minh có sử dụng AI." },
  { code: "6.3.CB1b", domainId: 6, domainName: "Trí tuệ nhân tạo (AI)", description: "Nhớ được rằng không phải mọi thông tin từ máy móc đều đúng." },
];

export const DOMAIN_GROUPS: DomainGroup[] = [
  {
    id: 1,
    name: "Miền 1: Thông tin và dữ liệu",
    description: "Tìm kiếm, truy cập và tổ chức dữ liệu/thông tin đơn giản trong môi trường số.",
    indicators: PRIMARY_DIGITAL_INDICATORS.filter((i) => i.domainId === 1),
  },
  {
    id: 2,
    name: "Miền 2: Giao tiếp và hợp tác",
    description: "Tương tác, chia sẻ và hợp tác có văn hóa qua công nghệ số phù hợp lứa tuổi.",
    indicators: PRIMARY_DIGITAL_INDICATORS.filter((i) => i.domainId === 2),
  },
  {
    id: 3,
    name: "Miền 3: Sáng tạo nội dung số",
    description: "Tạo, chỉnh sửa nội dung số đơn giản (vẽ tranh, gõ văn bản, ghép hình, sơ đồ).",
    indicators: PRIMARY_DIGITAL_INDICATORS.filter((i) => i.domainId === 3),
  },
  {
    id: 4,
    name: "Miền 4: An toàn số",
    description: "Bảo vệ thiết bị, an toàn dữ liệu cá nhân, tư thế ngồi học và thời gian sử dụng màn hình.",
    indicators: PRIMARY_DIGITAL_INDICATORS.filter((i) => i.domainId === 4),
  },
  {
    id: 5,
    name: "Miền 5: Giải quyết vấn đề",
    description: "Xử lý sự cố kỹ thuật đơn giản, dùng công cụ số phục vụ bài học.",
    indicators: PRIMARY_DIGITAL_INDICATORS.filter((i) => i.domainId === 5),
  },
  {
    id: 6,
    name: "Miền 6: Trí tuệ nhân tạo (AI)",
    description: "Làm quen với đồ chơi/ứng dụng AI quanh em và nhận biết thông tin từ máy tính.",
    indicators: PRIMARY_DIGITAL_INDICATORS.filter((i) => i.domainId === 6),
  },
];

export const PRIMARY_EDTECH_TOOLS = [
  { name: "PowerPoint / Canva Tương Tác", category: "Trò chơi lật ô chữ, vòng quay may mắn, kéo thả", url: "https://www.canva.com" },
  { name: "Quizizz / Wordwall / Blooket", category: "Trò chơi học tập tương tác trực quan cho học sinh tiểu học", url: "https://wordwall.net" },
  { name: "Hành Trang Số / Hoc10", category: "Sách giáo khoa điện tử, video bài giảng, hình ảnh động của Bộ GD&ĐT", url: "https://hanhtrangso.nxbgd.vn" },
  { name: "Padlet / Linoit", category: "Bảng đính tranh ảnh, lời khen, sản phẩm học sinh", url: "https://padlet.com" },
  { name: "Paint / Tux Paint / ScratchJr", category: "Phần mềm vẽ tranh và lập trình kéo thả đơn giản cho tiểu học", url: "https://www.scratchjr.org" },
  { name: "YouTube Kids / Video khoa học", category: "Video tư liệu thực tế, hình ảnh trực quan động vật, thiên nhiên", url: "https://www.youtubekids.com" },
  { name: "Phần mềm tương tác bảng thông minh", category: "ActivInspire, ClassDojo, Smart Notebook", url: "https://www.classdojo.com" },
];
