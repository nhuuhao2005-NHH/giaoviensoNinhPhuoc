# Prompt dán vào Antigravity

Hãy tích hợp thư mục `khbd-renderer/` (đã đính kèm trong dự án) vào web app hiện tại, theo đúng các bước sau.
KHÔNG viết lại logic bên trong các file này; chỉ nối chúng vào app.

1. Giữ nguyên thư mục `khbd-renderer/` gồm: `render-khbd.js`, `validate-khbd.js`, `schema-and-prompt.js`, `pipeline.js`.
2. Cài thư viện: `npm i docx mammoth @google/generative-ai`.
3. Đặt biến môi trường `GEMINI_API_KEY`. Nếu app đã có khóa Gemini thì dùng lại khóa đó.
4. XÓA các đoạn code cũ đang bảo Gemini "tạo file Word giống mẫu" hoặc đang chuyển markdown thành Word, và bỏ prompt cũ
   (lời chào, "chuyên gia giáo dục", Ninh Phước, Công văn 2345…). Chỉ dùng `systemInstruction` trong `schema-and-prompt.js`.
5. Ở backend, khi giáo viên bấm tạo kế hoạch bài dạy, gọi:
   `processKhbd({ name: tênFile, buffer: bufferFile }, { mon, tiet, codes })`
   - `mon`: môn giáo viên chọn trên web app (ví dụ "Công nghệ").
   - `tiet`: tiết giáo viên chọn/nhập (ví dụ "2").
   - `codes`: danh sách mã Năng lực số giáo viên đã chọn, dạng `[{ ma: "4.1.CB1a", noi_dung: "..." }]`.
   Kết quả là Buffer `.docx`, trả về cho giáo viên tải xuống (xem `route-example.js` để biết cách trả file).
6. KHÔNG dùng `KHBD_MAU.docx` làm đầu vào cho Gemini nữa. Bố cục Word do `render-khbd.js` tạo ra.
7. Chạy `node example-usage.js` để kiểm tra: phải ra file `KHBD_output.docx` có bảng 2 cột GV | HS.
8. Sau đó thử với 2-3 giáo án thật và báo lại kết quả, đừng tự ý sửa quy tắc trong prompt.

Quy tắc đã chốt (không thay đổi):
- Dòng đầu: "MÔN: <môn in hoa>   TIẾT: <tiết>"; môn và tiết lấy từ lựa chọn của giáo viên trên app.
- Khởi động 5 phút; các hoạt động còn lại là số phút cố định, không dùng chữ "khoảng"; tổng 35 phút.
- Bảng Phần III: mỗi bước một hàng, GV bên trái và HS bên phải; câu bắt đầu bằng "GV"/"HS"; không lặp tiêu đề bảng khi sang trang.
- Mã Năng lực số ở Phần I: "4.1.CB1a: nội dung" (không có chữ "Mã", không ngoặc vuông).
- Tích hợp trong hoạt động ở mức nhẹ, tự nhiên, không dùng nhãn "Liên hệ"; hình thức tùy đồ dùng của giáo viên.
- Phần IV: hai dòng dấu chấm.
