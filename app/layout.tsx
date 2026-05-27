import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from './components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PineTrace - Theo dõi lộ trình Đà Lạt',
  description: 'Ứng dụng đồng bộ hoạt động chạy bộ từ Strava',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-white`}>
        {/* Navbar sẽ xuất hiện ở tất cả các trang */}
        <Navbar /> 
        
        {/* Phần nội dung thay đổi của từng trang (Dashboard, Login...) */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}