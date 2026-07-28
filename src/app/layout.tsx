import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Couple Planner - Lịch & Kế Hoạch Đôi ❤️',
  description: 'Ứng dụng quản lý kế hoạch, mục tiêu, sự kiện và lịch chung cho cặp đôi (Anh & Em).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
