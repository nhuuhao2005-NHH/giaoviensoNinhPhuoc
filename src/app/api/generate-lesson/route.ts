import { NextResponse } from "next/server";
import { generateLessonWithGemini } from "@/lib/gemini";

export const maxDuration = 60; // Up to 60s for Vercel Serverless

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      subject,
      grade = "Lớp 3",
      lessonTitle,
      duration = "1 tiết (35 phút)",
      learningObjectives,
      infrastructureLevel = "Ti vi / Màn hình tương tác",
      integrateDigital = true,
      integrateAI = true,
      selectedNLS = [],
      selectedAI = [],
      teacherSuggestions = "",
      uploadedPlanContent = "",
      apiKey,
    } = body;

    if (!subject || !lessonTitle) {
      return NextResponse.json(
        { error: "Vui lòng chọn Môn học và nhập Tên bài dạy." },
        { status: 400 }
      );
    }

    const lessonPlan = await generateLessonWithGemini({
      apiKey,
      subject,
      grade,
      lessonTitle,
      duration,
      learningObjectives: learningObjectives || "Theo chuẩn kiến thức kĩ năng môn học",
      infrastructureLevel,
      integrateDigital,
      integrateAI,
      selectedNLS,
      selectedAI,
      teacherSuggestions,
      uploadedPlanContent,
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
