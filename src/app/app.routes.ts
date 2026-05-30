import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/admin-guard';
//app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>{
      console.log('Login sayfası yükleniyor...'); // Debug için
      return import('./pages/login/login.page').then((m) => m.LoginPage);
    }
    
    },{
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],  // ✅ bunu ekle
    children: [
      {
        path: 'home',
        loadChildren: () => {
          console.log('Home sayfası yükleniyor...'); // Debug için
          return import('./home/home.routes').then((m) => m.default)
        }
      },
      {
        path: 'products',
        loadChildren: () =>{
          console.log('Products sayfası yükleniyor...'); // Debug için
          return import('./pages/products/products.routes').then((m) => m.default)
        }
         
      },
      {
        path: 'menus',
        loadChildren: () =>{
          console.log('Menus sayfası yükleniyor...'); // Debug için
          return import('./pages/menu/menu.routes').then((m) => m.default)
        }
      },
      {
        path: 'payments',
        loadChildren: () =>{
          console.log('Payments sayfası yükleniyor...'); // Debug için
          return import('./pages/payments/payments.routes').then((m) => m.default)
        }
      },
      {
        path: 'order-history',
        loadComponent: () =>{
          console.log('Order History sayfası yükleniyor...'); // Debug için
          return import('./pages/order-history/order-history.page').then(
            (m) => m.OrderHistoryPage,
          );
        }
      },
            {
        path: 'address',
        loadComponent: () =>{
          console.log('Address sayfası yükleniyor...'); // Debug için
          return import('./pages/address/address.page').then((m) => m.AddressPage)
        } 
      },
      {
        path: 'kitchen',
        canActivate: [AdminGuard],
        loadComponent: () =>  {
          console.log('Kitchen sayfası yükleniyor...'); // Debug için
          return import('./pages/kitchen/kitchen.page').then((m) => m.KitchenPage)
        }
         
      },

        {
    path: 'menu-management',
    loadComponent: () =>  {
      console.log('Menu Management sayfası yükleniyor...'); // Debug için
      return   import('./pages/menu-management/menu-management.page').then( m => m.MenuManagementPage)
    }
  },
  
       {
        path: 'order-detail/:orderId',
        loadComponent: () =>{
          console.log('Order Detail sayfası yükleniyor...'); // Debug için
          return import('./pages/order-detail/order-detail.page').then(
            (m) => m.OrderDetailPage
          )
        }
      },
       {
        path: 'order-success',
        loadComponent: () =>{
          console.log('Order Success sayfası yükleniyor...'); // Debug için
          return import('./pages/order-success/order-success.page').then(
            (m) => m.OrderSuccessPage,
          )
        }
      },
    ],
  },
  {
    path: 'otp-verification',
    loadComponent: () => {
      console.log('OTP Verification sayfası yükleniyor...'); // Debug için
      return import('./pages/otp-verification/otp-verification.page').then( m => m.OtpVerificationPage)
    }
  },
  {
    path: 'category',
    loadComponent: () => {
      console.log('Category sayfası yükleniyor...'); // Debug için
      return import('./pages/category/category.page').then( m => m.CategoryPage)
    }
  },
  {
    path: 'language',
    loadComponent: () => {
      console.log('Language sayfası yükleniyor...'); // Debug için
      return import('./pages/language/language.page').then( m => m.LanguagePage)
    }
  },
  {
    path: 'option-management',
    loadComponent: () => {
      console.log('Option Management sayfası yükleniyor...'); // Debug için
      return import('./pages/option-management/option-management.page').then( m => m.OptionManagementPage)
    }
  },

 

 

 

 
];
