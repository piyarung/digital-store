import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia' as any,
});

export async function POST(req: Request) {
  try {
    const { cart, userId, userEmail } = await req.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'ไม่มีสินค้าในตะกร้า' }, { status: 400 });
    }

    // 1. แปลงสินค้าในตะกร้าให้อยู่ในรูปแบบที่ Stripe อ่านได้ (ราคาต้องคูณ 100 เพื่อเปลี่ยนเป็นสตางค์)
    const lineItems = cart.map((item: any) => ({
      price_data: {
        currency: 'thb',
        product_data: {
          name: item.title,
          images: item.image_url ? [item.image_url] : [],
          description: item.category,
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: 1,
    }));

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // 2. สร้าง Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      customer_email: userEmail || undefined,
    });

    // 3. บันทึกประวัติการสั่งซื้อลงใน Supabase (บันทึกออเดอร์)
    const totalPrice = cart.reduce((sum: number, item: any) => sum + Number(item.price), 0);
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        user_email: userEmail || 'guest@example.com',
        total_amount: totalPrice,
        status: 'completed', // ถือว่าจ่ายสำเร็จสำหรับโหมดทดสอบ
        stripe_session_id: session.id,
      })
      .select()
      .single();

    if (!orderError && orderData) {
      // บันทึกรายการสินค้าในคำสั่งซื้อ (order_items)
      const orderItems = cart.map((item: any) => ({
        order_id: orderData.id,
        product_id: item.id,
        price: item.price,
      }));

      await supabase.from('order_items').insert(orderItems);
    }

    // ส่ง URL หน้าชำระเงินของ Stripe กลับไปให้ Frontend
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}