import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'groups',
    loadComponent: () =>
      import('../menu-groups/menu-groups.page').then(m => m.MenuGroupsPage),
  },
  {
    path: 'option-groups',
    loadComponent: () =>
      import('../option-group/option-group.page').then(m => m.OptionGroupPage),
  },
  {
    path: 'option-group-items',
    loadComponent: () =>
      import('../option-group-item/option-group-item.page')
        .then(m => m.OptionGroupItemPage),
  },
];

export default routes;
