import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'cart',
    loadComponent: () =>
      import('../cart/cart.page').then(m => m.CartPage),
  },
  /*{
    path: 'checkout',
    loadComponent: () =>
      import('../checkout/checkout.page').then(m => m.CheckoutPage),
  }, */
];

export default routes;
