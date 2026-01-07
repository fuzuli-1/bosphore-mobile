//src/app/pages/products/products.routes.ts
import { Routes } from '@angular/router';

 
 
const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./products.page').then(m => m.ProductsPage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./product-detail/product-detail.page')
        .then(m => m.ProductDetailPage),
  },
];

export default routes;
