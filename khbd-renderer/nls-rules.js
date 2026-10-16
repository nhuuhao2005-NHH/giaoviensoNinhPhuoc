// nls-rules.js — Quy chuẩn tích hợp Năng lực số (NLS) Lớp 3 theo 4 điều kiện lớp học
// Căn cứ theo lựa chọn [3. Đồ dùng và thiết bị lớp học] & 52 mã chỉ báo NLS Lớp 1-3 (PL CV 3456/BGDĐT)

const { getCondition } = require("./ai-rules");

// ============================================================================
// BƯỚC 2 – XÁC ĐỊNH MIỀN VÀ ĐẶC TÍNH CHỈ BÁO NĂNG LỰC SỐ
// ============================================================================

// Nhóm chỉ báo làm tốt không cần thiết bị (dùng được ở cả 4 điều kiện)
const NO_DEVICE_CODES = [
  "1.2.CB1a", "2.2.CB1b", "2.5.CB1a", "2.5.CB1b", "2.5.CB1c",
  "2.6.CB1a", "2.6.CB1b", "2.6.CB1c", "3.3.CB1a", "3.4.CB1a",
  "4.1.CB1a", "4.1.CB1b", "4.1.CB1c", "4.1.CB1d",
  "4.2.CB1a", "4.2.CB1b", "4.2.CB1c", "4.3.CB1a", "4.3.CB1b", "4.3.CB1c", "4.4.CB1a",
  "5.2.CB1a", "5.4.CB1a", "5.4.CB1b",
  "6.1.CB1a", "6.1.CB1b", "6.2.CB1c", "6.3.CB1a", "6.3.CB1b"
];

// Nhóm chỉ báo nên có thiết bị số (ĐK4 chỉ mô phỏng)
const NEED_DEVICE_CODES = [
  "1.1.CB1a", "1.1.CB1b", "1.1.CB1c", "1.3.CB1a", "1.3.CB1b",
  "2.1.CB1a", "2.1.CB1b", "2.2.CB1a", "2.3.CB1a", "2.3.CB1b", "2.4.CB1a",
  "3.1.CB1a", "3.1.CB1b", "3.2.CB1a",
  "5.1.CB1a", "5.1.CB1b", "5.2.CB1b", "5.2.CB1c", "5.3.CB1a", "5.3.CB1b",
  "6.2.CB1a", "6.2.CB1b"
];

const NLS_DOMAINS = {
  1: { name: "Thông tin và dữ liệu", prefix: "1." },
  2: { name: "Giao tiếp và hợp tác", prefix: "2." },
  3: { name: "Sáng tạo nội dung số", prefix: "3." },
  4: { name: "An toàn số", prefix: "4." },
  5: { name: "Giải quyết vấn đề", prefix: "5." },
  6: { name: "Trí tuệ nhân tạo (AI)", prefix: "6." },
};

function getNLSDomain(code) {
  const cleanCode = String(code || "").replace(/[\[\]()]/g, "").replace(/^Mã\s*/i, "").trim();
  const firstDigit = parseInt(cleanCode[0], 10);
  if (NLS_DOMAINS[firstDigit]) return NLS_DOMAINS[firstDigit].name;
  return "Năng lực số";
}

// ============================================================================
// BƯỚC 3 – CƠ SỞ HOẠT ĐỘNG VÀ TÌNH HUỐNG MẪU THEO 4 ĐIỀU KIỆN
// ============================================================================

