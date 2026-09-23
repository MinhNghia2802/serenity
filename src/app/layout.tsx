import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthNavigation from "@/components/AuthNavigation";
import BackgroundMusic from "@/components/BackgroundMusic";
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
            <Suspense fallback={<nav className="nav" aria-label="Điều hướng chính"><Link href="/login">Đăng nhập</Link></nav>}>
              <AuthNavigation />
            </Suspense>
          </div>
        </header>
        {children}
        <BackgroundMusic />
      </body>
    </html>
  );
}
