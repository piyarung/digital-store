'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { Trash2, ShoppingBag, ArrowLeft, CreditCard, Loader2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, removeFromCart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [popup, setPopup] = useState({ show: false, title: '', message: '' });

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. ตรวจสอบสถานะล็อกอินก่อนไปจ่ายเงิน
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง');
        router.push('/login');
        return;
      }

      // 2. ดำเนินการไปหน้าจ่ายเงินตามปกติ
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setPopup({
          show: true,
          title: 'เกิดข้อผิดพลาด',
          message: data.error || 'ไม่สามารถสร้างรายการชำระเงินได้'
        });
      }
    } catch (error) {
      console.error(error);
      setPopup({
        show: true,
        title: 'ข้อผิดพลาดเครือข่าย',
        message: 'ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <span>ตะกร้าสินค้าของคุณ</span>
          </h1>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:underline"
            >
              ล้างตะกร้าทั้งหมด
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">ยังไม่มีสินค้าในตะกร้า</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">เลือกชมสินค้าดิจิทัลคุณภาพสูงและเพิ่มลงในตะกร้าได้เลย</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-medium text-sm transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>เลือกซื้อสินค้า</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm flex items-center gap-4 transition-colors"
                >
                  <img
                    src={item.image_url || 'https://via.placeholder.com/150'}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate mt-1">
                      {item.title}
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-extrabold text-base mt-1">
                      ฿{Number(item.price).toLocaleString('th-TH')}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                    title="ลบสินค้า"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm sticky top-24">
                <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-4">สรุปคำสั่งซื้อ</h2>
                
                <div className="space-y-3 text-sm pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>จำนวนสินค้า</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{cart.length} ชิ้น</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>ประเภทการจัดส่ง</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">ดาวน์โหลดอัตโนมัติ</span>
                  </div>
                </div>

                <div className="py-4 flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-white">ราคารวมทั้งสิ้น</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    ฿{totalPrice.toLocaleString('th-TH')}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 px-4 rounded-2xl text-sm transition-colors shadow-md disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังไปหน้าชำระเงิน...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>ดำเนินการชำระเงิน</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {popup.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setPopup({ ...popup, show: false })} 
          />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl transform transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-inner bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                {popup.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                {popup.message}
              </p>
              <button
                onClick={() => setPopup({ ...popup, show: false })}
                className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl transition-colors text-sm"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}