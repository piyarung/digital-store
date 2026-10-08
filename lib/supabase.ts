import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('คำเตือน: กรุณาระบุ Supabase URL และ Anon Key ใน .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);