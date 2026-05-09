import { IonApp } from '@ionic/angular/standalone';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
  Signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  NavController,
  ModalController,
  ToastController,
  MenuController,
  RefresherEventDetail,
} from '@ionic/angular';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IonRefresherCustomEvent, IonSegmentCustomEvent, SegmentChangeEventDetail } from '@ionic/core';
import { FooterService } from '../services/footer-service';
import { MenuService } from '../services/menu-service';
import { Langs } from '../pages/lang';
import * as iface from '../interfaces/interfaces';
import { TranslationService } from '../services/translation-service';
import { AccountService } from '../core/auth/account.service';
import { MenuGroupsPage } from '../pages/menu-groups/menu-groups.page';
import { ProductsPage } from '../pages/products/products.page';
import { PageHeaderPage } from '../pages/page-header/page-header.page';
import { AdresListPage } from '../pages/adres-list/adres-list.page';
import { OrderStateService } from '../services/order-state-service';
import { CommonModule } from '@angular/common';
import { IMenuGroupItem } from '../interfaces/interfaces';
import { body, menu } from 'ionicons/icons';
import { ProductService } from '../pages/products/product-service';
import { MenuGroupService } from '../pages/menu-groups/menu-group-service';
import { MenuGroupItemService } from '../pages/menu-group-item/menu-group-item-service';
import { CartUtils } from '../shared/utils/CartUtils';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    MenuGroupsPage,
    ProductsPage,
    PageHeaderPage,
    CommonModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Hata mesajını bastırır
  providers: [
    FooterService,
    MenuService,
    // Diğer servisler...
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
  activeCategory=signal<iface.IMenuGroupItem>({} as iface.IMenuGroupItem);
  categoryId: number = 0;

  //claude dizayn için
  products = signal<iface.IProduct[]>([]); 
  selectedSubCategoryId = signal<number | null>(null);

  totalCount = computed(() => CartUtils.totalCount());

  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private account = inject(AccountService);
  private translate = inject(TranslationService);
  public orderService = inject(OrderStateService); // HTML'den erişmek için public
  productService=inject(ProductService);
  menuGroupService = inject(MenuGroupService);
  menuGroupItemService = inject(MenuGroupItemService);
  protected ngZone = inject(NgZone);  
  private menuCtrl = inject(MenuController);

  constructor() {}

 ngOnInit() {
  if (this.account.isAuthenticated()) {
    this.account.getAuthenticationState().subscribe(account => {
      if (account) {
        this.orderService.setCurrentUser(account);

        forkJoin({
          groups: this.menuGroupService.query(),
          items: this.menuGroupItemService.query()
        }).subscribe(({ groups, items }) => {

          this.menuGroups.set(groups.body ?? []);
          this.categories.set(items.body ?? []);

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

  const items = categories.filter(t => t.menuGroup?.id === this.selectedGroup?.id);
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



  async presentOrderTypeModal() {
    this.openAddressList();
    /*const currentUser = this.account.trackCurrentAccount()();
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
    }*/
  }

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


  //yeni menu grup methodlari
  loadMenuGroups() {
    this.menuGroupService.query().subscribe(res => {
      this.menuGroups.set(res.body ?? []);
      if(body.length > 0) {
        this.selectedGroup = res.body ? res.body[0] : null;
        this.selectedGroupId.set(this.selectedGroup?.id ?? null );
        if (this.selectedGroup) {
            /* Gruba bağlı alt kategorileri filtrele*/
          const items = this.categories().filter(t => t.menuGroup?.id === this.selectedGroup?.id) ?? [];
          this.selectedCategories.set(items);
          /* Eğer alt kategori varsa, ilkinin ürünlerini otomatik yükle*/
          if (items.length > 0) {
            this.setCategory(items[0].id);
          } else {
            this.products.set([]);
          }
  }

      }
    });
  }

   loadMenuGroupItems() {
    this.menuGroupItemService.query().subscribe(res => {
      this.categories.set(res.body ?? []);
      this.setCategory(this.categories()[0]?.id ?? 0); // İlk kategoriyi seçili yap
    });
  }

    // 1. Ana Gruba Tıklayınca (Yiyecekler)
selectGroup(event: any) {
  const selectedId = event.detail.value;
  this.selectedGroupId.set(event.detail.value);
  const selectedGroup = this.menuGroups().find(group => group.id === selectedId);
  if (selectedGroup) {
    this.selectedGroup = selectedGroup;
    // Gruba bağlı alt kategorileri filtrele
    const items = this.categories().filter(t => t.menuGroup?.id === selectedGroup.id) ?? [];
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
    this.activeCategory.set(this.categories().find(cat => cat.id === id) || {} as iface.IMenuGroupItem);

      this.productService.query({ 'categoryId':id }).subscribe({
      next: (res) => {
        this.products.set(res.body ?? []);
      },
      error: () => console.error('Ürünler yüklenirken hata oluştu kanki!')
    });
  }

 

// 2. Alt Kategoriye Tıklayınca (KEBAB)
onSubCategoryChange(event: any) {
  const targetCategoryId = event.detail.value;
  this.loadProducts(targetCategoryId);
}

// 3. Ürünleri Getiren Metot
loadProducts(categoryId: number) {
  // Senin SQL sorgunun ProductService karşılığı
  this.productService.query({ 'categoryId.equals': categoryId }).subscribe(res => {
    let products = res.body ?? [];
    this.products.set(products);
  });

  }


 addToCart(product: iface.IProduct) {
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
      sandwich: '🥪'   
  };

getEmoji(name?: string): string {
  if (!name) return '🍽️';
  return this.EMOJI_MAP[name.toLowerCase()] ?? '🍽️';
}

quickAdd($event: PointerEvent,arg1: iface.IProduct) {
    throw new Error('Method not implemented.');
}

  toggleMenu() {
    this.menuCtrl.toggle();    
  }
}

