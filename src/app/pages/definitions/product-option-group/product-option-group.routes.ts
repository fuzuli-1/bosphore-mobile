import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/product-option-group-list.page')
        .then(m => m.ProductOptionGroupListPage)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/product-option-group-form.page')  // ✅ 'pages/' değil 'form/'
        .then(m => m.ProductOptionGroupFormPage)
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/product-option-group-form.page')  // ✅ aynı şekilde
        .then(m => m.ProductOptionGroupFormPage)
  }
];

export default routes;