import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/admin-guard';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ── AUTH GEREKTİRMEYEN SAYFALAR ──────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'order-success',
    loadComponent: () =>
      import('src/app/pages/order-success/order-success.page').then(m => m.OrderSuccessPage)
  },
  {
    path: 'otp-verification',
    loadComponent: () =>
      import('./pages/otp-verification/otp-verification.page').then(m => m.OtpVerificationPage)
  },

  // ── KORUNAN SAYFALAR (AuthGuard) ─────────────────
  {
    path: '',
    canActivate: [AuthGuard],
    children: [

      // Kullanıcı sayfaları
      {
        path: 'home',
        loadChildren: () =>
          import('src/app/home/home.routes').then(m => m.default)
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./pages/products/products.routes').then(m => m.default)
      },
      {
        path: 'menus',
        loadChildren: () =>
          import('./pages/menu-grup/menu.routes').then(m => m.default)
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./pages/payments/payments.routes').then(m => m.default)
      },
      {
        path: 'order-history',
        loadComponent: () =>
          import('./pages/order-history/order-history.page').then(m => m.OrderHistoryPage)
      },
      {
        path: 'order-detail/:orderId',
        loadComponent: () =>
          import('./pages/order-detail/order-detail.page').then(m => m.OrderDetailPage)
      },
      {
        path: 'address',
        loadComponent: () =>
          import('./pages/adres/address/address.page').then(m => m.AddressPage)
      },

      // Admin sayfaları
      {
        path: 'kitchen',
        canActivate: [AdminGuard],
        loadComponent: () =>
          import('./pages/kitchen/kitchen.page').then(m => m.KitchenPage)
      },
      {
        path: 'menu-management',
        canActivate: [AdminGuard],
        loadComponent: () =>
          import('./pages/definitions/menu-management/menu-management.page').then(m => m.MenuManagementPage)
      },
      {
        path: 'category',
        canActivate: [AdminGuard],
        loadComponent: () =>
          import('./pages/definitions/category/category.page').then(m => m.CategoryPage)
      },
      {
        path: 'language',
        canActivate: [AdminGuard],
        loadComponent: () =>
          import('./pages/definitions/language/language.page').then(m => m.LanguagePage)
      },
      {
        path: 'option-management',
        canActivate: [AdminGuard],
        loadComponent: () =>
          import('./pages/definitions/option-management/option-management.page').then(m => m.OptionManagementPage)
      },
      {
        path: 'product-option-group',
        canActivate: [AdminGuard],
        loadChildren: () =>
          import('./pages/definitions/product-option-group/product-option-group.routes').then(m => m.default)
      },
        {
          path: 'variation',
          loadComponent: () => import('./pages/variation/variation.page').then( m => m.VariationPage)
        }
    ]
  },

  // ── YÖNLENDİRME ──────────────────────────────────
  { path: '**', redirectTo: 'login' },



];