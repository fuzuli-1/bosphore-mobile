import { CartItem } from "src/app/interfaces/ui-model";
import { Bosp } from "./Bosp";

// utils/cart-utils.ts
export class CartUtils {


  static getSafeCart(): CartItem[] {
  try {
    const raw = localStorage.getItem('cart');

    if (!raw) return [];

    if (raw.includes('[object')) {
      localStorage.removeItem('cart');
      return [];
    }

    const parsed = JSON.parse(raw);

    // 🔥 ARRAY DEĞİLSE SAR
    if (Array.isArray(parsed)) {
      return parsed;
    }

    // 🔥 TEK OBJECT GELMİŞSE ARRAY'E ÇEVİR
    if (typeof parsed === 'object') {
      return [parsed as CartItem];
    }

    return [];
  } catch (e) {
    console.error('Cart parse error', e);
    localStorage.removeItem('cart');
    return [];
  }
}

 

  static saveCart(cart: CartItem[]) {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Raw localStorage cart:', localStorage.getItem('cart'));
    console.log('Type:', typeof localStorage.getItem('cart'));
    console.log('Length:', localStorage.getItem('cart')?.length);
  }

  static clearCart() {
    localStorage.removeItem('cart');
  }
}
