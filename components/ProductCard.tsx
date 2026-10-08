'use client';

import { Product } from '@/types/product';
import { ShoppingCart, ArrowUpRight, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="group relative bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-500 ease-out flex flex-col justify-between overflow-hidden">
      
      {/* เอฟเฟกต์เรืองแสงเบาๆ ขอบการ์ดตอน Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-purple-500/0 group-hover:via-indigo-500/10 transition-all duration-700 pointer-events-none" />

      <div>
        {/* รูปภาพสินค้าพร้อม Zoom Effect และ Badge กระจกฝ้า */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 rounded-t-3xl">
          <img
            src={product.image_url || 'https://via.placeholder.com/600x400'}
            alt={product.title}
            className="object-cover w-full h-full group-hover:scale-108 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <span className="absolute top-3.5 left-3.5 bg-slate-900/70 text-slate-100 text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {product.category}
          </span>
        </div>

        {/* รายละเอียดสินค้า */}
        <div className="p-6">
          <h3 className="font-bold text-slate-900 text-lg tracking-tight line-clamp-1 group-hover:text-indigo-600 transition-colors duration-300">
            {product.title}
          </h3>
          <p className="text-slate-500 text-sm line-clamp-2 mt-2 leading-relaxed font-normal">
            {product.description}
          </p>
        </div>
      </div>

      {/* ราคาสินค้าและปุ่มสั่งซื้อ */}
      <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-100/80 mt-2">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">ราคา</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-bold text-indigo-600">฿</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {Number(product.price).toLocaleString('th-TH')}
            </span>
          </div>
        </div>

        <button
          onClick={() => addToCart(product)}
          className="relative inline-flex items-center gap-2 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-indigo-600 hover:to-violet-600 text-white px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-md shadow-slate-900/10 hover:shadow-indigo-500/25 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>เพิ่มลงตะกร้า</span>
        </button>
      </div>
    </div>
  );
}