'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';
import { PlusCircle, Trash2, Package, Loader2, LogOut, Pencil, X, Save, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const CATEGORIES = ['eBook', 'Template', 'Source Code', 'Online Course'];

// กำหนดประเภทของ Popup
type PopupType = 'success' | 'error' | 'confirm' | null;

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State สำหรับโหมดแก้ไขสินค้า
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  // 🌟 State สำหรับ Custom Popup
  const [popup, setPopup] = useState<{
    show: boolean;
    type: PopupType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ show: false, type: null, title: '', message: '' });

  // ฟังก์ชันเปิด-ปิด Popup
  const showPopup = (type: PopupType, title: string, message: string, onConfirm?: () => void) => {
    setPopup({ show: true, type, title, message, onConfirm });
  };
  const closePopup = () => setPopup({ ...popup, show: false });

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    setLoading(true);
    const isAdmin = sessionStorage.getItem('is_admin');
    if (isAdmin === 'true') {
      fetchProducts();
      return;
    }
    // ถ้าไม่ได้ล็อกอิน เด้งกลับหน้า login
    router.push('/login');
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showPopup('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลสินค้าได้');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('is_admin');
    sessionStorage.removeItem('admin_email');
    router.push('/login');
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setTitle(product.title);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setCategory(product.category);
    setImageUrl(product.image_url || '');
    setFileUrl(product.file_url || '');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory(CATEGORIES[0]);
    setImageUrl('');
    setFileUrl('');
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const productData = {
      title,
      description,
      price: parseFloat(price),
      category,
      image_url: imageUrl || 'https://via.placeholder.com/600x400',
      file_url: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    };

    if (editingId) {
      // โหมดแก้ไข
      const { error } = await supabase.from('products').update(productData).eq('id', editingId);
      if (error) {
        showPopup('error', 'บันทึกไม่สำเร็จ', error.message);
      } else {
        showPopup('success', 'สำเร็จ', 'อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว!');
        handleCancelEdit();
        fetchProducts();
      }
    } else {
      // โหมดเพิ่มใหม่
      const { error } = await supabase.from('products').insert([productData]);
      if (error) {
        showPopup('error', 'เพิ่มสินค้าไม่สำเร็จ', error.message);
      } else {
        showPopup('success', 'สำเร็จ', 'เพิ่มสินค้าใหม่ลงระบบเรียบร้อยแล้ว!');
        handleCancelEdit();
        fetchProducts();
      }
    }
    setSubmitting(false);
  };

  const handleDeleteProduct = (id: string, productTitle: string) => {
    // 🌟 เรียกใช้ Popup แบบ Confirm แทนการใช้ confirm() ของเบราว์เซอร์
    showPopup(
      'confirm',
      'ยืนยันการลบสินค้า',
      `คุณต้องการลบสินค้า "${productTitle}" ใช่หรือไม่? (ไม่สามารถกู้คืนได้)`,
      async () => {
        // 1. ลบรายการประวัติคำสั่งซื้อที่อ้างอิงถึงสินค้านี้ก่อน เพื่อแก้ปัญหา Foreign Key Constraint
        const { error: orderItemsError } = await supabase
          .from('order_items')
          .delete()
          .eq('product_id', id);

        if (orderItemsError) {
          showPopup('error', 'ลบไม่สำเร็จ', 'ไม่สามารถลบประวัติที่เชื่อมโยงกับสินค้านี้ได้: ' + orderItemsError.message);
          return;
        }

        // 2. ลบสินค้าออกจากตาราง products
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          showPopup('error', 'ลบไม่สำเร็จ', error.message);
        } else {
          showPopup('success', 'ลบสำเร็จ', 'ลบสินค้าออกจากระบบแล้ว!');
          if (editingId === id) handleCancelEdit();
          fetchProducts();
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-sm shadow-indigo-600/20">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ระบบหลังบ้าน Admin
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">จัดการข้อมูลสินค้าดิจิทัลในร้านค้าของคุณ</p>
            </div>
          </div>

          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/30 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all shadow-sm active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">ออกจากระบบ Admin</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ฟอร์มเพิ่ม / แก้ไขสินค้า */}
          <div className="lg:col-span-1">
            <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border p-6 shadow-sm sticky top-24 transition-all duration-300 ${editingId ? 'border-amber-300 dark:border-amber-500/50 ring-4 ring-amber-100 dark:ring-amber-500/10' : 'border-slate-200/80 dark:border-slate-800'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                  {editingId ? (
                    <>
                      <Pencil className="w-5 h-5 text-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400">แก้ไขสินค้าดิจิทัล</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <span>เพิ่มสินค้าดิจิทัลใหม่</span>
                    </>
                  )}
                </h2>

                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>ยกเลิก</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitProduct} className="space-y-5 text-sm">
                <div className="space-y-1.5">
                  <label className="block font-medium text-slate-700 dark:text-slate-300">ชื่อสินค้า</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="เช่น E-Book เรียนรู้ Next.js"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-slate-700 dark:text-slate-300">หมวดหมู่</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-slate-700 dark:text-slate-300">ราคา (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="290.00"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-slate-700 dark:text-slate-300">รายละเอียดสินค้า</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="อธิบายรายละเอียดสั้นๆ..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-slate-700 dark:text-slate-300">URL รูปภาพสินค้า</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-slate-700 dark:text-slate-300">URL ลิงก์ดาวน์โหลดไฟล์</label>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/... หรือ Supabase Storage"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full flex items-center justify-center gap-2 font-medium py-3.5 rounded-2xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-4 text-white ${
                    editingId
                      ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{editingId ? 'กำลังบันทึก...' : 'กำลังเพิ่ม...'}</span>
                    </>
                  ) : editingId ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>บันทึกการแก้ไข</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>เพิ่มสินค้าลงระบบ</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ตารางแสดงและจัดการรายการสินค้า */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
              <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-6 flex items-center gap-2">
                <span>รายการสินค้าทั้งหมด</span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {products.length} รายการ
                </span>
              </h2>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <p className="text-sm">กำลังโหลดรายการสินค้า...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p>ยังไม่มีสินค้าในระบบ</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                        editingId === item.id
                          ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-500/10 dark:border-amber-500/50'
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={item.image_url || 'https://via.placeholder.com/150'}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate mt-1">
                            {item.title}
                          </h3>
                          <p className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm mt-0.5">
                            ฿{Number(item.price).toLocaleString('th-TH')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/20 rounded-xl transition-colors"
                          title="แก้ไขสินค้า"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(item.id, item.title)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-xl transition-colors"
                          title="ลบสินค้า"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 🌟 Custom Popup Modal (แสดงผลเมื่อ popup.show เป็น true) */}
      {popup.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={popup.type !== 'confirm' ? closePopup : undefined} 
          />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl transform transition-all">
            <div className="flex flex-col items-center text-center">
              
              {/* ไอคอนตามประเภท */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 shadow-inner ${
                popup.type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                popup.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' :
                'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
              }`}>
                {popup.type === 'success' && <CheckCircle2 className="w-8 h-8" />}
                {popup.type === 'error' && <XCircle className="w-8 h-8" />}
                {popup.type === 'confirm' && <AlertTriangle className="w-8 h-8" />}
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                {popup.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
                {popup.message}
              </p>

              {/* ปุ่มกด */}
              <div className="flex w-full gap-3">
                {popup.type === 'confirm' ? (
                  <>
                    <button
                      onClick={closePopup}
                      className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl transition-colors text-sm"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={() => {
                        if (popup.onConfirm) popup.onConfirm();
                        closePopup();
                      }}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-2xl transition-colors shadow-md shadow-red-500/20 text-sm"
                    >
                      ยืนยันการลบ
                    </button>
                  </>
                ) : (
                  <button
                    onClick={closePopup}
                    className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-colors shadow-md shadow-indigo-500/20 text-sm"
                  >
                    ตกลง
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}