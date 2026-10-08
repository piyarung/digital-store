'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Store, UserPlus, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    } else {
      setSuccessMessage('สมัครสมาชิกสำเร็จ! กำลังนำคุณไปหน้าเข้าสู่ระบบ...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-2xl text-blue-600 mb-6">
          <Store className="w-8 h-8" />
          <span>DIGITAL STORE</span>
        </Link>
        <h2 className="text-center text-2xl font-black text-gray-900">
          สมัครสมาชิกใหม่
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            เข้าสู่ระบบที่นี่
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-2xl sm:px-10">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
              {successMessage}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ยืนยันรหัสผ่าน
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิก'}</span>
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <Link href="/" className="flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-800">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับสู่หน้าหลัก</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}