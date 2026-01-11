import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
//app.routes.ts
 export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage),
  },

  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.routes').then(m => m.default),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./pages/products/products.routes').then(m => m.default),
      },
      {
        path: 'menus',
        loadChildren: () =>
          import('./pages/menu/menu.routes').then(m => m.default),
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./pages/payments/payments.routes').then(m => m.default),
      },
    ],
  },
 

];

