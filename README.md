# Giáo Viên Số Tiểu Học (.app) 🎓

> Ứng dụng Web hỗ trợ giáo viên Tiểu học tích hợp chuẩn **Bảng chỉ báo Năng lực số Lớp 1, 2, 3 (Phụ lục Công văn 3456/BGDĐT)** vào **Kế hoạch bài dạy theo Công văn 2345/BGDĐT-GDTH**, sẵn sàng triển khai 1-click lên **Vercel** với tên miền miễn phí `*.vercel.app`.

---

## ✨ Điểm nổi bật & Chuẩn hóa Sư phạm Tiểu học

1. **Chuẩn Phụ lục 3 - Công văn 2345/BGDĐT-GDTH**:
   - Cấu trúc chuẩn 4 phần của cấp Tiểu học:
     - `I. YÊU CẦU CẦN ĐẠT` (Năng lực đặc thù, Năng lực chung, **Năng lực số**, Phẩm chất).
     - `II. ĐỒ DÙNG DẠY HỌC` (Phân định Đồ dùng GV và Đồ dùng HS).
     - `III. CÁC HOẠT ĐỘNG DẠY HỌC CHỦ YẾU` (Phân tách rành mạch **Hoạt động của giáo viên** và **Hoạt động của học sinh** qua 4 tiến trình: *Khởi động* $\rightarrow$ *Khám phá* $\rightarrow$ *Luyện tập/Thực hành* $\rightarrow$ *Vận dụng/Trải nghiệm*).
     - `IV. ĐIỀU CHỈNH SAU BÀI DẠY` (Mục bắt buộc).

2. **Tích hợp chính xác 52 Mã chỉ báo NLS Lớp 1-3**:
   - Nạp đầy đủ dữ liệu từ file `MA_NLS/Bang_chi_bao_NLS_L123.md` (thuộc 6 Miền năng lực: *Thông tin & dữ liệu*, *Giao tiếp & hợp tác*, *Sáng tạo nội dung số*, *An toàn số*, *Giải quyết vấn đề*, và *Trí tuệ nhân tạo AI*).
   - Tự động gắn các mã chính xác như `[1.1.CB1a]`, `[2.1.CB1a]`, `[4.3.CB1a]`, `[6.3.CB1a]` vào đúng hoạt động.

3. **Giao diện tra cứu & Sao chép mã chỉ báo**:
   - Bộ lọc và tìm kiếm nhanh toàn bộ 52 mã chỉ báo trực tiếp trên web.
   - Nút chép mã 1-click tiện lợi cho giáo viên khi soạn kế hoạch dạy học cá nhân.

4. **Xuất file Word (`.docx`) chuẩn mẫu giáo án Tiểu học**:
   - Font Times New Roman, cỡ 13-14pt, lề chuẩn trang in văn bản hành chính Việt Nam.

---

## 🛠️ Cài đặt & Chạy trên máy tính (Local)

1. Mở PowerShell tại thư mục dự án:
   ```bash
   cd C:\Users\ADMIN\Desktop\Giao-vien-so
   ```

2. Chạy ứng dụng:
   ```bash
   npm run dev
   ```

3. Mở trình duyệt tại: `http://localhost:3000`

---

## 🚀 Hướng dẫn Triển khai lên Vercel

```bash
git add .
git commit -m "Cap nhat chuan CV 2345 va Bang ma chi bao NLS Lop 1-3"
git push -u origin main
```
Sau đó truy cập **[Vercel.com](https://vercel.com)** $\rightarrow$ Import repository $\rightarrow$ Điền biến môi trường `GEMINI_API_KEY` $\rightarrow$ Deploy để nhận link `https://[ten-du-an].vercel.app`.
