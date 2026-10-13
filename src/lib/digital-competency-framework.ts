/**
 * BẢNG MÃ CHỈ BÁO NĂNG LỰC SỐ VÀ TRÍ TUỆ NHÂN TẠO AI LỚP 3
 * - Bảng chỉ báo NLS Lớp 1-3: Phụ lục Công văn 3456/BGDĐT
 * - Bảng chỉ báo AI Lớp 3: Phụ lục Công văn 2422/BGDĐT
 */

export interface IndicatorItem {
  code: string;
  domainId: number;
  domainName: string;
  description: string;
}

export interface AIIndicatorItem {
  code: string;
  strandId: string;
  strandName: string;
  description: string;
}

export interface DomainGroup {
  id: number;
  name: string;
  description: string;
  indicators: IndicatorItem[];
}

export interface AIStrandGroup {
  id: string;
  name: string;
  description: string;
  indicators: AIIndicatorItem[];
}

// 52 MÃ CHỈ BÁO NĂNG LỰC SỐ LỚP 1-3 (PL CV 3456)
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

  // Miền 6: Trí tuệ nhân tạo (AI) trong khung NLS
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

// 32 MÃ CHỈ BÁO TRÍ TUỆ NHÂN TẠO (AI) LỚP 3 (PL CV 2422)
export const PRIMARY_AI_INDICATORS: AIIndicatorItem[] = [
  // Mạch A: Ứng dụng AI trong học tập và trường học
  { code: "3.A1.1", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Nhận biết được một số tình huống sử dụng AI hỗ trợ học sinh trong quá trình học tập." },
  { code: "3.A1.2", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Nêu được cách sử dụng trợ lí học tập thông minh, ứng dụng học ngôn ngữ để hỗ trợ quá trình học tập." },
  { code: "3.A1.MR1", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Thực hành sử dụng trợ lí học tập thông minh, ứng dụng học ngôn ngữ." },
  { code: "3.A1.3", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Phân biệt được giữa việc sử dụng AI như công cụ hỗ trợ (đúng đắn, chủ động, có kiểm soát) và việc để AI làm thay toàn bộ (thụ động, thiếu tự lập)." },
  { code: "3.A1.MR2", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Nêu được hậu quả của việc phụ thuộc quá mức vào AI, như: giảm khả năng tư duy độc lập và sáng tạo; mất dần kĩ năng giải quyết vấn đề; ảnh hưởng đến sự tự tin và bản lĩnh cá nhân." },
  { code: "3.A1.4", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Nêu được một số tình huống có thể gây rủi ro hoặc hậu quả không mong muốn khi sử dụng AI." },
  { code: "3.A1.5", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Trả lời được một câu hỏi trước khi quyết định sử dụng AI trong một tình huống cụ thể, ví dụ: Việc này có cần dùng AI không? Nếu AI đưa ra kết quả sai thì điều gì có thể xảy ra? …" },
  { code: "3.A1.MR3", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Giải thích được rằng việc suy nghĩ và kiểm tra trước khi dùng AI giúp con người phòng tránh rủi ro, bảo vệ an toàn và quyền riêng tư, đồng thời đảm bảo AI được sử dụng vì mục đích tốt." },
  { code: "3.A2.1", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Nhận biết được một số ứng dụng hoặc thiết bị có sử dụng AI trong trường học, chẳng hạn như: robot hoặc bảng thông minh, ứng dụng chấm bài hoặc nhận dạng chữ viết." },
  { code: "3.A2.2", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Nêu được mục đích của việc sử dụng AI trong trường học là hỗ trợ giáo viên và học sinh học tập hiệu quả hơn, giúp: cá nhân hoá việc học theo năng lực từng học sinh; tăng hứng thú học tập thông qua các hoạt động tương tác." },
  { code: "3.A2.MR1", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Hình dung và mô tả được trường học trong tương lai nơi có sự xuất hiện của một số ứng dụng, thiết bị AI." },
  { code: "3.A2.MR2", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Đề xuất được một số nguyên tắc khi sử dụng AI trong học tập." },
  { code: "3.A2.3", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Nêu được các đối tượng trong trường học mà AI có thể hỗ trợ, bao gồm: học sinh, giáo viên, …" },
  { code: "3.A2.MR3", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Nêu được mục tiêu của AI trong bối cảnh trường học là hỗ trợ tất cả các thành viên của nhà trường, giúp việc dạy và học trở nên dễ dàng, hiệu quả và công bằng hơn." },
  { code: "3.A3.1", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Nêu được một số ví dụ cụ thể về việc AI có thể sai, như: ứng dụng dịch sai nghĩa từ hoặc câu; AI nhận diện nhầm hình ảnh hoặc khuôn mặt; chatbot đưa ra thông tin không đúng sự thật." },
  { code: "3.A3.2", strandId: "A", strandName: "Mạch A: Ứng dụng AI trong học tập & trường học", description: "Trình bày được rằng khi sử dụng AI, học sinh cần kiểm tra lại kết quả, so sánh với nhiều nguồn thông tin khác nhau và trao đổi với giáo viên hoặc người lớn để xác minh." },

  // Mạch B: Đạo đức, sự thật và trách nhiệm khi sử dụng AI
  { code: "3.B2.1", strandId: "B", strandName: "Mạch B: Đạo đức, sự thật & trách nhiệm", description: "Nhận biết và nêu được ví dụ về việc thông tin hoặc sản phẩm do AI tạo ra có thể không đúng với sự thật." },
  { code: "3.B3.1", strandId: "B", strandName: "Mạch B: Đạo đức, sự thật & trách nhiệm", description: "Nhận biết được rằng không nên tạo ra hoặc sử dụng AI cho các mục đích xấu như lừa đảo, bắt nạt hay gây hại cho người khác." },
  { code: "3.B3.MR1", strandId: "B", strandName: "Mạch B: Đạo đức, sự thật & trách nhiệm", description: "Nêu được rằng con người cần cung cấp dữ liệu đúng và đa dạng để AI hoạt động chính xác, công bằng." },

  // Mạch C: Dữ liệu, cấu trúc logic và Học máy
  { code: "3.C4.1", strandId: "C", strandName: "Mạch C: Dữ liệu, logic & Học máy", description: "Trình bày được khái niệm dữ liệu thông qua một số ví dụ." },
  { code: "3.C4.MR1", strandId: "C", strandName: "Mạch C: Dữ liệu, logic & Học máy", description: "Phân biệt được đặc trưng và thuộc tính của dữ liệu." },
  { code: "3.C5.1", strandId: "C", strandName: "Mạch C: Dữ liệu, logic & Học máy", description: "Mô tả được cấu trúc nếu … thì … trong việc giải quyết tình huống hoặc phân loại." },
  { code: "3.C5.MR1", strandId: "C", strandName: "Mạch C: Dữ liệu, logic & Học máy", description: "Nêu được một số công cụ AI đơn giản sử dụng cấu trúc 'nếu … thì …'." },
  { code: "3.C5.2", strandId: "C", strandName: "Mạch C: Dữ liệu, logic & Học máy", description: "Nêu được đặc điểm chính của học máy là học trên dữ liệu." },
  { code: "3.C5.3", strandId: "C", strandName: "Mạch C: Dữ liệu, logic & Học máy", description: "Nêu được một số tình huống có thể áp dụng học máy như phân loại rau củ trong nông trại thông minh, dự báo mưa lũ." },
  { code: "3.C5.4", strandId: "C", strandName: "Mạch C: Dữ liệu, logic & Học máy", description: "Nhận biết được bài toán học máy phân loại và bài toán học máy dự đoán thông qua tình huống cụ thể." },
  { code: "3.C5.MR2", strandId: "C", strandName: "Mạch C: Dữ liệu, logic & Học máy", description: "Minh họa được bài toán học máy phân loại và bài toán học máy dự đoán bằng các công cụ mã nguồn mở hoặc miễn phí, chẳng hạn: Teachable Machine, Google Colab hoặc các ứng dụng AI học máy trực tuyến tương tự." },

  // Mạch D: Huấn luyện AI và chất lượng dữ liệu
  { code: "3.D1.1", strandId: "D", strandName: "Mạch D: Huấn luyện AI & Chất lượng dữ liệu", description: "Trình bày được quá trình đơn giản để huấn luyện AI gồm các bước: thu thập ví dụ và cho AI học từ các ví dụ đó." },
  { code: "3.D2.1", strandId: "D", strandName: "Mạch D: Huấn luyện AI & Chất lượng dữ liệu", description: "Nêu được rằng dữ liệu dùng để dạy AI có thể bị thiếu, nhầm lẫn hoặc không đúng sự thật." },
  { code: "3.D2.2", strandId: "D", strandName: "Mạch D: Huấn luyện AI & Chất lượng dữ liệu", description: "Nêu được một số yêu cầu cơ bản đối với dữ liệu dùng để huấn luyện AI." },
  { code: "3.D2.MR1", strandId: "D", strandName: "Mạch D: Huấn luyện AI & Chất lượng dữ liệu", description: "Thực hành kiểm tra một bộ thẻ dữ liệu mẫu và loại bỏ được các thẻ gán nhãn nhầm, thẻ không đúng sự thật." },
  { code: "3.D2.3", strandId: "D", strandName: "Mạch D: Huấn luyện AI & Chất lượng dữ liệu", description: "Trình bày được rằng nếu dữ liệu sai hoặc không tốt thì AI sẽ không hiệu quả, thậm chí hoạt động sai." },
];

export const AI_STRAND_GROUPS: AIStrandGroup[] = [
  {
    id: "A",
    name: "Mạch A: Ứng dụng AI trong học tập và trường học",
    description: "Nhận biết tình huống dùng AI, nguyên tắc sử dụng và phòng ngừa rủi ro sai sót của AI.",
    indicators: PRIMARY_AI_INDICATORS.filter((i) => i.strandId === "A"),
  },
  {
    id: "B",
    name: "Mạch B: Đạo đức, sự thật và trách nhiệm khi dùng AI",
    description: "Thông tin do AI tạo ra, không dùng AI vào mục đích xấu và yêu cầu về dữ liệu đúng.",
    indicators: PRIMARY_AI_INDICATORS.filter((i) => i.strandId === "B"),
  },
  {
    id: "C",
    name: "Mạch C: Dữ liệu, cấu trúc logic và Học máy",
    description: "Khái niệm dữ liệu, cấu trúc nếu...thì..., học máy phân loại và dự đoán (Teachable Machine).",
    indicators: PRIMARY_AI_INDICATORS.filter((i) => i.strandId === "C"),
  },
  {
    id: "D",
    name: "Mạch D: Huấn luyện AI và chất lượng dữ liệu",
    description: "Quá trình huấn luyện AI, kiểm tra thẻ dữ liệu mẫu và tác hại của dữ liệu sai lệch.",
    indicators: PRIMARY_AI_INDICATORS.filter((i) => i.strandId === "D"),
  },
];

export const PRIMARY_EDTECH_TOOLS = [
  { name: "Hành Trang Số / Hoc10", category: "SGK điện tử, video bài giảng, hình ảnh động của Bộ GD&ĐT", url: "https://hanhtrangso.nxbgd.vn" },
  { name: "Teachable Machine (Google)", category: "Công cụ AI học máy trực quan nhận diện hình ảnh/âm thanh cho HS", url: "https://teachablemachine.withgoogle.com" },
  { name: "Wordwall / Quizizz / Blooket", category: "Trò chơi học tập tương tác trực quan cho học sinh tiểu học", url: "https://wordwall.net" },
  { name: "Canva Giáo Dục / PowerPoint", category: "Thiết kế bài giảng tương tác, trò chơi lật mảnh ghép, vòng quay", url: "https://www.canva.com" },
  { name: "ScratchJr / Blockly", category: "Lập trình kéo thả, mô tả thuật toán nếu... thì... cho tiểu học", url: "https://www.scratchjr.org" },
  { name: "Padlet / Linoit", category: "Bảng cộng tác số trưng bày tranh vẽ, bài viết của học sinh", url: "https://padlet.com" },
  { name: "YouTube Kids / Khám phá khoa học", category: "Video tư liệu thực tế, hình ảnh trực quan động vật, thiên nhiên", url: "https://www.youtubekids.com" },
];
