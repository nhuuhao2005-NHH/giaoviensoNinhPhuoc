// src/lib/gemini.ts — Nối trực tiếp vào khbd-renderer/pipeline.js
import path from "path";

export async function generateLessonWithKhbd(
  file: { name: string; buffer: Buffer },
  options: { mon: string; tiet?: string; codes: Array<{ ma: string; noi_dung: string }> }
) {
  const pipelinePath = path.resolve(process.cwd(), "khbd-renderer/pipeline.js");
  const { processKhbd } = require(pipelinePath);
  return processKhbd(file, options);
}
