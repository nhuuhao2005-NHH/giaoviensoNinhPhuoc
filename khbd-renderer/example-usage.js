const fs = require("fs");
const { renderKhbd } = require("./render-khbd");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const { responseSchema, systemInstruction } = require("./schema-and-prompt");

async function main() {
  const selectedSubject = "Công nghệ"; // lấy từ ô chọn môn học trên web app
  const selectedLesson = "2"; // lấy từ ô chọn/nhập tiết trên web app
  // 1) Thực tế: gọi Gemini lấy JSON
  // const model = new GoogleGenerativeAI(KEY).getGenerativeModel({
  //   model: "gemini-2.5-pro", systemInstruction,
  //   generationConfig: { responseMimeType: "application/json", responseSchema, temperature: 0.2 },
  // });
  // const res = await model.generateContent([lessonText, "Mã chọn: 4.1.CB1a, 4.3.CB1a"]);
  // const data = JSON.parse(res.response.text());
  const data = JSON.parse(fs.readFileSync("./sample-khbd.json", "utf8"));

  // 2) Dựng docx
  fs.writeFileSync("KHBD_output.docx", await renderKhbd(data, { mon: selectedSubject, tiet: selectedLesson }));
}
main();
