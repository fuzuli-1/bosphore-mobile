import {
  Component,
  computed,
  inject,
  NgZone,
  OnInit,
  signal,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { FormsModule } from '@angular/forms';

import * as iface from 'src/app/interfaces/interfaces';
import { TranslationService } from '../services/translation-service';
import { AccountService } from '../core/auth/account.service';

import { AdresListPage } from '../pages/adres/adres-list/adres-list.page';
import { OrderStateService } from '../services/order-state-service';
import { CommonModule } from '@angular/common';

import { body } from 'ionicons/icons';
import { ProductService } from '../pages/products/product-service';
import { MenuGroupService } from '../pages/menu-grup/menu-groups/menu-group-service';
import { MenuGroupItemService } from '../pages/menu-grup/menu-group-item/menu-group-item-service';
import { CartUtils } from '../shared/utils/CartUtils';
import { forkJoin } from 'rxjs';
import { TranslatePipe } from '../services/TranslatePipe';
import { SortService } from '../shared/sort/sort.service';

import { StateStorageService } from '../core/auth/state-storage.service';
import {
 
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
  ModalController,MenuController,ToastController, IonHeader, IonButtons, IonButton } from '@ionic/angular/standalone';
import { CartService } from '../pages/cart/cart.service';
import { CategoryService } from '../pages/definitions/category/category-service';
 

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonButton, IonButtons, IonHeader, 
    CommonModule,
    FormsModule,
    TranslatePipe,
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
    IonHeader, IonButtons,
    IonMenuButton,
     IonTitle,
  ],
})
export class HomePage implements OnInit {
  //seçilen adres
  selectedAddress: iface.IAddress | null = null;
  //menu groups
  menuGroups = signal<iface.IMenuGroup[]>([]);
  selectedGroup: iface.IMenuGroup | null = null;
  selectedGroupId = signal<number | null>(null);
  //menu group items
  categories = signal<iface.IMenuGroupItem[]>([]);
  selectedCategories = signal<iface.IMenuGroupItem[]>([]);
  activeCategory = signal<iface.IMenuGroupItem>({} as iface.IMenuGroupItem);
  categoryId: number = 0;

  //gercek productlara bagli olanlar.
  realCategories = signal<iface.ICategory[]>([]);
   excludedCategoryIds = [12, 13,14]; 
  //claude dizayn için
  products = signal<iface.IProduct[]>([]);
  selectedSubCategoryId = signal<number | null>(null);

  totalCount = computed(() => CartUtils.totalCount());

  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private account = inject(AccountService);
  private storeageService = inject(StateStorageService);
  public orderService = inject(OrderStateService); // HTML'den erişmek için public
  private productService = inject(ProductService);
  private menuGroupService = inject(MenuGroupService);
  private menuGroupItemService = inject(MenuGroupItemService);
   private categoryService = inject(CategoryService);
  private ngZone = inject(NgZone);
  private menuCtrl = inject(MenuController);
  private sortService = inject(SortService);
  private toast = inject(ToastController);
  private ts = inject(TranslationService);
  public cartService = inject(CartService);

constructor( ) {
   

  console.log(JSON.stringify(this.router.config, null, 2));
}
  ngOnInit() {
    if (this.account.isAuthenticated()) {
      this.account.getAuthenticationState().subscribe((account) => {
        if (account) {
          this.orderService.setCurrentUser(account);
          const pageToLoad = {
            lang: this.storeageService.getLocale() || 'en',
            page: 0,
            size: 2000,
          };
          forkJoin({
            groups: this.menuGroupService.getRecords(pageToLoad),
            items: this.menuGroupItemService.getRecords(),
            subCategories: this.categoryService.query(),
          }).subscribe(({ groups, items, subCategories }) => {
            this.menuGroups.set(groups.body ?? []);
            this.categories.set(items.body ?? []);
            this.realCategories.set(subCategories.body ?? []);

            // 👇 artık ikisi de hazır
            this.initSelection();
          });
        }
      });
    }
  }

  private initSelection() {
    const groups = this.menuGroups();
    const categories = this.categories();

    if (groups.length === 0) return;

    this.selectedGroup = groups[0];
    this.selectedGroupId.set(this.selectedGroup.id);

    const items = categories.filter(
      (t) => t.menuGroup?.id === this.selectedGroup?.id,
    );
    this.selectedCategories.set(items);

    if (items.length > 0) {
      this.setCategory(items[0].id);
    } else {
      this.products.set([]);
    }
  }

