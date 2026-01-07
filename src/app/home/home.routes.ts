// src/app/home/home.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth-guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home.page').then(m => m.HomePage),
    children: [

     
    ],
  },
];

export default routes;
