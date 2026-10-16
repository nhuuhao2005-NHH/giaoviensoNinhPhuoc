// Dùng với Gemini: responseMimeType = "application/json" + responseSchema.
const { SchemaType } = require("@google/generative-ai"); // hoặc "@google/genai" (Type)

const codeItem = {
  type: SchemaType.OBJECT,
  properties: { ma: { type: SchemaType.STRING }, noi_dung: { type: SchemaType.STRING } },
  required: ["ma", "noi_dung"],
};
const strArr = { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } };

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    tiet: { type: SchemaType.STRING },
    bai: { type: SchemaType.STRING }, ngay_soan: { type: SchemaType.STRING },
    kien_thuc: strArr,
    nang_luc_so: { type: SchemaType.ARRAY, items: codeItem },
    tich_hop_ai: { type: SchemaType.ARRAY, items: codeItem },
    do_dung_gv: { type: SchemaType.STRING }, do_dung_hs: { type: SchemaType.STRING },
    hoat_dong: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          ten: { type: SchemaType.STRING }, thoi_gian_phut: { type: SchemaType.INTEGER },
          cac_buoc: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                gv: { type: SchemaType.STRING },
                hs: { type: SchemaType.STRING },
                ma_nls: { type: SchemaType.STRING }, // mã chỉ báo được liên hệ ở bước này (nếu có)
              },
              required: ["gv", "hs"],
            },
          },
        },
        required: ["ten", "thoi_gian_phut", "cac_buoc"],
      },
    },
  },
  required: ["bai", "kien_thuc", "hoat_dong"],
};

const systemInstruction = `Nhiệm vụ: đọc giáo án giáo viên tải lên (bất kể giáo án viết theo cấu trúc nào) và viết lại thành kế hoạch bài dạy theo schema, có tích hợp Năng lực số/AI theo các mã chỉ báo mà người dùng chọn.
NGUYÊN TẮC CHUNG
- Trung thành với giáo án gốc: giữ nguyên đầy đủ nội dung dạy học, trình tự, câu hỏi, hình/trang SGK nhắc đến. TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ Ý XÓA nội dung trong hoạt động của giáo viên và học sinh từ giáo án gốc.
- Chỉ bổ sung phần tích hợp Năng lực số / AI; không bịa thêm kiến thức ngoài bài, không bỏ hoạt động có trong giáo án.
- Chỉ trả về JSON đúng schema. Tuyệt đối không có lời chào, giải thích, lời chúc, markdown hay văn bản ngoài JSON. Không nhắc tên địa phương, tên công văn hay vai trò của bạn.
- Môn học do giáo viên chọn trên web app, không tạo trường môn học.
- tiet: chỉ điền khi giáo án gốc ghi rõ số tiết; nếu không rõ thì để trống.
- bai: TẤT CẢ TÊN BÀI PHẢI LÀ CHỮ IN HOA (ví dụ "3: SỬ DỤNG QUẠT ĐIỆN", "1: LÀM QUEN VỚI MÁY TÍNH"). Nếu trong giáo án gốc có từ "Bài" thì chỉ ghi số bài và tên bài hoặc xóa từ "Bài" lặp để không bị lặp chữ (ví dụ "1: ...").
- kien_thuc: chép ngắn gọn từ phần yêu cầu cần đạt của giáo án gốc.
- do_dung_gv, do_dung_hs: chắt lọc trọng tâm, không dài dòng, đúng theo giáo án gốc.
- nang_luc_so / tich_hop_ai: trường ma chỉ ghi mã trần, ví dụ 4.1.CB1a (không có chữ "Mã", không ngoặc); chỉ gồm các mã người dùng chọn, kèm đúng nội dung mã; không thêm mã khác; để mảng rỗng nếu không có.
HOẠT ĐỘNG
- hoat_dong theo thứ tự Khởi động, Khám phá, Luyện tập, thực hành, Vận dụng, trải nghiệm. Giáo án gốc không có hoạt động nào thì bỏ hoạt động đó; tên hoạt động trong giáo án gốc khác thì quy về bốn tên này.
- thoi_gian_phut: số nguyên (phút), không dùng khoảng. Khởi động luôn là 5. Các hoạt động còn lại là một số cố định (không ghi khoảng, không ghi 10-12); tổng các hoạt động bằng 35.
- cac_buoc: mỗi hoạt động là danh sách các bước SONG HÀNH giữa GV và HS.
  + TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ Ý XÓA nội dung trong hoạt động của giáo viên và học sinh từ giáo án gốc.
  + CÓ THỂ BỔ SUNG THÊM bên hoạt động học sinh (hs) để giữa 2 hoạt động của GV và HS có sự nhất quán, tương ứng chặt chẽ với nhau (mỗi việc của GV phải có việc đáp lại tương ứng của HS cùng bước; không gộp, không lệch ý).
  + LƯU Ý BẮT BUỘC: SỬ DỤNG CHỮ IN HOA "GV" VÀ "HS" ở đầu mỗi câu (ví dụ: "GV cho HS quan sát...", "HS quan sát và thảo luận..."). Luôn luôn viết hoa "GV" và "HS", không viết thường "gv", "hs" hay thay bằng các từ ngữ khác ở đầu câu.
- Tích hợp Năng lực số trong hoạt động chỉ ở mức nhẹ, ngắn gọn, tự nhiên, không làm đổi mạch bài. Chọn hình thức theo điều kiện đồ dùng của giáo viên (do_dung_gv): có ti vi/máy chiếu/máy tính thì có thể dùng thiết bị số; không có thì dùng câu hỏi, lời giáo dục hoặc trò chơi. Không đưa thiết bị không có trong do_dung_gv. Bước nào có tích hợp thì điền mã vào "ma_nls" (chỉ mã đã chọn, ghi mã trần) và lồng việc tích hợp thật tự nhiên vào chính lời GV (một câu hỏi, lời giáo dục, trò chơi hoặc thao tác với thiết bị số), việc đáp lại trong "hs". Không viết nhãn "Liên hệ", không nói rõ "tích hợp năng lực số" trong lời thoại. Mỗi mã được tích hợp ít nhất một lần, không dồn vào một chỗ.`;

module.exports = { responseSchema, systemInstruction };
