import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'groups',
    loadComponent: () =>{
      console.log('Menu Groups sayfası yükleniyor...'); // Debug için
      return import('../menu-groups/menu-groups.page').then(m => m.MenuGroupsPage)
    }
  },
  {
    path: 'option-groups',
    loadComponent: () =>{
      console.log('Option Groups sayfası yükleniyor...'); // Debug için
      return import('../option-group/option-group.page').then(m => m.OptionGroupPage)
    }
  },
  {
    path: 'option-group-items',
    loadComponent: () =>{
      console.log('Option Group Items sayfası yükleniyor...'); // Debug için
      return import('../option-group-item/option-group-item.page')
        .then(m => m.OptionGroupItemPage)
    }
  },
];

export default routes;