// B. Bộ câu hỏi và tình huống mẫu
const NLS_SAMPLE_QUESTIONS = {
  tim_thong_tin: [
    "Muốn biết thời tiết ngày mai, em hỏi ai hoặc tìm ở đâu? (1.1.CB1a–b)",
    "Em nói gì để máy hiểu đúng điều em cần tìm? (1.1.CB1c)",
    "Hai nguồn nói khác nhau, em tin nguồn nào? Vì sao? (1.2.CB1a)",
  ],
  sap_xep_luu: [
    "Bức tranh em vẽ nên cất ở đâu để lần sau dễ tìm? (1.3.CB1a–b)",
  ],
  giao_tiep_ung_xu: [
    "Muốn chúc mừng sinh nhật ông bà ở xa, em chọn cách nào? (2.1.CB1b)",
    "Khi nói chuyện qua màn hình, em cần nói và nhìn thế nào cho lịch sự? (2.5.CB1a–b)",
    "Bạn khác vùng miền nói giọng khác em. Em ứng xử thế nào? (2.5.CB1c)",
  ],
  ghi_nguon_ban_quyen: [
    "Em dùng tranh của bạn để làm bài. Em cần làm gì? (2.2.CB1b, 3.3.CB1a)",
  ],
  danh_tinh_du_lieu: [
    "Thông tin nào của em có thể nói cho người lạ, thông tin nào phải giữ kín? (2.6.CB1a, 4.2.CB1b)",
    "Em vừa vẽ một bức tranh bằng máy. Đó là thứ gì em tạo ra? (2.6.CB1c)",
  ],
  tao_noi_dung: [
    "Em muốn kể về gia đình mình. Em chọn vẽ, viết hay chụp ảnh? (3.1.CB1a–b)",
    "Em sẽ thêm gì vào bức tranh của bạn để đẹp hơn? (3.2.CB1a)",
  ],
  lenh_thuat_toan: [
    "Nói các bước để bạn đi từ cửa lớp đến chỗ ngồi. (3.4.CB1a)",
    "Thiếu một bước thì chuyện gì xảy ra? (3.4.CB1a)",
  ],
  an_toan: [
    "Thấy màn hình hiện hộp 'Bạn trúng thưởng', em làm gì? (4.1.CB1b–c)",
    "Ngồi xem máy lâu, mắt mỏi. Em nên làm gì? (4.3.CB1a)",
    "Tắt đèn, tắt máy khi không dùng có giúp gì cho môi trường? (4.4.CB1a)",
  ],
  su_co_thiet_bi: [
    "Máy không có tiếng. Em thử làm gì trước? (5.1.CB1a–b)",
  ],
  nhu_cau_ban_than: [
    "Em cần học gì? Có đồ chơi hoặc ứng dụng nào giúp em không? (5.2.CB1a–b)",
  ],
  tu_danh_gia: [
    "Điều gì em dùng máy đã giỏi? Điều gì cần nhờ cô giúp? (5.4.CB1a–b)",
  ],
  ai: [
    "Em từng thấy đồ vật nào tự trả lời hay tự làm theo lời nói? (6.1.CB1b, 6.3.CB1a)",
    "Nếu AI nói sai, ai sẽ giúp em kiểm tra? (6.2.CB1c, 6.3.CB1b)",
  ],
};

