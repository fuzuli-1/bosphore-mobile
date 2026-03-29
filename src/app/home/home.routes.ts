// src/app/home/home.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth-guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home.page').then((m) => m.HomePage),
    children: [
      {
        path: 'adrese-teslim',
        loadComponent: () =>
          import('../pages/adrese-teslim/adrese-teslim.page').then(
            (m) => m.AdreseTeslimPage,
          ),
      },
      {
        path: 'adres-list',
        loadComponent: () =>
          import('../pages/adres-list/adres-list.page').then(
            (m) => m.AdresListPage,
          ),
      },
      {
        path: 'adres-map',
        loadComponent: () =>
          import('../pages/adres-map/adres-map.page').then(
            (m) => m.AdresMapPage,
          ),
      },
      {
        path: 'adres-map-detail',
        loadComponent: () =>
          import('../pages/adres-map-detail/adres-map-detail.page').then(
            (m) => m.AdresMapDetailPage,
          ),
      },
    ],
  },
];

export default routes;
