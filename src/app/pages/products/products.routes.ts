//src/app/pages/products/products.routes.ts
import { Routes } from '@angular/router';

 
 
const routes: Routes = [
  {
    path: '',
    loadComponent: () =>{
      console.log('Products sayfası yükleniyor...'); // Debug için
      return import('./products.page').then(m => m.ProductsPage)
    }
  },
  {
    path: ':id',
    loadComponent: () =>{
      console.log('Product Detail sayfası yükleniyor...'); // Debug için
      return import('./product-detail/product-detail.page')
        .then(m => m.ProductDetailPage)
    }
  },
];

export default routes;