// C, D, E, F: Kho hoạt động cốt lõi theo từng điều kiện
const NLS_ACTIVITIES_BY_CONDITION = {
  ĐK1: {
    conditionTitle: "ĐK1 – TIVI / MÁY CHIẾU (GV thao tác, HS quan sát và phán đoán)",
    options: [
      { name: "Xem, dự đoán, kiểm chứng", desc: "Chiếu video/hình, HS dự đoán bằng thẻ Đúng/Sai hoặc giơ tay, GV kiểm chứng ngay (1.2.CB1a, 6.3.CB1b)." },
      { name: "Giơ thẻ chọn tình huống", desc: "Chiếu tình huống an toàn mạng, HS giơ thẻ xanh (nên) hoặc đỏ (không nên) và giải thích (4.1.CB1b–c, 4.3.CB1b, 2.5.CB1a)." },
      { name: "Ai tìm nhanh hơn", desc: "GV gõ từ khóa trên màn hình, HS nhận xét từ khóa nào tốt hơn (1.1.CB1a, 1.1.CB1c)." },
      { name: "Đóng vai trước màn hình", desc: "Chiếu cảnh nhắn tin, gọi video, HS đóng vai ứng xử đúng/sai (2.1.CB1b, 2.5.CB1a–c)." },
      { name: "'Máy nói có đúng không?'", desc: "Chiếu câu trả lời của AI hoặc trợ lý ảo (có đúng có sai), HS đối chiếu với sách hoặc thực tế (6.2.CB1c, 6.3.CB1b, 1.2.CB1a)." },
      { name: "Trò chơi số có sẵn", desc: "Dùng Quizizz/Kahoot/Wordwall/Blooket chế độ chiếu chung, HS trả lời bằng thẻ A/B/C hoặc theo nhóm (2.3.CB1b, 5.3.CB1a)." },
      { name: "Ghi nguồn khi chiếu", desc: "Mỗi hình có dòng nguồn, HS tập đọc 'hình này của ai' (2.2.CB1b, 3.3.CB1a)." },
      { name: "Nhận diện AI quanh ta", desc: "Chiếu loa thông minh, camera, robot hút bụi, HS chỉ ra đâu có AI (6.1.CB1b, 6.3.CB1a)." },
    ],
    simpleMethods: [
      "Chiếu một hình, một câu hỏi, HS trả lời miệng hoặc giơ ngón tay.",
      "Chiếu hai hình so sánh (đúng/sai, nên/không nên), hỏi 'Hình nào đúng? Vì sao?'.",
      "Dừng video ở giữa, hỏi 'Theo em, bạn trong video sẽ làm gì tiếp theo?'.",
      "Chiếu một câu trả lời của máy, hỏi 'Em có tin không? Em kiểm tra bằng cách nào?'.",
    ],
    tip: "Mỗi hoạt động có một hành động cụ thể của HS (giơ thẻ, chỉ tay, đứng lên chọn), tránh để HS chỉ ngồi xem.",
  },
  ĐK2: {
    conditionTitle: "ĐK2 – MÀN HÌNH TƯƠNG TÁC (HS chạm, kéo thả, vẽ, ghi trực tiếp)",
    options: [
      { name: "Kéo thả phân loại", desc: "Nên/không nên, thông tin đúng/sai, thiết bị có AI/không có AI (6.3.CB1a, 4.1.CB1b, 1.3.CB1b)." },
      { name: "Sắp xếp dữ liệu vào thư mục", desc: "Kéo tệp (hình, bài hát, văn bản) vào đúng thư mục (1.3.CB1a–b)." },
      { name: "Vẽ, tô, viết trực tiếp", desc: "HS trực tiếp thao tác vẽ hoặc viết câu trả lời trên màn hình rồi trình bày (3.1.CB1a–b, 3.2.CB1a)." },
      { name: "Ghép lệnh thành chuỗi", desc: "Kéo thả khối lệnh hoặc thẻ lệnh để điều khiển nhân vật đến đích (3.4.CB1a, 5.3.CB1b)." },
      { name: "Tìm trên màn hình tương tác", desc: "Dưới hướng dẫn của GV, HS chọn kết quả phù hợp (1.1.CB1a–b)." },
      { name: "Làm việc nhóm trên một bảng", desc: "Mỗi nhóm một vùng hoặc một trang, hoàn thành rồi chuyển vòng (2.4.CB1a, 5.3.CB1b)." },
      { name: "Chọn công cụ phù hợp", desc: "Chiếu biểu tượng (máy ảnh, bút, micro, máy tính), HS chọn công cụ cho từng nhiệm vụ (2.1.CB1a, 5.2.CB1b, 3.1.CB1a)." },
      { name: "Thao tác công cụ AI cơ bản", desc: "GV bật công cụ phù hợp lứa tuổi, HS lần lượt đặt câu hỏi ngắn, cả lớp đánh giá (6.2.CB1a–b)." },
      { name: "Sửa lỗi thiết bị giả định", desc: "Màn hình hiện tình huống (mất âm, mất mạng), HS chọn cách xử lý (5.1.CB1a–b)." },
    ],
    simpleMethods: [
      "Cho 1–2 HS lên chạm chọn đáp án rồi giải thích cho lớp.",
      "Hiện hai hình, HS chạm vào hình đúng, cả lớp giơ tay đồng ý hoặc không.",
      "HS gạch chân hoặc khoanh tròn từ khóa trong một câu hỏi tìm kiếm.",
      "HS nối bằng tay (đồ vật ↔ có AI/không có AI), bạn nhận xét.",
    ],
    tip: "Chia HS lên màn hình theo nhóm hoặc theo lượt, chuẩn bị sẵn tệp kéo thả.",
  },
  ĐK3: {
    conditionTitle: "ĐK3 – PHÒNG TIN HỌC / PHÒNG MÁY TÍNH (HS thực hành thật, nhiệm vụ ngắn, có hướng dẫn)",
    options: [
      { name: "Tìm kiếm có hướng dẫn", desc: "Phiếu nhiệm vụ 'Tìm hình con vật em thích', HS gõ từ khóa, chọn kết quả, ghi nguồn (1.1.CB1a–c, 2.2.CB1b)." },
      { name: "Tạo sản phẩm số đơn giản", desc: "Vẽ tranh (Paint), gõ vài câu, ghép ảnh, làm thiệp (3.1.CB1a–b, 3.2.CB1a)." },
      { name: "Lưu, đặt tên tệp, tạo thư mục", desc: "HS thực hành lưu tệp, tạo thư mục và tìm lại tệp (1.3.CB1a–b, 2.6.CB1c)." },
      { name: "Trò chơi học tập trên máy", desc: "HS làm bài trên phần mềm/trang web học tập dưới sự theo dõi của GV (2.3.CB1b, 5.3.CB1a)." },
      { name: "Lập trình khối lệnh", desc: "Dùng Scratch Jr, Code.org giải bài toán đơn giản (3.4.CB1a, 5.3.CB1b)." },
      { name: "Thực hành với công cụ AI", desc: "Cặp HS đặt câu hỏi với công cụ do GV kiểm soát, rồi kiểm chứng đáp án (6.2.CB1a–c, 6.3.CB1b, 1.2.CB1a)." },
      { name: "Tùy chỉnh môi trường", desc: "Chỉnh độ sáng, âm lượng, nền màn hình theo nhu cầu và khoảng cách an toàn (5.2.CB1c)." },
      { name: "Xử lý sự cố nhỏ", desc: "Máy treo, mất tiếng, GV đặt tình huống để HS thử cách xử lý (5.1.CB1a–b)." },
      { name: "Đăng nhập an toàn, mật khẩu", desc: "Tập đặt và giữ bí mật mật khẩu (dùng ví dụ mô phỏng, không dùng mật khẩu thật) (4.1.CB1c, 4.2.CB1a–b, 2.6.CB1a)." },
      { name: "Cộng tác trong môi trường lớp học", desc: "Làm chung trên một tệp hoặc bảng do GV tạo (2.4.CB1a, 2.1.CB1a)." },
    ],
    simpleMethods: [
      "Nhiệm vụ 1 bước: 'Mở tệp, đọc, trả lời miệng cho bạn bên cạnh'.",
      "Hỏi theo cặp: một bạn thao tác, một bạn hỏi 'Bạn làm gì tiếp theo?'.",
      "GV hỏi cả lớp trước khi thao tác: 'Em định tìm gì? Em gõ từ nào?'.",
      "Cuối tiết, HS nói một thao tác em làm được và một thao tác em cần giúp.",
    ],
    tip: "Dùng tài khoản lớp, không cho lên mạng tự do, nhắc tư thế ngồi thẳng lưng và khoảng cách mắt 40–50cm (4.3.CB1a).",
  },
  ĐK4: {
    conditionTitle: "ĐK4 – CHỈ CÓ BẢNG LỚP VÀ TRANH ẢNH (Không thiết bị số / Unplugged)",
    options: [
      { name: "Thẻ Xanh/Đỏ", desc: "Giơ thẻ cho tình huống nên/không nên chia sẻ, bấm link lạ... (4.1.CB1b–c, 4.2.CB1b, 2.5.CB1a)." },
      { name: "Đóng vai tình huống", desc: "Bạn bè, người lạ, bố mẹ trong các tình huống mạng (2.5.CB1a–c, 4.3.CB1b, 2.6.CB1b)." },
      { name: "Trò chơi 'Robot và lập trình viên'", desc: "Một HS là robot, một HS đưa lệnh bằng thẻ mũi tên, robot đi theo lệnh trên sàn hoặc lưới ô (3.4.CB1a, 6.1.CB1a)." },
      { name: "Trò chơi 'Máy học qua ví dụ'", desc: "Cho xem vài thẻ ảnh mẫu (mèo/chó), HS 'dạy máy' phân loại rồi đoán thẻ mới (6.1.CB1a, 6.3.CB1a)." },
      { name: "Tìm kiếm bằng thẻ từ khóa", desc: "'Người hỏi' nói từ khóa, 'máy tìm' chọn tranh phù hợp trong tập tranh (1.1.CB1a, 1.1.CB1c)." },
      { name: "Tủ hồ sơ mini", desc: "Dùng hộp, phong bì có nhãn như thư mục, HS bỏ thẻ vào đúng nơi (1.3.CB1a–b)." },
      { name: "Tin thật, tin giả", desc: "Đưa các mẩu tin, tranh, HS đối chiếu với sách hoặc thực tế (1.2.CB1a, 6.3.CB1b)." },
      { name: "'Ai là tác giả?'", desc: "HS ghi tên lên bài vẽ, nhắc nhau ghi nguồn khi dùng tranh của bạn (2.2.CB1b, 3.3.CB1a)." },
      { name: "Thẻ danh tính của em", desc: "Vẽ thẻ, tách thông tin được chia sẻ và thông tin giữ kín (2.6.CB1a–c, 4.2.CB1a–b)." },
      { name: "Thiết bị thông minh qua tranh", desc: "Dán tranh vật dụng, xếp vào 'có AI/không có AI' (6.1.CB1b, 6.3.CB1a)." },
      { name: "Cây quyết định bằng sơ đồ trên bảng", desc: "'Nếu... thì...', HS nối mũi tên chọn việc làm (3.4.CB1a, 5.1.CB1b)." },
      { name: "Bầu chọn 'Công nghệ giúp gì cho em?'", desc: "Dán sticker vào tranh công nghệ hữu ích, nói lý do (5.2.CB1a–b, 2.3.CB1b, 4.3.CB1c)." },
      { name: "Thi 'Bảo vệ thiết bị'", desc: "Ghép tranh cách bảo vệ thiết bị (sạc đúng, tránh nước, để nơi an toàn) (4.1.CB1a, 4.4.CB1a)." },
      { name: "Mô phỏng hỏng máy", desc: "Một nhóm là 'máy lỗi' với thẻ triệu chứng, nhóm kia chọn thẻ cách xử lý (5.1.CB1a–b)." },
      { name: "Tự đánh giá 'Em giỏi gì với công nghệ?'", desc: "Tô màu ngôi sao theo mức độ, nêu điều muốn học thêm (5.4.CB1a–b)." },
      { name: "Giao tiếp phù hợp bối cảnh", desc: "Ghép thẻ (gọi video, nhắn tin, viết thư) với tình huống (xa ông bà, báo bài) (2.1.CB1b, 2.5.CB1b)." },
      { name: "Bảng quy tắc lớp học số", desc: "Cả lớp viết và dán '5 điều khi dùng thiết bị' (2.5.CB1a, 4.3.CB1a, 4.4.CB1a)." },
    ],
    simpleMethods: [
      "Viết 1 câu hỏi hoặc tình huống lên bảng, HS trả lời miệng hoặc giơ tay.",
      "Dán 2 tranh lên bảng, HS giơ tay chọn tranh đúng.",
      "Hai góc lớp: góc 'Nên', góc 'Không nên', HS đứng về góc mình chọn rồi giải thích.",
      "Vỗ tay một lần = Đúng, hai lần = Sai cho các câu nói của GV.",
      "Đóng vai bằng mặt nạ hoặc thẻ nhân vật (bạn, người lạ, bố mẹ).",
      "Dùng bảng con: HS viết hoặc vẽ đáp án (Đ/S, A/B) rồi cả lớp giơ lên.",
    ],
    tip: "Hình thức không dùng thiết bị số (Unplugged) giúp mọi học sinh đều được phát triển năng lực số ngay cả khi không có máy tính.",
  },
};

