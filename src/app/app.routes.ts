import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    children: [
      {
        path: 'siparisler',
        loadComponent: () => import('./pages/products/products.page').then(m => m.ProductsPage),
      },
    ],
  },
  {
    path: 'app-product-detail/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.page').then(m => m.ProductDetailPage),
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then(m => m.CartPage),
  },
  {
    path: 'menu-groups',
    loadComponent: () => import('./pages/menu-groups/menu-groups.page').then( m => m.MenuGroupsPage)
  },
];
