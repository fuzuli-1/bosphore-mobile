import { Component, inject, NgZone, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
 
import { IMenuGroup, IMenuGroupItem, NewMenuGroup } from 'src/app/interfaces/interfaces';
import { AccountService } from 'src/app/core/auth/account.service';
import { TranslationService } from 'src/app/services/translation-service';
import {
  ITEMS_PER_PAGE,
  PAGE_HEADER,
  TOTAL_COUNT_RESPONSE_HEADER,
} from 'src/app/config/pagination.constants';
import { SortService, SortState, sortStateSignal } from 'src/app/shared/sort';
import { combineLatest, Subscription, tap } from 'rxjs';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { DEFAULT_SORT_DATA, SORT } from 'src/app/config/navigation.constants';
import { HttpResponse } from '@angular/common/http';
 
import { ModalController } from '@ionic/angular';
import { GroupFormComponent } from './group-form.component';
import { ItemFormComponent } from './item-form.component';
import { AlertController } from '@ionic/angular';
import { TranslatePipe } from 'src/app/services/TranslatePipe';
import { MenuGroupItemService } from '../../menu-grup/menu-group-item/menu-group-item-service';
import { MenuGroupService } from '../../menu-grup/menu-groups/menu-group-service';
 

@Component({
  selector: 'app-menu-management',
  templateUrl: './menu-management.page.html',
  styleUrls: ['./menu-management.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslatePipe],
})
export class MenuManagementPage implements OnInit {

  isLoading = false;
  totalItems = 0;
  page = 1;
  itemsPerPage = ITEMS_PER_PAGE;
  sortState = sortStateSignal({});
  subscription: Subscription | null = null;
  //injects
  protected ngZone = inject(NgZone);
  private toastc = inject(ToastController);
  private menuGroupService = inject(MenuGroupService);
  private menuItemService=inject(MenuGroupItemService);
  private account = inject(AccountService);
  private ts = inject(TranslationService);
  private modalCtrl = inject(ModalController);
  private activatedRoute = inject(ActivatedRoute);
  private sortService = inject(SortService);
  private alertCtrl = inject(AlertController);

  private router = inject(Router);

  //items
  newGroup: IMenuGroup = {} as IMenuGroup;
  selectedGroup:IMenuGroup= {} as IMenuGroup;
  allGroups = signal<IMenuGroup[]>([]);
  //secilen gruptaki alt grup sayisi
 

  categoryItems =signal<IMenuGroupItem[]>([]);
  selectedCategories =signal<IMenuGroupItem[]>([]);
  selectedSubCategory:IMenuGroupItem={} as IMenuGroupItem;
  selectedSubCategoryId=0;

  constructor() {}

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.subscription = combineLatest([
      this.activatedRoute.queryParamMap,
      this.activatedRoute.data,
    ])
      .pipe(
        tap(([params, data]) => {
          const page = params.get(PAGE_HEADER);
          this.page = +(page ?? 1);
          this.sortState.set(
            this.sortService.parseSortParam(
              params.get(SORT) ?? data[DEFAULT_SORT_DATA],
            ),
          );
        }),
        tap(() => {
          return this.load();
        }),
      )
      .subscribe();
  }

  load(): void {
    const { page } = this;
    this.isLoading = true;
    const pageToLoad: number = page;
    const queryObject: any = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      sort: this.sortService.buildSortParam(this.sortState()),
    };

    this.menuGroupService
      .query(queryObject)
      .pipe(tap(() => (this.isLoading = false)))
      .subscribe({
        next: (res: HttpResponse<IMenuGroup[]>) => {
          const headers = res.headers;
          this.totalItems = Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
          const groups = res.body ?? [];
          this.allGroups.set(groups);
          if (groups.length > 0) {         
            this.loadCategoryItems(groups[0].id);
              // Sayfa açılınca ilk grubu seçili yap
            this.selectGroup(groups[0])
          }
        },
      });
  }

  loadCategoryItems(groupId: number) {
  const queryObject: any = {
      menuGroupId:groupId,
      page: 0,
      size: this.itemsPerPage+50,
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    this.menuItemService.query(queryObject).subscribe(items => {
      const data=items.body??[];
      this.categoryItems.set(data); 
      this.selectedCategories.set(data);
       this.selectedGroup.itemCount=data.length;
    });
  }

 selectGroup(group :IMenuGroup){
   this.selectedGroup=group;
   this.loadCategoryItems(group.id);
  /*  let data: IMenuGroupItem[]=this.categoryItems().filter(t=>t.menuGroup?.id==group.id)??[];
   this.selectedCategories.set(data);
   this.selectedGroup.itemCount=data.length; */
 }

  protected handleNavigation(page: number, sortState: SortState): void {
    const queryParamsObj = {
      page,
      size: this.itemsPerPage,
      sort: this.sortService.buildSortParam(sortState),
    };

    this.ngZone.run(() => {
      this.router.navigate(['./'], {
        relativeTo: this.activatedRoute,
        queryParams: queryParamsObj,
      });
    });
  }

// GRUP EKLEME / DÜZENLEME MODALI
// GRUP KAYDET
async openGroupModal(group?: IMenuGroup) {
  const modal = await this.modalCtrl.create({
    component: GroupFormComponent,
    componentProps: { group: group || null }
  });

  modal.onDidDismiss().then((result) => {
    if (result.data) {
      const groupData = result.data;
      if (groupData.id) {
        // Düzenleme
        this.menuGroupService.update(groupData).subscribe(() => this.load());
      } else {
        // Yeni Kayıt
        groupData.language={id:1};
        this.menuGroupService.create(groupData).subscribe(() => this.load());
      }
    }
  });
  return await modal.present();
}


// ITEM KAYDET
async openItemModal(item?: IMenuGroupItem) {
  const modal = await this.modalCtrl.create({
    component: ItemFormComponent,
    componentProps: { 
      item: item || null,
      menuGroupId: this.selectedGroup.id 
    }
  });

  modal.onDidDismiss().then((result) => {
    if (result.data) {
      const itemData = result.data;
       let groupId=this.selectedGroup.id;
      if (itemData.id) {
         itemData.language={id:itemData.languageId}; 
           itemData.menuGroup={...this.selectedGroup,groupId};        
        this.menuItemService.update(itemData).subscribe(() => this.loadCategoryItems(this.selectedGroup.id));
      } else {
        // Yeni Kayıt (create metodu servisde yoksa eklemelisin kanki)
       
        itemData.language={id:itemData.languageId};
        itemData.menuGroup={...this.selectedGroup,groupId};
        this.menuItemService.create(itemData).subscribe(() => this.loadCategoryItems(this.selectedGroup.id));
      }
    }
  });
  return await modal.present();
}

deleteItem(item: any) {

  this.alertCtrl.create({
    header: this.ts.instant('DELETE_ITEM'),
    message: this.ts.instant('CONFIRM_DELETE_ITEM'),
    buttons: [
      { text:  this.ts.instant('CANCEL'), role: 'cancel' },
      { text: this.ts.instant('DELETE'), role: 'destructive', handler: () => {
           this.menuItemService.delete(item.id).subscribe({
            next:(res=>{ 
              this.showToast(this.ts.instant('ITEM_DELETED_SUCCESSFULLY'), 'bottom');
              this.loadCategoryItems(this.selectedGroup.id); // Listeyi yenile
  
            }),
            error:(err=>{
                  this.showToast(err.detail, 'bottom');
            })
           });
      } }
    ]
  }).then(alert => alert.present());
}

editItem(item: any) {
    this.openItemModal(item);
}

  editGroup(group:any){
    this.openGroupModal(group);

  }

deleteGroup(group: any) {
  this.alertCtrl.create({
    header: this.ts.instant('DELETE_GROUP'),
    message: this.ts.instant('CONFIRM_DELETE_GROUP'),
    buttons: [
      { text: this.ts.instant('CANCEL'), role: 'cancel' },
      {
        text: this.ts.instant('DELETE'),
        role: 'destructive',
        handler: () => {
          this.menuGroupService.delete(group.id).subscribe({
            next: () => {
              this.showToast(this.ts.instant('GROUP_DELETED_SUCCESSFULLY'), 'bottom');
              this.loadGroups();
            },
            error: (resp) => {
              console.error(resp.error.detail);
              this.showToast(this.ts.instant('DELETE_OPERATION_FAILED') + resp.error.detail, 'bottom');
            }
          });
        }
      }
    ]
  }).then(alert => alert.present());
}
  

  // Örnek bir Save işlemi
  saveMenuGrup() {
    const ngp: NewMenuGroup = {
      ...this.newGroup,
      id: null,
    };

    this.menuGroupService.create(ngp).subscribe((res) => {
      this.showToast('Grup başarıyla eklendi!', 'bottom');
      this.loadGroups(); // Listeyi yenile
    });
  }

  async showToast(msg: string, position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastc.create({
      message: msg,
      duration: 2500,
      cssClass: 'custom-toast-success',
      icon: 'checkmark-done-outline',
      position: position,
    });
    await toast.present();
  }
}