// ============================================================================
// HÀM TỔNG HỢP KẾ HOẠCH TÍCH HỢP NLS
// ============================================================================
function resolveNLSPlan(infrastructureLevel, nlsCodes = [], teacherSuggestions = "") {
  const cond = getCondition(infrastructureLevel);
  const condId = cond.id;
  const condData = NLS_ACTIVITIES_BY_CONDITION[condId] || NLS_ACTIVITIES_BY_CONDITION["ĐK1"];

  const codes = (nlsCodes || []).map((c) => (c.ma || c).trim());
  const firstCode = codes[0] || "1.1.CB1a";
  const domainName = getNLSDomain(firstCode);

  // Chọn hoạt động chính phù hợp với chỉ báo và điều kiện
  let mainAct = condData.options[0];
  if (firstCode.startsWith("1.1")) {
    mainAct = condData.options.find((o) => o.desc.includes("1.1")) || condData.options[0];
  } else if (firstCode.startsWith("1.2")) {
    mainAct = condData.options.find((o) => o.desc.includes("1.2")) || condData.options[0];
  } else if (firstCode.startsWith("1.3")) {
    mainAct = condData.options.find((o) => o.desc.includes("1.3")) || condData.options[1] || condData.options[0];
  } else if (firstCode.startsWith("2.")) {
    mainAct = condData.options.find((o) => o.desc.includes("2.")) || condData.options[1] || condData.options[0];
  } else if (firstCode.startsWith("3.")) {
    mainAct = condData.options.find((o) => o.desc.includes("3.")) || condData.options[2] || condData.options[0];
  } else if (firstCode.startsWith("4.")) {
    mainAct = condData.options.find((o) => o.desc.includes("4.")) || condData.options[1] || condData.options[0];
  } else if (firstCode.startsWith("5.")) {
    mainAct = condData.options.find((o) => o.desc.includes("5.")) || condData.options[0];
  } else if (firstCode.startsWith("6.")) {
    mainAct = condData.options.find((o) => o.desc.includes("6.")) || condData.options[0];
  }

  // Hoạt động dự phòng / phần chốt ĐK4 (cho ĐK1, ĐK2, ĐK3)
  let dk4Fallback = null;
  if (condId !== "ĐK4") {
    dk4Fallback = NLS_ACTIVITIES_BY_CONDITION["ĐK4"].options.find((o) => o.name.includes("Thẻ Xanh/Đỏ")) ||
      NLS_ACTIVITIES_BY_CONDITION["ĐK4"].options[0];
  }

  // Câu hỏi / tình huống gợi ý từ mục B
  let sampleQuestion = "Khi sử dụng thiết bị số, em cần làm gì để bảo vệ an toàn cho bản thân và bạn bè?";
  if (firstCode.startsWith("1.1") || firstCode.startsWith("1.2")) {
    sampleQuestion = NLS_SAMPLE_QUESTIONS.tim_thong_tin[0];
  } else if (firstCode.startsWith("1.3")) {
    sampleQuestion = NLS_SAMPLE_QUESTIONS.sap_xep_luu[0];
  } else if (firstCode.startsWith("2.1") || firstCode.startsWith("2.5")) {
    sampleQuestion = NLS_SAMPLE_QUESTIONS.giao_tiep_ung_xu[0];
  } else if (firstCode.startsWith("2.2") || firstCode.startsWith("3.3")) {
    sampleQuestion = NLS_SAMPLE_QUESTIONS.ghi_nguon_ban_quyen[0];
  } else if (firstCode.startsWith("2.6") || firstCode.startsWith("4.2")) {
    sampleQuestion = NLS_SAMPLE_QUESTIONS.danh_tinh_du_lieu[0];
  } else if (firstCode.startsWith("3.1") || firstCode.startsWith("3.2")) {
    sampleQuestion = NLS_SAMPLE_QUESTIONS.tao_noi_dung[0];
  } else if (firstCode.startsWith("3.4")) {
    sampleQuestion = NLS_SAMPLE_QUESTIONS.lenh_thuat_toan[0];
  } else if (firstCode.startsWith("4.")) {
    sampleQuestion = NLS_SAMPLE_QUESTIONS.an_toan[0];
  } else if (firstCode.startsWith("5.1")) {
    sampleQuestion = NLS_SAMPLE_QUESTIONS.su_co_thiet_bi[0];
  } else if (firstCode.startsWith("5.2") || firstCode.startsWith("5.4")) {
    sampleQuestion = NLS_SAMPLE_QUESTIONS.tu_danh_gia[0];
  } else if (firstCode.startsWith("6.")) {
    sampleQuestion = NLS_SAMPLE_QUESTIONS.ai[0];
  }

  return {
    condition: condId,
    conditionName: cond.name,
    codes,
    domainName,
    mainAct,
    dk4Fallback,
    sampleQuestion,
    teacherSuggestions: String(teacherSuggestions || "").trim(),
  };
}

