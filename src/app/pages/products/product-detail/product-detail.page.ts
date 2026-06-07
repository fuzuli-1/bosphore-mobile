import { Component, inject, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CartItem,
  IOptionGroupWithItems,
  IProduct,
} from 'src/app/interfaces/interfaces';
import { ProductService } from '../../products/product-service';

import dayjs from 'dayjs/esm';
import { CommonModule } from '@angular/common';
 
import { Bosp } from 'src/app/shared/utils/Bosp';
import { OrderItemDraft } from 'src/app/interfaces/ui-model';

import { OrderStateService } from 'src/app/services/order-state-service';
 
import { TranslatePipe } from '../../../services/TranslatePipe';
import { OptionGroupService } from '../../menu-extra/option-group/option-group-service';
import { CartService } from '../../cart/cart.service';

import { StateStorageService } from 'src/app/core/auth/state-storage.service';

import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonTitle,
  IonBadge,
  IonList,
  IonItem,
  IonLabel,
  IonTextarea,
  IonFooter,
  IonButton,
  IonIcon,
  ModalController,
  NavController, IonRow,IonCol } from '@ionic/angular/standalone';
import { AppUtil } from 'src/app/shared/utils/app-util';
import { AdresListPage } from '../../adres/adres-list/adres-list.page';
@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [IonRow, 
    IonHeader,

    FormsModule,
    CommonModule,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonTitle,
    IonBadge,
    IonList,
    IonItem,
    IonLabel,
    IonFooter,
    IonTextarea,
    IonButton,
    IonIcon,
    IonRow,
    IonCol,
    TranslatePipe,
  ],
})
export class ProductDetailPage implements OnInit {
  addedToCart = signal(false);
  optionGroups = signal<IOptionGroupWithItems[]>([]);
  note = signal('');
  favorite = false;
  orderDraft: OrderItemDraft = {
    id: 0,
    quantity: 1,
    basePrice: 0,
    optionPrice: 0,
    totalPrice: 0,
    productId: 0,
    productName: '',
    options: [],
  };

  isLoading = true;
  product: IProduct | null = null;
  product1: IProduct | null = null;

  // 1. Servisi public olarak inject et (HTML'den erişebilmek için)
  public readonly router = inject(Router);
  private navCtrl = inject(NavController);
  protected modalService = inject(NavController);
  public orderService = inject(OrderStateService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly productService = inject(ProductService);
  protected modalCtrl = inject(ModalController);
  protected optionGroupService = inject(OptionGroupService);
  protected readonly cartService = inject(CartService);
  private storeageService = inject(StateStorageService);
  //private translate = inject(TranslationService);
  trackId = (item: IProduct): number =>
    this.productService.getProductIdentifier(item);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  }

 private loadProduct(id: any): void {
  this.isLoading = true;
  const pageToLoad = {
    id: id,
    lang: this.storeageService.getLocale() || 'en',
  };

  this.productService.getRecordsById(pageToLoad).subscribe({
    next: (res) => {
      this.product = res.body;
      this.isLoading = false;

      if (this.product) {
        // Kategori kontrolü: 
        // 12 -> İçecekler, 13 -> Şişeler vb. gibi sabit kategori ID'lerini 
        // bir "excludeList" içinde tutmak yönetimi kolaylaştırır.
        const excludedCategoryIds = [12, 13,14]; // Seçenek grubu olmayan kategoriler

        const currentCategoryId = this.product.category?.id; // Veya product.category.categoryId

        // Sadece seçenek grubu olan kategoriler için yükle
        if (currentCategoryId && !excludedCategoryIds.includes(currentCategoryId)) {
            this.loadOptionGroups();
        } else {
            console.log("Bu kategori için seçenek grubu tanımlı değil.");
            // İsterseniz burada optionGroups listesini temizleyin
            this.optionGroups.set([]); 
        }

          this.orderDraft = {
            id: 0,
            quantity: 1,
            basePrice: 0,
            optionPrice: 0,
            totalPrice: Bosp.getValue(this.product, 'price'),
            productName: Bosp.valueFrom(this.product, 'name'),
            createdAt: dayjs(),
            productId: this.product.id,
            options: [],
          };
        }
      },
    });
  }

  increase() {
    if (!this.orderDraft.quantity) {
      this.orderDraft.quantity = 0;
    }
    this.orderDraft.quantity++;
    this.calculateTotal();
  }

  decrease() {
    if (!this.orderDraft.quantity) {
      this.orderDraft.quantity = 0;
    }

    if (this.orderDraft.quantity > 1) {
      this.orderDraft.quantity--;
      this.calculateTotal();
    }
  }

  toggleExtra(groupId: number, itemId: number) {
    const group = this.optionGroups().find((g) => g.id === groupId);

    if (!group) return;

    const item = group.items.find((i) => i.id === itemId);

    if (!item) return;

    // TEK SEÇİM
    if (group.maxSelect === 1) {
      group.items.forEach((i) => {
        i.selected = false;
      });

      item.selected = true;
      this.calculateTotal();
      return;
    }

    // ÇOKLU SEÇİM
    item.selected = !item.selected;

    const selectedCount = group.items.filter((i) => i.selected).length;

    if (selectedCount > group.maxSelect) {
      item.selected = false;
    }

    this.calculateTotal();
  }

