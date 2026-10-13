// pipeline.js — Từ giáo án giáo viên tải lên đến file Word đúng mẫu.
// Cài: npm i docx mammoth @google/generative-ai
const mammoth = require("mammoth");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { responseSchema, systemInstruction } = require("./schema-and-prompt");
const { validateKhbd } = require("./validate-khbd");
const { renderKhbd } = require("./render-khbd");

// Danh sách các model Flash ổn định, có hạn ngạch miễn phí (Free Tier) dồi dào
// Tránh lỗi 429 Quota limit: 0 của gemini-2.5-pro khi dùng API Key miễn phí
const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter(Boolean);

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
 * options: { mon, tiet, codes:[{ma,noi_dung}], apiKey }   — lựa chọn trên web app
 */
async function processKhbd(file, options) {
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Chưa có GEMINI_API_KEY. Vui lòng cài đặt khóa API trong nút 'Cài API Key'.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const selected = (options.codes || []).map((c) => c.ma);
  const ask =
    `Môn: ${options.mon}. Tiết: ${options.tiet || "không rõ"}.\n` +
    `Mã Năng lực số cần tích hợp (chỉ các mã này):\n` +
    (options.codes || []).map((c) => `- ${c.ma}: ${c.noi_dung}`).join("\n");

  const parts = [...(await toParts(file)), { text: ask }];
  let feedback = "", last;
  let activeModelIndex = 0;

  for (let i = 0; i < MAX_TRIES; i++) {
    const contentPayload = [...parts, ...(feedback ? [{ text: feedback }] : [])];
    let res = null;
    let lastError = null;

    // Danh sách model thử: ưu tiên model đã hoạt động thành công
    const modelsToTry = [
      CANDIDATE_MODELS[activeModelIndex],
      ...CANDIDATE_MODELS.filter((_, idx) => idx !== activeModelIndex),
    ];

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.2,
          },
        });
        res = await model.generateContent(contentPayload);
        activeModelIndex = CANDIDATE_MODELS.indexOf(modelName);
        break; // Gọi thành công, tiếp tục bước xử lý
      } catch (err) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`[khbd-pipeline] Model ${modelName} gặp lỗi: ${errMsg}`);

        // Nếu API Key không hợp lệ thì dừng ngay lập tức
        if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("API key not valid")) {
          throw new Error("Khóa Gemini API Key không hợp lệ. Vui lòng kiểm tra lại mã API trong nút 'Cài API Key'.");
        }

        // Nếu gặp lỗi 429 Quota Exceeded hoặc model không khả dụng, thử model tiếp theo trong danh sách
        continue;
      }
    }

    if (!res) {
      const errText = lastError?.message || "";
      if (errText.includes("429") || errText.includes("Quota exceeded")) {
        throw new Error(
          `Hạn ngạch gọi Gemini API miễn phí (Free Tier) tạm thời hết lượt yêu cầu (429 Too Many Requests). Vui lòng thử lại sau ít phút hoặc dùng khóa API khác từ https://aistudio.google.com/.`
        );
      }
      throw lastError || new Error("Không thể gọi dịch vụ Gemini AI, vui lòng thử lại.");
    }

    let json;
    try {
      json = JSON.parse(res.response.text());
    } catch {
      feedback = "Lần trước không phải JSON hợp lệ. Chỉ trả JSON đúng schema.";
      continue;
    }

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
