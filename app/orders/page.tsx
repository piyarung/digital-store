'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { Package, Download, Calendar, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

interface OrderItem {
  id: string;
  price: number;
  products: {
    id: string;
    title: string;
    category: string;
    image_url: string;
    file_url: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  order_items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .or(`user_id.eq.${user.id},user_email.eq.${user.email}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <span>ประวัติการสั่งซื้อของคุณ</span>
          </h1>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>เลือกซื้อสินค้าเพิ่ม</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm">กำลังโหลดประวัติการสั่งซื้อ...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">ยังไม่มีประวัติการสั่งซื้อ</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">เมื่อคุณชำระเงินสำเร็จ สินค้าดิจิทัลจะมาแสดงที่หน้านี้ทันที</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-medium text-sm transition-colors shadow-sm"
            >
              <span>ไปที่คลังสินค้า</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                <div className="bg-slate-50/50 dark:bg-slate-800/40 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(order.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span>•</span>
                    <span className="font-mono text-slate-400">ID: {order.id.substring(0, 8)}...</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ชำระเงินเรียบร้อย</span>
                    </span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-base">
                      ฿{Number(order.total_amount).toLocaleString('th-TH')}
                    </span>
                  </div>
                </div>

                <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800">
                  {order.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.products?.image_url || 'https://via.placeholder.com/150'}
                          alt={item.products?.title || 'สินค้าดิจิทัล'}
                          className="w-16 h-16 object-cover rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                            {item.products?.category}
                          </span>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-1">
                            {item.products?.title}
                          </h3>
                          <p className="text-slate-400 text-xs mt-0.5">
                            ราคา: ฿{Number(item.price).toLocaleString('th-TH')}
                          </p>
                        </div>
                      </div>

                      <a
                        href={item.products?.file_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl font-medium text-xs transition-colors shadow-sm self-start sm:self-center"
                      >
                        <Download className="w-4 h-4" />
                        <span>ดาวน์โหลดไฟล์</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}