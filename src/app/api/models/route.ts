import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = (body.apiKey || "").trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "Vui lòng nhập mã Google Gemini API Key để truy vấn." },
        { status: 400 }
      );
    }

    // Truy vấn trực tiếp Google API với chính API Key của thầy/cô
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg =
        data?.error?.message ||
        (res.status === 400
          ? "Khóa API không hợp lệ. Vui lòng kiểm tra lại mã API lấy từ https://aistudio.google.com/."
          : `Lỗi kết nối từ Google API (Mã phản hồi: ${res.status}).`);
      return NextResponse.json({ error: errMsg }, { status: res.status });
    }

    if (!data || !Array.isArray(data.models)) {
      return NextResponse.json(
        { error: "Google API không trả về danh sách mô hình." },
        { status: 500 }
      );
    }

    // Lọc chính xác các model đang thực sự tồn tại và sẵn sàng tạo nội dung (generateContent)
    const availableModels = data.models
      .filter(
        (m: any) =>
          Array.isArray(m.supportedGenerationMethods) &&
          m.supportedGenerationMethods.includes("generateContent")
      )
      .map((m: any) => {
        const id = (m.name || "").replace(/^models\//, "");
        return {
          id,
          name: m.name,
          displayName: m.displayName || id,
          description: m.description || "",
          supportedGenerationMethods: m.supportedGenerationMethods || [],
          inputTokenLimit: m.inputTokenLimit || 0,
          outputTokenLimit: m.outputTokenLimit || 0,
          isFlash: id.toLowerCase().includes("flash"),
          isPro: id.toLowerCase().includes("pro"),
        };
      });

    // Sắp xếp: Luôn luôn ưu tiên gemini-3.5-flash lên hàng đầu
    availableModels.sort((a: any, b: any) => {
      const score = (name: string) => {
        const lower = name.toLowerCase();
        if (lower === "gemini-3.5-flash") return 1000;
        if (lower.includes("3.5-flash")) return 900;
        if (lower === "gemini-1.5-flash") return 100;
        if (lower.includes("1.5-flash-8b")) return 95;
        if (lower === "gemini-2.0-flash") return 90;
        if (lower.includes("2.0-flash-lite")) return 85;
        if (lower.includes("flash")) return 80;
        if (lower === "gemini-1.5-pro") return 70;
        return 50;
      };
      return score(b.id) - score(a.id);
    });

    return NextResponse.json({
      success: true,
      apiKeyMasked: `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`,
      total: availableModels.length,
      models: availableModels,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Không thể kết nối đến máy chủ Google." },
      { status: 500 }
    );
  }
}
