# Giáo Viên Số (.app) 🎓

> Ứng dụng Web hỗ trợ giáo viên tích hợp chuẩn **Khung Năng lực số** vào **Kế hoạch bài dạy (Giáo án theo Công văn 5512/BGDĐT-GDTrH)**, sẵn sàng triển khai 1-click lên **Vercel** với tên miền miễn phí `*.vercel.app`.

---

## ✨ Tính năng nổi bật

1. **Chuẩn hóa Công văn 5512**:
   - Tự động xây dựng kế hoạch bài dạy 4 hoạt động chuẩn mực: *Khởi động*, *Hình thành kiến thức*, *Luyện tập*, *Vận dụng*.
   - Đầy đủ 4 bước tổ chức: *Chuyển giao nhiệm vụ*, *Thực hiện nhiệm vụ*, *Báo cáo thảo luận*, *Kết luận nhận định*.

2. **Tích hợp Khung Năng lực số (NLS)**:
   - Dựa trên chuẩn DigComp 2.2 và hướng dẫn chuyển đổi số giáo dục của Bộ GD&ĐT.
   - Gợi ý cụ thể chỉ số phát triển: NLS1 (Khai thác thông tin số), NLS2 (Giao tiếp & hợp tác số), NLS3 (Sáng tạo nội dung số), NLS5 (Giải quyết vấn đề bằng công nghệ số).

3. **Gợi ý công cụ EdTech thực tế**:
   - Tự động đề xuất phần mềm phù hợp với hạ tầng trường học: GeoGebra, PhET Interactive, Padlet, Canva, Quizizz, Kahoot, Google Earth...

4. **Xuất file Word (.docx) 1-Click**:
   - Định dạng chuẩn thể thức văn bản: Font Times New Roman, cỡ chữ 13-14pt, lề chuẩn trang in.

---

## 🛠️ Cài đặt & Chạy trên máy tính (Local)

1. Mở cửa sổ dòng lệnh (Terminal/PowerShell) tại thư mục dự án:
   ```bash
   cd C:\Users\ADMIN\Desktop\Giao-vien-so
   ```

2. Cài đặt các thư viện:
   ```bash
   npm install
   ```

3. Chạy môi trường phát triển:
   ```bash
   npm run dev
   ```

4. Truy cập trình duyệt tại: `http://localhost:3000`

---

## 🚀 Hướng dẫn Triển khai lên Vercel (Nhận link .vercel.app Miễn phí)

### Bước 1: Khởi tạo Git & Đẩy lên GitHub
Trong thư mục dự án, chạy:
```bash
git init
git add .
git commit -m "Khoi tao du an Giao Vien So"
git branch -M main
```
Tạo một kho chứa (Repository) mới trên [GitHub.com](https://github.com), sau đó liên kết và đẩy code:
```bash
git remote add origin https://github.com/[username-cua-ban]/[ten-repo].git
git push -u origin main
```

### Bước 2: Deploy trên Vercel
1. Truy cập [vercel.com](https://vercel.com/) và đăng nhập bằng tài khoản GitHub.
2. Bấm **"Add New Project"** và chọn kho GitHub bạn vừa tải lên.
3. Trong mục **Environment Variables**, thêm biến:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `[Khóa API Gemini của bạn lấy từ aistudio.google.com]`
4. Bấm **Deploy**. Sau 1 phút, bạn sẽ có trang web hoạt động với đường dẫn:
   `https://[tên-bạn-chọn].vercel.app`

---

## 📄 Bản quyền
Dành riêng cho cộng đồng giáo viên và đổi mới giáo dục Việt Nam.
