'use client';

import { Product } from '@/types/product';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  // 🌟 ฟังก์ชันจัดการเมื่อกดปุ่มเพิ่มลงตะกร้า
  const handleAddToCart = async () => {
    // 1. ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
    const { data: { user } } = await supabase.auth.getUser();

    // 2. ถ้ายังไม่ล็อกอิน ให้แจ้งเตือนและพาไปหน้า Login
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
      router.push('/login');
      return;
    }

    // 3. ถ้าล็อกอินแล้ว ให้ทำงานเพิ่มสินค้าตามปกติ
    addToCart(product);
  };

  return (
    <div className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-500 ease-out flex flex-col justify-between overflow-hidden">
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 rounded-t-3xl">
          <img
            src={product.image_url || 'https://via.placeholder.com/600x400'}
            alt={product.title}
            className="object-cover w-full h-full group-hover:scale-108 transition-transform duration-700 ease-out"
          />
          <span className="absolute top-3.5 left-3.5 bg-slate-900/80 dark:bg-slate-950/80 text-slate-100 text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {product.category}
          </span>
        </div>

        <div className="p-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
            {product.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mt-2 leading-relaxed font-normal">
            {product.description}
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-100/80 dark:border-slate-800/80 mt-2">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 block">ราคา</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">฿</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {Number(product.price).toLocaleString('th-TH')}
            </span>
          </div>
        </div>

        <button
          onClick={handleAddToCart} // 👈 เปลี่ยนมาใช้ฟังก์ชันดักจับตรงนี้
          className="relative inline-flex items-center gap-2 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-md active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>เพิ่มลงตะกร้า</span>
        </button>
      </div>
    </div>
  );
}