// ============================================================================
// XÂY DỰNG LỜI CHỈ DẪN PROMPT CHO GEMINI
// ============================================================================
function buildNLSInstructionPrompt(plan) {
  const { condition, conditionName, codes, domainName, mainAct, dk4Fallback, sampleQuestion, teacherSuggestions } = plan;

  return `QUY CHUẨN TÍCH HỢP NĂNG LỰC SỐ (NLS) LỚP 3 THEO 4 ĐIỀU KIỆN LỚP HỌC:

NGUYÊN TẮC CỐT LÕI:
- Điều kiện lớp học: ${condition} (${conditionName}).
- Mã Năng lực số được chọn: ${codes.join(", ")} (Thuộc miền: ${domainName}).
- Gắn với một hoạt động cụ thể có sẵn trong bài. Không dạy thêm tiết riêng.
- Tuyệt đối không cho HS nhập thông tin cá nhân thật. Dùng công cụ do GV kiểm soát.
- Luôn có phương án dự phòng chuyển sang hình thức ĐK4 khi thiết bị gặp sự cố.

PHƯƠNG ÁN TỔ CHỨC HOẠT ĐỘNG PHÙ HỢP:
- Hoạt động chính [${mainAct.name}]: ${mainAct.desc}
${dk4Fallback ? `- Phương án dự phòng / phần chốt ĐK4 [${dk4Fallback.name}]: ${dk4Fallback.desc}` : ""}
- Tình huống / Câu hỏi sư phạm gợi ý: "${sampleQuestion}"
${teacherSuggestions ? `- Ưu tiên làm theo gợi ý của giáo viên: "${teacherSuggestions}"` : ""}

VỊ TRÍ CHÈN TRONG KẾ HOẠCH BÀI DẠY:
- Chèn vào cột "Hoạt động của giáo viên" (và cột HS tương ứng), ưu tiên CUỐI hoạt động "Khám phá" hoặc CUỐI hoạt động "Luyện tập, thực hành" (hoặc "Vận dụng, trải nghiệm", "Khởi động").
- Mỗi bài dạy chèn 1 khối "*Tích hợp Năng lực số:".
- TUYỆT ĐỐI TÔN TRỌNG NỘI DUNG GỐC: Chỉ bổ sung thêm bước mới này, không làm mất bất kỳ câu từ nào trong bài dạy của giáo viên.

ĐỊNH DẠNG KHỐI TÍCH HỢP BẮT BUỘC (VIẾT CHÍNH XÁC NHƯ SAU):
Ở trường "gv" của bước đó, viết đúng định dạng:
*Tích hợp Năng lực số:
- <Nội dung hoạt động gắn với tích hợp NLS 1: GV làm gì theo hoạt động chính đã xác định>
- <Nội dung hoạt động gắn với tích hợp NLS 2 / phần chốt ĐK4 / HS tự thực hành / thảo luận cặp đôi>
- GV liên hệ giáo dục: <1–2 câu dặn dò về an toàn thông tin, văn hóa số, bảo vệ mắt và thiết bị>

Ở trường "hs" tương ứng của bước đó:
- <Hành động tương ứng song hành của học sinh tham gia hoạt động 1>
- <Hành động tương ứng song hành của học sinh tham gia hoạt động 2 / thực hành>
- <Học sinh lắng nghe và ghi nhớ lời dặn dò của giáo viên>

LƯU Ý QUAN TRỌNG:
1. Dòng đầu tiên của trường "gv" phải đúng từng ký tự: "*Tích hợp Năng lực số:"
2. Dòng cuối cùng của trường "gv" phải bắt đầu bằng: "- GV liên hệ giáo dục: "
3. Tuyệt đối KHÔNG ghi mã chỉ báo (ví dụ 1.1.CB1a) bên trong lời văn của khối này (chỉ ghi mã ở Phần I Yêu cầu cần đạt).`;
}

