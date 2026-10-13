// route-example.js — Ví dụ nối vào web app (Express + multer). Nếu app dùng framework khác (Next.js, Fastify…)
// chỉ cần giữ nguyên lời gọi processKhbd(file, options) bên trong.
// Cài: npm i express multer
const express = require("express");
const multer = require("multer");
const { processKhbd } = require("./pipeline");

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// Form gửi lên: file (giáo án), mon, tiet, codes (JSON: [{ma, noi_dung}, ...])
app.post("/api/khbd", upload.single("file"), async (req, res) => {
  try {
    const buf = await processKhbd(
      { name: req.file.originalname, buffer: req.file.buffer },
      { mon: req.body.mon, tiet: req.body.tiet, codes: JSON.parse(req.body.codes || "[]") }
    );
    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="KHBD.docx"`,
    });
    res.send(buf);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Không tạo được kế hoạch bài dạy, vui lòng thử lại." });
  }
});
app.listen(3000);
