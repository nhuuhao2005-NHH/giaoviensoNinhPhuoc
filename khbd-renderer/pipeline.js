// pipeline.js — Từ giáo án giáo viên tải lên đến file Word đúng mẫu.
// Cài: npm i docx mammoth @google/generative-ai
const mammoth = require("mammoth");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { responseSchema, systemInstruction } = require("./schema-and-prompt");
const { buildAiModulePrompt } = require("./ai-integration");
const { validateKhbd } = require("./validate-khbd");
const { renderKhbd } = require("./render-khbd");

const MAX_TRIES = 3;

// Danh sách model dự phòng: ưu tiên gemini-1.5-flash vì luôn có 15 RPM ổn định trên mọi tài khoản Free Tier mới
const FALLBACK_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite-preview-02-05",
];

// Tự động truy vấn trực tiếp Google API với chính API Key của thầy/cô để lấy danh sách các model sẵn sàng tạo nội dung
async function getAvailableModels(apiKey) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.models)) {
        // Lọc chính xác các model đang thực sự tồn tại và sẵn sàng tạo nội dung (generateContent)
        const supported = data.models
          .filter(
            (m) =>
              Array.isArray(m.supportedGenerationMethods) &&
              m.supportedGenerationMethods.includes("generateContent")
          )
          .map((m) => m.name.replace(/^models\//, ""));
        if (supported.length > 0) {
          console.log(`[khbd-pipeline] Đã truy vấn Google API thành công! Có ${supported.length} model sẵn sàng tạo nội dung: ${supported.slice(0, 5).join(", ")}...`);
          return supported;
        }
      }
    } else {
      const errData = await res.json().catch(() => null);
      const errMsg = errData?.error?.message || "";
      if (errMsg.includes("API key not valid") || errMsg.includes("API_KEY_INVALID")) {
        throw new Error("Khóa Gemini API Key không hợp lệ. Vui lòng kiểm tra lại mã API trong nút 'Cài API Key'.");
      }
      console.warn(`[khbd-pipeline] Google API ListModels báo lỗi (${res.status}): ${errMsg}`);
    }
  } catch (err) {
    if (err.message && err.message.includes("API Key không hợp lệ")) throw err;
    console.warn("[khbd-pipeline] Không thể gọi ListModels tự động:", err?.message);
  }
  return [];
}

// Xếp hạng: ưu tiên gemini-1.5-flash vì luôn có 15 RPM ổn định trên mọi tài khoản Free Tier mới
function rankModels(modelList) {
  const flash = modelList.filter((m) => m.toLowerCase().includes("flash"));
  const nonFlash = modelList.filter((m) => !m.toLowerCase().includes("flash"));

  const score = (name) => {
    const lower = name.toLowerCase();
    // gemini-1.5-flash là model chuẩn nhất cho Free Tier mọi tài khoản Google mới
    if (lower === "gemini-1.5-flash") return 100;
    if (lower.includes("1.5-flash-8b")) return 95;
    if (lower === "gemini-2.0-flash") return 90;
    if (lower.includes("2.0-flash-lite")) return 85;
    if (lower.includes("flash-lite")) return 80;
    if (lower.includes("1.5-flash")) return 75;
    if (lower.includes("2.0-flash")) return 70;
    if (lower.includes("flash")) return 65;
    return 10;
  };

  flash.sort((a, b) => score(b) - score(a));
  return [...flash, ...nonFlash];
}

// Đọc giáo án giáo viên tải lên: .docx -> chữ; .pdf -> gửi thẳng cho Gemini; .txt/.md -> chữ
async function toParts(file) {
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".docx")) {
    const raw = await mammoth.extractRawText({ buffer: file.buffer });
    const html = await mammoth.convertToHtml({ buffer: file.buffer });
    let textContent = raw.value || "";
    if (html.value && html.value.includes("<table")) {
      textContent += `\n\n--- CẤU TRÚC BẢNG BIỂU CHI TIẾT TRONG GIÁO ÁN GỐC (DẠNG HTML) ---\n${html.value}`;
    }
    return [{ text: `GIÁO ÁN GỐC CỦA GIÁO VIÊN TẢI LÊN:\n${textContent}` }];
  }
  if (name.endsWith(".pdf"))
    return [{ inlineData: { data: file.buffer.toString("base64"), mimeType: "application/pdf" } }, { text: "GIÁO ÁN GỐC CỦA GIÁO VIÊN TẢI LÊN (tệp PDF đính kèm)." }];
  return [{ text: `GIÁO ÁN GỐC CỦA GIÁO VIÊN TẢI LÊN:\n${file.buffer.toString("utf8")}` }];
}