// ============================================================================
// HÀM TẠO KHỐI TÍCH HỢP NLS MẪU VÀ CHUẨN HÓA
// ============================================================================
function generateDefaultNLSBlock(plan) {
  const { condition, mainAct, dk4Fallback, sampleQuestion } = plan;
  const lines = ["*Tích hợp Năng lực số:"];

  lines.push(`- GV tổ chức hoạt động ${mainAct.name}: ${mainAct.desc}`);
  if (dk4Fallback) {
    lines.push(`- GV kết hợp tình huống nhanh: "${sampleQuestion}", cho HS phản xạ và nhận xét.`);
  } else {
    lines.push(`- GV hướng dẫn học sinh độc lập suy nghĩ, hoàn thành nhiệm vụ trên phiếu học tập.`);
  }

  lines.push(
    `- GV liên hệ giáo dục: Dặn dò các em luôn có ý thức bảo vệ an toàn thông tin cá nhân, giữ khoảng cách mắt an toàn và sử dụng thiết bị số có trách nhiệm.`
  );

  return lines.join("\n");
}

function generateDefaultNLSHsBlock(plan) {
  const { condition } = plan;
  const lines = [
    "- HS tích cực tham gia hoạt động, quan sát và làm theo hướng dẫn của giáo viên.",
    condition === "ĐK3"
      ? "- HS thực hành thao tác trên máy tính theo cặp, hỗ trợ nhau hoàn thành nhiệm vụ."
      : "- HS chủ động suy nghĩ, giơ thẻ biểu quyết và chia sẻ ý kiến trước lớp.",
    "- HS chăm chú lắng nghe, ghi nhớ lời dặn dò của giáo viên về an toàn và văn hóa số.",
  ];
  return lines.join("\n");
}

