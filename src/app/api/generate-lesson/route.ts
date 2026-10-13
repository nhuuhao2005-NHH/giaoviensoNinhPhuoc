import { NextResponse } from "next/server";
import { generateLessonWithGemini } from "@/lib/gemini";

export const maxDuration = 60; // Allow up to 60s for LLM processing on Vercel

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      subject,
      grade,
      lessonTitle,
      duration = "1 tiết (45 phút)",
      learningObjectives,
      infrastructureLevel = "Máy chiếu của giáo viên",
      apiKey,
    } = body;

    if (!subject || !grade || !lessonTitle || !learningObjectives) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ các thông tin bắt buộc: Môn học, Khối lớp, Tên bài dạy và Yêu cầu cần đạt." },
        { status: 400 }
      );
    }

    const lessonPlan = await generateLessonWithGemini({
      apiKey,
      subject,
      grade,
      lessonTitle,
      duration,
      learningObjectives,
      infrastructureLevel,
    });

    return NextResponse.json({
      success: true,
      lessonPlan,
    });
  } catch (error: unknown) {
    console.error("API error:", error);
    const message =
      error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
