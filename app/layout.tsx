import './globals.css';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Digital Store - สินค้าดิจิทัลคุณภาพสูง',
  description: 'คลังรวม Digital Product, E-Book, Source Code, Templates',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#FAFAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen`}>
        <CartProvider>
          {children}
        </CartProvider>
        {/* ตั้งค่า Toaster แจ้งเตือนให้เข้ากับธีม Light/Dark */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            className: '!bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 font-medium text-sm',
          }}
        />
      </body>
    </html>
  );
}