function normalizeNLSBlock(gvRaw, hsRaw, plan) {
  let gv = String(gvRaw || "").trim();
  let hs = String(hsRaw || "").trim();

  // Đảm bảo dòng đầu đúng là "*Tích hợp Năng lực số:"
  if (!gv.startsWith("*Tích hợp Năng lực số:")) {
    gv = gv.replace(/^\*?\s*Tích hợp\s*(?:Năng lực số|NLS)\s*[:\-–]?\s*/i, "");
    gv = `*Tích hợp Năng lực số:\n${gv}`;
  }

  // Đảm bảo có dòng "- GV liên hệ giáo dục:"
  if (!gv.includes("GV liên hệ giáo dục:") && !gv.includes("liên hệ giáo dục:")) {
    gv += `\n- GV liên hệ giáo dục: Dặn dò học sinh luôn có ý thức an toàn số, bảo vệ thiết bị và giữ khoảng cách mắt hợp lý khi học tập.`;
  } else {
    gv = gv.replace(/(?:^|\n)[-+•*]?\s*(?:GV\s*)?liên hệ giáo dục\s*[:\-–]\s*/i, "\n- GV liên hệ giáo dục: ");
  }

  // Đảm bảo HS có việc song hành
  if (!hs || hs.length < 15) {
    hs = generateDefaultNLSHsBlock(plan);
  }

  return { gv: gv.trim(), hs: hs.trim() };
}

module.exports = {
  NO_DEVICE_CODES,
  NEED_DEVICE_CODES,
  NLS_DOMAINS,
  getNLSDomain,
  NLS_SAMPLE_QUESTIONS,
  NLS_ACTIVITIES_BY_CONDITION,
  resolveNLSPlan,
  buildNLSInstructionPrompt,
  generateDefaultNLSBlock,
  generateDefaultNLSHsBlock,
  normalizeNLSBlock,
};
