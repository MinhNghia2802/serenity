import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Serenity — Hiểu cảm xúc của bạn",
  description: "Không gian check-in cảm xúc riêng tư và nhẹ nhàng.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <header className="site-header">
          <div className="container site-header__inner">
            <Link className="brand" href="/">serenity.</Link>
            <nav className="nav" aria-label="Điều hướng chính">
              <Link href="/dashboard">Tổng quan</Link>
              <Link href="/history">Lịch sử</Link>
              <Link href="/settings">Cài đặt</Link>
              <Link className="button" href="/check-in">Check-in ngay</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
