import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import {
  Component,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { combineLatest, Subscription, tap } from 'rxjs';
import {
  ITEMS_PER_PAGE,
  PAGE_HEADER,
  TOTAL_COUNT_RESPONSE_HEADER,
} from 'src/app/config/pagination.constants';
import {
  IMenuGroup,
  IMenuGroupItem,
  NewMenuGroup,
} from 'src/app/interfaces/interfaces';
import { TranslatePipe } from 'src/app/services/TranslatePipe';
import { SortService, sortStateSignal } from 'src/app/shared/sort';
import { MenuGroupService } from '../../menu-grup/menu-groups/menu-group-service';
import { MenuGroupItemService } from '../../menu-grup/menu-group-item/menu-group-item-service';
import { AccountService } from 'src/app/core/auth/account.service';
import { TranslationService } from 'src/app/services/translation-service';

import { ActivatedRoute, Router } from '@angular/router';
import { DEFAULT_SORT_DATA, SORT } from 'src/app/config/navigation.constants';
import { GroupFormComponent } from './group-form.component';
import { ItemFormComponent } from './item-form.component';
import {
  IonBackButton,
  IonItemSliding,
  IonToolbar,
  IonIcon,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonChip,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonMenuButton,
  IonTitle,
  IonList,
  IonListHeader,
  IonItem,
  IonItemOption,
  ModalController,
  ToastController,
  AlertController,
  IonHeader,
  IonButtons,
  IonButton,
  IonAvatar,
  IonItemOptions,
} from '@ionic/angular/standalone';
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
import { AppUtil } from 'src/app/shared/utils/app-util';

// ✅ Temiz component
@Component({
  selector: 'app-menu-management',
  templateUrl: './menu-management.page.html',
  styleUrls: ['./menu-management.page.scss'],
  standalone: true,
  imports: [
    IonItemOptions,
    IonAvatar,
    IonBackButton,
    IonButton,
    IonButtons,
    IonHeader,
    CommonModule,
    FormsModule,
    TranslatePipe,
    IonToolbar,
    IonIcon,
    IonItemOption,
    IonBadge,
    IonList,
    IonItemSliding,
    IonItem,
    IonListHeader,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonChip,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    IonHeader,
    IonButtons,
    IonMenuButton,
    IonTitle,
  ],
})
export class MenuManagementPage implements OnInit, OnDestroy {
  isLoading = signal(false); // ✅ signal'e çevir
  totalItems = 0;
  page = 1;
  itemsPerPage = ITEMS_PER_PAGE;
  sortState = sortStateSignal({});
  subscription: Subscription | null = null;

  protected ngZone = inject(NgZone);
  private toastc = inject(ToastController);
  private menuGroupService = inject(MenuGroupService);
  private menuItemService = inject(MenuGroupItemService);
  private account = inject(AccountService);
  private ts = inject(TranslationService);
  private modalCtrl = inject(ModalController);
  private activatedRoute = inject(ActivatedRoute);
  private sortService = inject(SortService);
  private alertCtrl = inject(AlertController);

  private router = inject(Router);
  private readonly acfs = inject(ApplicationConfigService);
  public url = this.acfs.getEndpointFor('');
  public appUtil = inject(AppUtil);

  allGroups = signal<IMenuGroup[]>([]);
  selectedGroup = signal<IMenuGroup | null>(null); // ✅ signal + null
  selectedCategories = signal<IMenuGroupItem[]>([]);

  ngOnInit() {
    this.loadGroups();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe(); // ✅ memory leak önle
  }

  loadGroups() {
    this.subscription?.unsubscribe(); // ✅ öncekini temizle
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
        tap(() => this.load()),
      )
      .subscribe();
  }

  load(): void {
    this.isLoading.set(true);
    const queryObject = {
      page: this.page - 1,
      size: this.itemsPerPage,
      sort: this.sortService.buildSortParam(this.sortState()),
    };

    this.menuGroupService.query(queryObject).subscribe({
      next: (res: HttpResponse<IMenuGroup[]>) => {
        this.totalItems = Number(res.headers.get(TOTAL_COUNT_RESPONSE_HEADER));
        const groups = res.body ?? [];
        this.allGroups.set(groups);
        if (groups.length > 0) {
          this.selectGroup(groups[0]);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false), // ✅ hata durumunda da kapat
    });
  }

  loadCategoryItems(groupId: number) {
    const queryObject = {
      menuGroupId: groupId,
      page: 0,
      size: this.itemsPerPage + 50,
      sort: this.sortService.buildSortParam(this.sortState()),
    };

    this.menuItemService.query(queryObject).subscribe({
      next: (res: any) => {
        const data = res.body ?? [];
        this.selectedCategories.set(data);
        // ✅ selectedGroup'u immutable güncelle
        const current = this.selectedGroup();
        if (current) {
          this.selectedGroup.set({ ...current, itemCount: data.length });
        }
      },
    });
  }

  selectGroup(group: IMenuGroup) {
    this.selectedGroup.set(group);
    this.loadCategoryItems(group.id);
  }

  async openGroupModal(group?: IMenuGroup) {
    const modal = await this.modalCtrl.create({
      component: GroupFormComponent,
      componentProps: { group: group ?? null },
    });

    await modal.present();
    const { data } = await modal.onDidDismiss(); // ✅ async/await daha temiz

    if (!data) {
      return;
    }

    if (data.id != null) {
      const ent: IMenuGroup = {
        id: data.id,
        iconPath: data.iconPath,
        language: {
          id: data.languageId,
        },
        orderNo: data.orderNo,
        itemCount: 0,
        title: data.title,
      };

      this.menuGroupService.update(ent).subscribe(() => this.load());
    } else {
      const ent: NewMenuGroup = {
        id: null,
        iconPath: data.iconPath,
        language: {
          id: data.languageId,
        },
        orderNo: data.orderNo,
        itemCount: 0,
        title: data.title,
      };

      this.menuGroupService.create(ent).subscribe(() => this.load());
    }
  }

  async openItemModal(item?: IMenuGroupItem) {
    const group = this.selectedGroup();
    if (!group) return; // ✅ null guard

    const modal = await this.modalCtrl.create({
      component: ItemFormComponent,
      componentProps: { item: item ?? null, menuGroupId: group.id },
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data) {
      const payload = {
        ...data,
        language: { id: data.languageId },
        menuGroup: { ...group },
      };
      const action$ = data.id
        ? this.menuItemService.update(payload)
        : this.menuItemService.create(payload);

      action$.subscribe(() => this.loadCategoryItems(group.id));
    }
  }

  async confirmDelete(header: string, message: string, onConfirm: () => void) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        { text: this.ts.instant('CANCEL'), role: 'cancel' },
        {
          text: this.ts.instant('DELETE'),
          role: 'destructive',
          handler: onConfirm,
        },
      ],
    });
    await alert.present();
  }

  deleteItem(item: IMenuGroupItem) {
    this.confirmDelete(
      this.ts.instant('DELETE_ITEM'),
      this.ts.instant('CONFIRM_DELETE_ITEM'),
      () => {
        this.menuItemService.delete(item.id).subscribe({
          next: () => {
            this.showSuccess(this.ts.instant('ITEM_DELETED_SUCCESSFULLY'));
            this.loadCategoryItems(this.selectedGroup()!.id);
          },
          error: (err) =>
            this.showError(err?.error?.detail ?? 'Hata'),
        });
      },
    );
  }

  deleteGroup(group: IMenuGroup) {
    this.confirmDelete(
      this.ts.instant('DELETE_GROUP'),
      this.ts.instant('CONFIRM_DELETE_GROUP'),
      () => {
        this.menuGroupService.delete(group.id).subscribe({
          next: () => {
            this.showSuccess(
              this.ts.instant('GROUP_DELETED_SUCCESSFULLY')
            
            );
            this.selectedGroup.set(null);
            this.load();
          },
          error: (resp) =>
            this.showError(
              this.ts.instant('DELETE_OPERATION_FAILED') +
                (resp?.error?.detail ?? '') 
            ),
        });
      },
    );
  }

 

    async showError(msg: string) {
    const toast = await this.toastc.create({
      message: msg,
      duration: 3000,
      color: 'danger',
      position: 'bottom',
    });
    await toast.present();
  }

  async showSuccess(message: string) {
    const toast = await this.toastc.create({
      message: message,
      duration: 3000,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
  }
}