  initAfterLogin() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
      }
    });
  }

 /* async presentOrderTypeModal() {
   
 const currentUser = this.account.trackCurrentAccount()();
    const modal = await this.modalCtrl.create({
      component: AdreseTeslimPage,
      cssClass: 'delivery-selection-modal', // CSS ile resimdeki gibi yuvarlatılmış köşeler yapabiliriz
      breakpoints: [0, 0.5, 0.8], // Mobil için sürükleyerek kapatma özelliği
      backdropDismiss: true, // Dışarı tıklayınca kapanması için
      initialBreakpoint: 0.5,
      componentProps: {
        // Modal içine veri göndermek isterseniz burayı kullanabilirsiniz
        userName: currentUser?.firstName || 'Misafir',
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      // 3. Eğer Adrese Teslim seçildiyse, Adres Listesi Modalını aç
      if (data && data.type === 'delivery') {
        this.openAddressListModal();
      }
    } 
  }/** */

  // Adres Listesi Modalını açan ayrı metod
  // 2. CEPHE: Adres Listesi ve Seçimi
  async openAddressList() {
    const addressModal = await this.modalCtrl.create({
      component: AdresListPage,
      cssClass: 'address-list-modal', // Görseldeki gibi tam ekran veya geniş modal
    });
    await addressModal.present();

    const { data } = await addressModal.onWillDismiss();
    if (data) {
      // Seçilen adresi merkezi servise (Savaş Merkezi) gönderiyoruz
      this.orderService.setAddress(data);
      console.log('Seçilen adres:', data);
      // Burada seçilen adresle ne yapmak istediğinize karar verebilirsiniz
    }
  } 

  // 1. Ana Gruba Tıklayınca (Yiyecekler)
  selectGroup(event: any) {
    const selectedId = event.detail.value;
    this.selectedGroupId.set(event.detail.value);
    const selectedGroup = this.menuGroups().find(
      (group) => group.id === selectedId,
    );
    if (selectedGroup) {
      this.selectedGroup = selectedGroup;
      // Gruba bağlı alt kategorileri filtrele
      const items =
        this.categories().filter((t) => t.menuGroup?.id === selectedGroup.id) ??
        [];
      this.selectedCategories.set(items);
      // Eğer alt kategori varsa, ilkinin ürünlerini otomatik yükle
      if (items.length > 0) {
        this.setCategory(items[0].id);
      } else {
        this.products.set([]);
      }
    }
  }

  setCategory(id: number): void {
    this.activeCategory.set(
      this.categories().find((cat) => cat.id === id) ||
        ({} as iface.IMenuGroupItem),
    );

    this.productService.query({ categoryId: id }).subscribe({
      next: (res) => {
        this.products.set(res.body ?? []);
      },
      error: () => {
        this.showToast(
          'danger',
          'top',
          this.ts.instant('ERROR_OCCURRED_WHILE_LOAD'),
        );
      },
    });
  }

  async showToast(
    color: any,
    position: 'top' | 'middle' | 'bottom',
    mesaj: string,
  ) {
    const toast = await this.toast.create({
      message: mesaj,
      duration: 2500,
      cssClass: 'custom-toast-success',
      icon: 'checkmark-done-outline',
      position: position,
      color: color,
    });
    await toast.present();
  }

  // 2. Alt Kategoriye Tıklayınca (KEBAB)
  onSubCategoryChange(event: any) {
    const targetCategoryId = event.detail.value;
    this.loadProducts(targetCategoryId);
  }

  // 3. Ürünleri Getiren Metot
  loadProducts(categoryId: number) {
    // Senin SQL sorgunun ProductService karşılığı
    this.productService
      .query({ 'categoryId.equals': categoryId })
      .subscribe((res) => {
        let products = res.body ?? [];
        this.products.set(products);
      });
  }

  addToCart(product: iface.IProduct) {
    /*this.realCategories().forEach((cat) => {
       if (cat.categoryId && !this.excludedCategoryIds.includes(cat.categoryId)) {
        return;
      }
    });/* */

    this.ngZone.run(() => {
      this.router.navigate(['/products', product.id]);
    });
  }

  EMOJI_MAP: Record<string, string> = {
    elma: '🍎',
    armut: '🍐',
    muz: '🍌',
    hamburger: '🍔',
    pizza: '🍕',
    sandwich: '🥪',
  };

  getEmoji(name?: string): string {
    if (!name) return '🍽️';
    return this.EMOJI_MAP[name.toLowerCase()] ?? '🍽️';
  }

  quickAdd($event: PointerEvent, arg1: iface.IProduct) {
    throw new Error('Method not implemented.');
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

    go(path: string) {
    this.router.navigateByUrl(path);
  }

}
