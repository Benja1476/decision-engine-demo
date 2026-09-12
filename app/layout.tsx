import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Decision Intelligence — Demo",
  description: "ระบบช่วยตัดสินใจซื้อสินค้าโดยใช้ข้อมูลและกฎที่ตรวจสอบได้",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <div className="demo-banner">
          DEMO ONLY — ข้อมูลจาก DummyJSON ไม่ใช่ข้อมูลสินค้าจริง (§155)
        </div>
        <header className="site-header">
          <a href="/" className="wordmark">Product Decision Intelligence</a>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
