import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Giáo Viên Số .App - Trợ lý Tích hợp Năng lực số vào Kế hoạch bài dạy (CV 5512)",
  description:
    "Ứng dụng web hỗ trợ giáo viên phổ thông tích hợp chuẩn Khung Năng lực số và công cụ EdTech vào giáo án chuẩn Công văn 5512/BGDĐT-GDTrH.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>" />
      </head>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-800">
        {children}
      </body>
    </html>
  );
}