  calculateTotal() {
    const base = Bosp.getValue(this.product, 'price');
    let optionTotal = 0;
    for (const group of this.optionGroups()) {
      const selectedItems = group.items?.filter((i) => i.selected) || [];
      for (const item of selectedItems) {
        optionTotal += Number(item.additionalPrice || 0);
      }
    }

    this.orderDraft.basePrice = base;
    this.orderDraft.optionPrice = optionTotal;

    const singleItemTotal = base + optionTotal;

    this.orderDraft.totalPrice = singleItemTotal * this.orderDraft.quantity;
  }

  async openAddressList(): Promise<number> {
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
      return 1;
    }

    return 0;
  }
 async sepeteEkle() {
    if (!this.product) return;

    // CRITICAL FIX: Bu komut kaldırıldı, böylece eski sepet korunuyor.
    // this.cartService.clear(); 

    // 1. Teslimat ve Adres Kontrolleri (Mevcut mantığın, harika çalışıyor)
    const selectedAddress = this.orderService.selectedAddress(); 
    const deliveryType = this.orderService.deliveryType();

    if (deliveryType === 'delivery' && !selectedAddress) {
      const result = await this.openAddressList();
      if (result !== 1) {
        return; // Adres seçilmediyse işlemi durdur
      }
    }

    // CRITICAL FIX: Her fonksiyon çalıştığında orderDraft.options dizisini sıfırlamalıyız.
    // Aksi takdirde, kullanıcı butona üst üste basarsa veya hata alıp tekrar denerse 
    // opsiyonlar dizide mükerrer (double) birikir.
    this.orderDraft.options = [];

    const basePrice = Number(Bosp.getValue(this.product, 'price'));
    
    // 2. Seçili opsiyonları (ekstraları) topla
    for (const group of this.optionGroups()) {
      const selectedItems = group.items?.filter((i) => i.selected) || [];
      for (const item of selectedItems) {
        this.orderDraft.options.push({
          id: item.id,
          name: item.name,
          additionalPrice: item.additionalPrice,
          quantity: 1, // Opsiyonun kendi adedi (örn: ekstra 1 adet et)
          type: item.type,
        });
      }
    }

    // 3. Fiyat Hesaplamaları
    let optionTotal = 0;
    for (const item of this.orderDraft.options) {
      optionTotal += Number(item.additionalPrice || 0);
    }
    const singleItemTotal = basePrice + optionTotal;
    const totalPrice = singleItemTotal * this.orderDraft.quantity;

    // 4. CartItem Nesnesini Oluştur
    const cartItem: CartItem = {
      uuid: AppUtil.generateUUID(), // Zaten benzersiz UUID üretiyorsun, harika!
      product: this.product,
      quantity: this.orderDraft.quantity,
      children: [...this.orderDraft.options], // Opsiyonları doğrudan referans kopararak ata
      totalPrice: totalPrice,
      createdAt: new Date().toISOString(),
      address: selectedAddress,
    };

    // 5. Sepete Ekle ve Yönlendir
    this.cartService.add(cartItem);
    this.addedToCart.set(true);

    // Eğer kullanıcının içecek/tatlı seçmeye devam etmesini istiyorsan bu yönlendirmeyi
    // opsiyonel yapabilir veya kullanıcıya bir toast gösterip ana sayfaya atabilirsin.
  //  this.navCtrl.navigateForward('/payments/cart');
  }
  
  go(path: string) {
    this.router.navigateByUrl(path);
  }

  // product-detail.page.ts
  getProductPrice(): number {
    return Bosp.getValue(this.product, 'price');
  }

  toggleFavorite() {
    this.favorite = !this.favorite;
    // İsterseniz favorileri localStorage veya servise kaydedebilirsiniz
  }

  isFavorite() {
    return this.favorite;
  }

  loadOptionGroups() {
    const pageToLoad = {
      productId: this.product?.id,
      optionType: 1,
    };
    this.isLoading = true;
    this.optionGroupService.queryWithItems(pageToLoad).subscribe({
      next: (res) => {
        this.isLoading = false;
        let data: IOptionGroupWithItems[] = res.body ?? [];

        // STANDARD gruplarda ilk item'ı default seçili yap
        data = data.map((group) => {
          if (
            group.requiredGroup == true &&
            group.type === 'STANDARD' &&
            group.items?.length > 0
          ) {
            group.items = group.items.map((item, index) => ({
              ...item,
              selected: index === 0,
            }));
          }
          return group;
        });

        this.optionGroups.set(data);
        this.calculateTotal(); // Fiyat da güncellensin
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  /*toggleExtra(id: number): void {
    
    this.extras.update(list =>
      list.map(e => e.id === id ? { ...e, selected: !e.selected } : e)
    );
  }*/
}