/**
 * file: { name, buffer }                 — giáo án giáo viên tải lên
 * options: { mon, tiet, codes:[{ma,noi_dung}], aiCodes:[{ma,noi_dung}], teacherSuggestions, infrastructureLevel, apiKey }
 */
async function processKhbd(file, options) {
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Chưa có GEMINI_API_KEY. Vui lòng cài đặt khóa API trong nút 'Cài API Key'.");
  }

  // Tự động tìm các model thực sự khả dụng cho khóa API của giáo viên
  const discovered = await getAvailableModels(apiKey);
  const candidateModels = discovered.length > 0 ? rankModels(discovered) : FALLBACK_MODELS;

  // Nếu giáo viên có chỉ định model cụ thể (hoặc qua biến môi trường), ưu tiên lên đầu
  const preferredModel = options.model || options.preferredModel || process.env.GEMINI_MODEL;
  const modelsToUse = preferredModel
    ? [preferredModel, ...candidateModels.filter((m) => m !== preferredModel)]
    : candidateModels;

  const genAI = new GoogleGenerativeAI(apiKey);
  const selected = (options.codes || []).map((c) => c.ma);
  const selectedAi = (options.aiCodes || []).map((c) => c.ma);

  const askParts = [
    `Môn: ${options.mon}. Tiết: ${options.tiet || "không rõ"}.`,
    `YÊU CẦU ĐẶC BIỆT BẮT BUỘC:
- TÔN TRỌNG TUYỆT ĐỐI NỘI DUNG CỦA GIÁO VIÊN: Giữ nguyên vẹn 100% nội dung, câu từ, diễn đạt, câu hỏi, hướng dẫn và các bước trong giáo án gốc của giáo viên.
- TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ Ý ĐIỀU CHỈNH, không tóm tắt, không rút gọn hay viết lại câu chữ của giáo viên theo ý mình.
- Giữ nguyên đầy đủ tất cả các hoạt động, các bước, các ví dụ, bài tập mà giáo viên đã soạn.
- Bổ sung thêm hoạt động tương ứng của học sinh (HS) nếu giáo án gốc chỉ có việc của GV để đảm bảo tính nhất quán và song hành giữa GV - HS.
- Luôn luôn viết hoa "GV" và "HS" ở đầu mỗi câu.
- Tên bài phải là chữ IN HOA.`,
  ];

  if (options.infrastructureLevel) {
    askParts.push(`Đồ dùng và thiết bị dạy học: ${options.infrastructureLevel}`);
  }

  if (options.codes && options.codes.length > 0) {
    askParts.push(
      `Mã Năng lực số cần tích hợp (chỉ các mã này):\n` +
        options.codes.map((c) => `- ${c.ma}: ${c.noi_dung}`).join("\n")
    );
  } else {
    askParts.push(`Không tích hợp Năng lực số (để nang_luc_so rỗng []).`);
  }

  // TÍCH HỢP TRÍ TUỆ NHÂN TẠO (AI): CHỈ ÁP DỤNG KHI GV TÍCH "Trí tuệ nhân tạo AI"
  const aiPrompt = buildAiModulePrompt(options);
  if (aiPrompt) {
    askParts.push(aiPrompt);
  }

  if (options.teacherSuggestions && options.teacherSuggestions.trim()) {
    askParts.push(`Gợi ý của giáo viên:\n${options.teacherSuggestions.trim()}`);
  }

  const ask = askParts.join("\n\n");
  const parts = [...(await toParts(file)), { text: ask }];
  let feedback = "", last;
  let activeModelIndex = 0;

  for (let i = 0; i < MAX_TRIES; i++) {
    const contentPayload = [...parts, ...(feedback ? [{ text: feedback }] : [])];
    let res = null;
    let lastError = null;
    const attemptErrors = [];

    // Danh sách model thử: ưu tiên model đã hoạt động thành công
    const modelsToTry = [
      modelsToUse[activeModelIndex],
      ...modelsToUse.filter((_, idx) => idx !== activeModelIndex),
    ];

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.0,
          },
        });
        res = await model.generateContent(contentPayload);
        activeModelIndex = modelsToUse.indexOf(modelName);
        break; // Thành công
      } catch (err) {
        lastError = err;
        const errMsg = err?.message || String(err);
        attemptErrors.push(`[${modelName}]: ${errMsg}`);
        console.warn(`[khbd-pipeline] Model ${modelName} gặp lỗi: ${errMsg}`);

        // Nếu API Key không hợp lệ thì dừng ngay lập tức
        if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("API key not valid")) {
          throw new Error("Khóa Gemini API Key không hợp lệ. Vui lòng kiểm tra lại mã API trong nút 'Cài API Key'.");
        }

        // Nếu gặp lỗi limit '0' (Google không cấp quota cho model này trên tài khoản mới), bỏ qua ngay lập tức
        if (errMsg.includes("limit '0'") || errMsg.includes('limit "0"')) {
          console.warn(`[khbd-pipeline] Model ${modelName} bị Google gán quota limit = 0 trên tài khoản này, tự động chuyển model khác.`);
          continue;
        }

        // Nếu gặp 429 thông thường, tạm dừng 1.5 giây để Google mở lại cửa sổ rate limit
        if (errMsg.includes("429") || errMsg.includes("Quota exceeded") || errMsg.includes("RESOURCE_EXHAUSTED")) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        // Tự động chuyển sang model tiếp theo trong danh sách
        continue;
      }
    }

    if (!res) {
      const allErrorsText = attemptErrors.join("; ");
      const isQuotaError =
        allErrorsText.includes("429") ||
        allErrorsText.includes("Quota exceeded") ||
        allErrorsText.includes("RESOURCE_EXHAUSTED");
      const hasLimitZero =
        allErrorsText.includes("limit '0'") || allErrorsText.includes('limit "0"');

      if (isQuotaError) {
        let note = "";
        if (hasLimitZero) {
          note = `\n• Lưu ý: Google thường gán hạn ngạch = 0 cho model gemini-2.0-flash đối với tài khoản mới. Hệ thống đã tự động chuyển sang gemini-1.5-flash.`;
        }
        throw new Error(
          `Hạn ngạch gọi Gemini API miễn phí (Free Tier) tạm thời đạt giới hạn (429 Too Many Requests).\n` +
          `Nguyên nhân chính:\n` +
          `1. Địa chỉ IP mạng Internet (Wi-Fi trường học/cơ quan/nhà) vừa gửi nhiều yêu cầu liên tiếp, Google tạm ngắt kết nối trong 1–2 phút.\n` +
          `2. Trình duyệt chưa lưu khóa API mới (vui lòng bấm nút 'Cài API Key' màu vàng để kiểm tra và bấm 'Lưu khóa API').\n` +
          `3. Khóa API mới tạo trên AI Studio cần 1–2 phút để Google kích hoạt trên hệ thống toàn cầu.${note}\n\n` +
          `Cách khắc phục:\n` +
          `• Chờ 1–2 phút rồi bấm lại nút "Soạn Kế Hoạch Bài Dạy".\n` +
          `• Phản hồi chi tiết từ Google: ${attemptErrors.slice(-2).join(" | ")}`
        );
      }
      throw new Error(
        `Không thể gọi mô hình Gemini AI. Chi tiết: ${attemptErrors[attemptErrors.length - 1] || lastError?.message || "Lỗi kết nối"}`
      );
    }

    let json;
    try {
      json = JSON.parse(res.response.text());
    } catch {
      feedback = "Lần trước không phải JSON hợp lệ. Chỉ trả JSON đúng schema.";
      continue;
    }

    const { data, errors } = validateKhbd(json, selected, selectedAi, options);
    last = data;
    if (!errors.length) return renderKhbd(data, { mon: options.mon, tiet: options.tiet });
    feedback = "Sửa các lỗi sau rồi trả lại toàn bộ JSON:\n- " + errors.join("\n- ");
  }

  // Hết lượt gọi lại: vẫn xuất file với bản tốt nhất đã chuẩn hoá (còn lỗi nhẹ giáo viên tự chỉnh)
  if (last) return renderKhbd(last, { mon: options.mon, tiet: options.tiet });
  throw new Error("Không tạo được kế hoạch bài dạy, vui lòng thử lại.");
}
module.exports = { processKhbd };
