import { NextResponse } from "next/server";
import path from "path";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let fileObj: { name: string; buffer: Buffer } | null = null;
    let mon = "Tin học";
    let tiet = "";
    let codes: Array<{ ma: string; noi_dung: string }> = [];
    let apiKey = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (file && typeof file === "object" && "arrayBuffer" in file) {
        const ab = await file.arrayBuffer();
        fileObj = {
          name: file.name,
          buffer: Buffer.from(ab),
        };
      }
      mon = (formData.get("mon") as string) || (formData.get("subject") as string) || "Tin học";
      tiet = (formData.get("tiet") as string) || "";
      const codesRaw = formData.get("codes") as string;
      if (codesRaw) {
        try {
          codes = typeof codesRaw === "string" ? JSON.parse(codesRaw) : codesRaw;
        } catch {
          codes = [];
        }
      }
      apiKey = (formData.get("apiKey") as string) || "";
    } else {
      const body = await req.json();
      mon = body.mon || body.subject || "Tin học";
      tiet = body.tiet || "";
      codes = body.codes || [];
      apiKey = body.apiKey || "";

      if (body.fileBase64 && body.fileName) {
        fileObj = {
          name: body.fileName,
          buffer: Buffer.from(body.fileBase64, "base64"),
        };
      } else if (body.uploadedPlanContent) {
        fileObj = {
          name: body.fileName || "giao_an.txt",
          buffer: Buffer.from(body.uploadedPlanContent, "utf8"),
        };
      }
    }

    if (apiKey) {
      process.env.GEMINI_API_KEY = apiKey;
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Chưa có Gemini API Key. Vui lòng bấm nút 'Cài API Key' (màu vàng) trên thanh công cụ để nhập khóa API miễn phí từ Google AI Studio.",
        },
        { status: 400 }
      );
    }

    if (!fileObj || !fileObj.buffer || fileObj.buffer.length === 0) {
      return NextResponse.json(
        { error: "Vui lòng tải lên file Kế hoạch bài dạy cần tích hợp (.docx, .pdf hoặc .txt)." },
        { status: 400 }
      );
    }

    // Nối trực tiếp vào pipeline.js trong thư mục khbd-renderer
    const { processKhbd } = require("../../../../khbd-renderer/pipeline");

    const docxBuffer = await processKhbd(fileObj, { mon, tiet, codes });

    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="KHBD_${encodeURIComponent(mon)}_${tiet || "1"}.docx"`,
      },
    });
  } catch (error: any) {
    console.error("API khbd error:", error);
    const message = error?.message || "Không tạo được kế hoạch bài dạy, vui lòng thử lại.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
