import { CartItem } from "src/app/interfaces/ui-model";
import { Bosp } from "./Bosp";

// utils/cart-utils.ts
export class CartUtils {

  static getSafeCart(): CartItem[] {
    try {
      const raw = localStorage.getItem('cart');

      if (!raw || raw.includes('[object')) {
        return [];
      }

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed as CartItem[];

    } catch {
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
