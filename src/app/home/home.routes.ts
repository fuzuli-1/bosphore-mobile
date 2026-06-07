// src/app/home/home.routes.ts
import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home.page').then((m) => m.HomePage),
    children: [
      {
        path: 'adrese-teslim',
        loadComponent: () =>{
          console.log('Adrese Teslim sayfası yükleniyor...'); // Debug için
          return import('../pages/adres/adrese-teslim/adrese-teslim.page').then(
            (m) => m.AdreseTeslimPage
          )
        }
      },
      {
        path: 'adres-list',
        loadComponent: () =>{
          console.log('Adres List sayfası yükleniyor...'); // Debug için
          return import('../pages/adres/adres-list/adres-list.page').then(
            (m) => m.AdresListPage,
          ) 
        }
      }, {
        path: 'adres-map',
        loadComponent: () =>{
          console.log('Adres Map sayfası yükleniyor...'); // Debug için
          return import('../pages/adres/adres-map/adres-map.page').then(
            (m) => m.AdresMapPage,
          )}
      },
      {
        path: 'adres-map-detail',
        loadComponent: () =>{
          console.log('Adres Map Detail sayfası yükleniyor...'); // Debug için
          return import('../pages/adres/adres-map-detail/adres-map-detail.page').then(
            (m) => m.AdresMapDetailPage,
          )}
      },


    ],
  },
];

export default routes;
