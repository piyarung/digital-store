'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Store, User, LogOut, Package, Sun, Moon } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { cart } = useCart();

  useEffect(() => {
    // 1. ตรวจสอบธีมเดิมที่เคยบันทึกไว้ หรือตั้งค่าตามระบบปฏิทิน/เครื่องผู้ใช้
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // 2. ดึงข้อมูล User ปัจจุบันจาก Supabase Auth
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🌙/☀️ ฟังก์ชันสลับธีม Dark / Light Mode
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('is_admin');
    sessionStorage.removeItem('admin_email');
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* โลโก้ร้านค้า */}
        <Link href="/" className="flex items-center gap-2 font-black text-xl text-indigo-600 dark:text-indigo-400 tracking-tight">
          <Store className="w-6 h-6" />
          <span>DIGITAL STORE</span>
        </Link>

        {/* เมนูทางขวา */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* ☀️/🌙 ปุ่มสลับ Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-300 active:scale-90"
            title={isDarkMode ? 'สลับเป็น Light Mode' : 'สลับเป็น Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* ปุ่มตะกร้าสินค้า */}
          <Link
            href="/cart"
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                {cart.length}
              </span>
            )}
          </Link>

          {/* แสดงผลตามสถานะการล็อกอิน */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/orders"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 bg-slate-100/80 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors"
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">ประวัติการซื้อ</span>
              </Link>
              
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden md:inline truncate max-w-[130px]">
                {user.email}
              </span>

              <button
                onClick={handleLogout}
                title="ออกจากระบบ"
                className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium text-xs transition-all shadow-sm active:scale-95"
            >
              <User className="w-4 h-4" />
              <span>เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}