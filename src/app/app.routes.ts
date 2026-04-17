import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/admin-guard';
//app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadChildren: () => import('./home/home.routes').then((m) => m.default),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./pages/products/products.routes').then((m) => m.default),
      },
      {
        path: 'menus',
        loadChildren: () =>
          import('./pages/menu/menu.routes').then((m) => m.default),
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./pages/payments/payments.routes').then((m) => m.default),
      },
      {
        path: 'order-history',
        loadComponent: () =>
          import('./pages/order-history/order-history.page').then(
            (m) => m.OrderHistoryPage,
          ),
      },
            {
        path: 'address',
        loadComponent: () =>
          import('./pages/address/address.page').then((m) => m.AddressPage),
      },
      {
        path: 'kitchen',
        canActivate: [AdminGuard],
        loadComponent: () =>
          import('./pages/kitchen/kitchen.page').then((m) => m.KitchenPage),
      },

        {
    path: 'menu-management',
    loadComponent: () => import('./pages/menu-management/menu-management.page').then( m => m.MenuManagementPage)
  },
  
       {
        path: 'order-detail/:orderId',
        loadComponent: () =>
          import('./pages/order-detail/order-detail.page').then(
            (m) => m.OrderDetailPage,
          ),
      },
       {
        path: 'order-success',
        loadComponent: () =>
          import('./pages/order-success/order-success.page').then(
            (m) => m.OrderSuccessPage,
          ),
      },
    ],
  },
  {
    path: 'otp-verification',
    loadComponent: () => import('./pages/otp-verification/otp-verification.page').then( m => m.OtpVerificationPage)
  },
  {
    path: 'category',
    loadComponent: () => import('./pages/category/category.page').then( m => m.CategoryPage)
  },
  {
    path: 'language',
    loadComponent: () => import('./pages/language/language.page').then( m => m.LanguagePage)
  },
 

 

 

 
];
