'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { Search, Sparkles, Layers } from 'lucide-react';

const CATEGORIES = ['ทั้งหมด', 'eBook', 'Template', 'Source Code', 'Online Course'];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'ทั้งหมด' || product.category === selectedCategory;
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <section className="relative overflow-hidden pt-16 pb-20 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-indigo-200/40 via-purple-200/30 to-blue-200/40 dark:from-indigo-900/30 dark:via-purple-900/20 dark:to-blue-900/30 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-indigo-700 dark:text-indigo-400 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>คลังรวม Digital Product เกรดพรีเมียม</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            ยกระดับงานของคุณด้วย <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              สินทรัพย์ดิจิทัลคุณภาพสูง
            </span>
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            ดาวน์โหลดทันทีหลังชำระเงิน ซื้อครั้งเดียวใช้งานได้ตลอดไป ทั้ง Source Code, Templates, E-Books และคอร์สเรียนระดับมืออาชีพ
          </p>

          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 w-5 h-5 transition-colors" />
              <input
                type="text"
                placeholder="ค้นหาสินค้าที่คุณสนใจ (เช่น React, Next.js, Figma)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-13 pr-5 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-lg shadow-slate-900/15 dark:shadow-indigo-600/30 scale-105'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-slate-200/60 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-slate-800 max-w-md mx-auto">
            <Layers className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-semibold text-base">ไม่พบสินค้าที่คุณกำลังหา</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่นดูนะครับ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}