// pipeline.js — Từ giáo án giáo viên tải lên đến file Word đúng mẫu.
// Cài: npm i docx mammoth @google/generative-ai
const mammoth = require("mammoth");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { responseSchema, systemInstruction } = require("./schema-and-prompt");
const { validateKhbd } = require("./validate-khbd");
const { renderKhbd } = require("./render-khbd");

const MODEL = "gemini-2.5-pro"; // đổi theo model app đang dùng
const MAX_TRIES = 3;

// Đọc giáo án giáo viên tải lên: .docx -> chữ; .pdf -> gửi thẳng cho Gemini; .txt/.md -> chữ
async function toParts(file) {
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: file.buffer });
    return [{ text: `GIÁO ÁN TẢI LÊN:\n${value}` }];
  }
  if (name.endsWith(".pdf"))
    return [{ inlineData: { data: file.buffer.toString("base64"), mimeType: "application/pdf" } }, { text: "GIÁO ÁN TẢI LÊN: tệp PDF đính kèm." }];
  return [{ text: `GIÁO ÁN TẢI LÊN:\n${file.buffer.toString("utf8")}` }];
}

/**
 * file: { name, buffer }                 — giáo án giáo viên tải lên
 * options: { mon, tiet, codes:[{ma,noi_dung}], aiCodes:[...] }   — lựa chọn trên web app
 */
async function processKhbd(file, options) {
  const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({
    model: MODEL, systemInstruction,
    generationConfig: { responseMimeType: "application/json", responseSchema, temperature: 0.2 },
  });
  const selected = (options.codes || []).map((c) => c.ma);
  const ask =
    `Môn: ${options.mon}. Tiết: ${options.tiet || "không rõ"}.\n` +
    `Mã Năng lực số cần tích hợp (chỉ các mã này):\n` +
    (options.codes || []).map((c) => `- ${c.ma}: ${c.noi_dung}`).join("\n");

  const parts = [...(await toParts(file)), { text: ask }];
  let feedback = "", last;
  for (let i = 0; i < MAX_TRIES; i++) {
    const res = await model.generateContent([...parts, ...(feedback ? [{ text: feedback }] : [])]);
    let json;
    try { json = JSON.parse(res.response.text()); } catch { feedback = "Lần trước không phải JSON hợp lệ. Chỉ trả JSON đúng schema."; continue; }
    const { data, errors } = validateKhbd(json, selected);
    last = data;
    if (!errors.length) return renderKhbd(data, { mon: options.mon, tiet: options.tiet });
    feedback = "Sửa các lỗi sau rồi trả lại toàn bộ JSON:\n- " + errors.join("\n- ");
  }
  // Hết lượt gọi lại: vẫn xuất file với bản tốt nhất đã chuẩn hoá (còn lỗi nhẹ giáo viên tự chỉnh)
  if (last) return renderKhbd(last, { mon: options.mon, tiet: options.tiet });
  throw new Error("Không tạo được kế hoạch bài dạy, vui lòng thử lại.");
}
module.exports = { processKhbd };
