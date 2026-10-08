'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { CheckCircle2, Download, PackageCheck } from 'lucide-react';

export default function SuccessPage() {
  const { clearCart } = useCart();

  // ล้างตะกร้าสินค้าเมื่อชำระเงินสำเร็จ
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              ชำระเงินสำเร็จแล้ว!
            </h1>
            <p className="text-gray-500 text-sm">
              ขอบคุณที่สนับสนุนสินค้าดิจิทัลของเรา คุณสามารถดาวน์โหลดไฟล์สินค้าได้จากหน้าประวัติการสั่งซื้อทันที
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/orders"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดสินค้าของคุณ</span>
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3.5 rounded-xl text-sm transition-colors"
            >
              <PackageCheck className="w-4 h-4" />
              <span>เลือกซื้อสินค้าเพิ่ม</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}