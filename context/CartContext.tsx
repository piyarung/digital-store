'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/product';
import toast from 'react-hot-toast';

interface CartContextType {
  cart: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isClient]);

  const addToCart = (product: Product) => {
    // 💡 ย้ายการตรวจสอบและ Toast ออกมาไว้ด้านนอก setCart
    const exists = cart.find((item) => item.id === product.id);
    
    if (exists) {
      toast.error('สินค้านี้อยู่ในตะกร้าสินค้าของคุณแล้วครับ');
      return;
    }
    
    toast.success('เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว');
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.success('ลบสินค้าออกจากตะกร้าแล้ว');
  };

  const clearCart = () => {
    setCart([]);
    toast.success('ล้างตะกร้าสินค้าแล้ว');
  };

  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}