import { Routes } from '@angular/router';
//payment.routes.ts
const routes: Routes = [
  {
    path: 'cart',
    loadComponent: () =>{
      console.log('Cart sayfası yükleniyor...'); // Debug için
      return import('../cart/cart.page').then(m => m.CartPage)
    }
  },
  /*{
    path: 'checkout',
    loadComponent: () =>{
      console.log('Checkout sayfası yükleniyor...'); // Debug için
      return import('../checkout/checkout.page').then(m => m.CheckoutPage),
    }
  }, */
];

export default routes;
