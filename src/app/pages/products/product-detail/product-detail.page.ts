import { Component, ElementRef, inject, OnInit, Signal, signal, ViewChild } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  CartItem,
  IOptionGroupWithItems,
  IOptionItem,
  IProduct,
  IProductVariation,
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
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
import { ProductVariationService } from '../../variation/variation-service';
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
  product = signal<IProduct | null>(null);
  selectedVariation=signal<IProductVariation | null>(null);
  variations = signal<IProductVariation[]>([]);
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
  apiUrl: string = inject(ApplicationConfigService).getEndpointFor('');
  public appUtil = inject(AppUtil);
  private variationService=inject(ProductVariationService);
 
  trackId = (item: IProduct): number =>
    this.productService.getProductIdentifier(item);


  @ViewChild(IonContent) ionContent!: IonContent;
  @ViewChild('cartSuccessAnchor') cartSuccessAnchor!: ElementRef;

  constructor(private route: ActivatedRoute) {}

 ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');
  this.loadProduct(+id!);
}

private loadProduct(id: any): void {
  this.isLoading = true;
  const pageToLoad = {
    id: id,
    lang: this.storeageService.getLocale() || 'en',
  };

  this.productService.getRecordsById(pageToLoad).subscribe({
    next: (res) => {
      this.product.set(res.body);
      this.isLoading = false;

      // ✅ Variation varsa ilkini default seç
      this.variations.set(res.body?.variations ?? []);
      if (this.variations().length > 0) {
        this.selectedVariation.set(this.variations()[0]);
      }

      const excludedCategoryIds = [12, 13, 14];
      const currentCategoryId = this.product()?.category?.id;
      if (currentCategoryId && !excludedCategoryIds.includes(currentCategoryId)) {
        this.loadOptionGroups();
      } else {
        this.optionGroups.set([]);
      }

      this.calculateTotal();

      this.orderDraft = {
        id: 0,
        quantity: 1,
        basePrice: res.body?.price ?? 0,
        optionPrice: 0,
        totalPrice: res.body?.price ?? 0,
        productName: res.body?.name ?? '',
        createdAt: dayjs(),
        productId: res.body?.id ?? 0,
        options: [],
      };
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
  const base = (this.product()?.price ?? 0) 
             + (this.selectedVariation()?.additionalPrice ?? 0); // ✅ variation ekle

  let optionTotal = 0;
  for (const group of this.optionGroups()) {
    const selectedItems = group.items?.filter(i => i.selected) || [];
    for (const item of selectedItems) {
      optionTotal += Number(item.additionalPrice || 0);
    }
  }

  this.orderDraft.basePrice = base;
  this.orderDraft.optionPrice = optionTotal;
  this.orderDraft.totalPrice = (base + optionTotal) * this.orderDraft.quantity;
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
    if (!this.product()) return;

    const selectedAddress = this.orderService.selectedAddress(); 
    const deliveryType = this.orderService.deliveryType();

    if (deliveryType === 'delivery' && !selectedAddress) {
      const result = await this.openAddressList();
      if (result !== 1) {
        return; 
      }
    }

    this.orderDraft.options = [];

    const basePrice = Number(Bosp.getValue(this.product(), 'price'));
    const variant =  Number(this.selectedVariation()?.additionalPrice ?? 0);
    
    // 2. Seçili opsiyonları (ekstraları) topla
    for (const group of this.optionGroups()) {
      const selectedItems = group.items?.filter((i) => i.selected) || [];
      for (const item of selectedItems) {
        this.orderDraft.options.push({
          id: item.id,
          name: item.name,
          additionalPrice: item.additionalPrice,
          quantity: 1, 
          type: item.type,
        });
      }
    }

    // ─── YENİ EKLEMELERİMİZ (DEĞİŞİKLİK BURADA) ───
    // Tipi STANDARD ve Zorunlu olan gruptan seçilen varyasyon adını bulalım (Örn: Seul, Menu)
    const selectedStandardOption = this.optionGroups()
      .find(g => g.requiredGroup === true && g.type === 'STANDARD')
      ?.items?.find(i => i.selected);

    // Eğer bir varyasyon (Menu/Seul vb.) seçildiyse, ismini parantez içinde ekle
    const variationSuffix = this.selectedVariation()
  ? ` (${this.selectedVariation()!.name})`
  : selectedStandardOption
    ? ` (${selectedStandardOption.name})`
    : '';
    // ───────────────────────────────────────────────

    // 3. Fiyat Hesaplamaları
    let optionTotal = 0;
    for (const item of this.orderDraft.options) {
      optionTotal += Number(item.additionalPrice || 0);
    }
    const singleItemTotal = basePrice + optionTotal + variant;
    const totalPrice = singleItemTotal * this.orderDraft.quantity;

    // 4. CartItem Nesnesini Oluştur
    const cartItem: CartItem = {
      uuid: AppUtil.generateUUID(), 
      product: {
        ...this.product(),       
        // YENİ: Sepette "Steak Haché (Menu)" veya "Steak Haché (Seul)" yazması için:
        name: Bosp.valueFrom(this.product(), 'name') + variationSuffix 
      } as any,
      productVariation:this.selectedVariation() as any,
      quantity: this.orderDraft.quantity,
      children: [...this.orderDraft.options], 
      totalPrice: totalPrice,
      createdAt: new Date().toISOString(),
      address: selectedAddress,
    };

    // 5. Sepete Ekle ve Yönlendir
    this.cartService.add(cartItem);
    this.addedToCart.set(true);

      // ✅ Butona scroll et
  setTimeout(() => {
    this.cartSuccessAnchor?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }, 100); // animate__fadeIn için kısa bekleme
  }
  
  go(path: string) {
    this.router.navigateByUrl(path);
  }

  // product-detail.page.ts
  getProductPrice(): number {
     if(this.selectedVariation()?.id??0>0){
       return Bosp.getValue(this.product(), 'price')+ Bosp.getValue(this.selectedVariation(),"additionalPrice");
     }
    return Bosp.getValue(this.product(), 'price');
  }

    getProductPriceExtra(e:IOptionItem): number {
    return Number(e.additionalPrice??0);
  }


  getVariationPrice(v: IProductVariation): number {
  return Number(this.product()?.price ?? 0)
       + Number(v.additionalPrice ?? 0);
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
      productId: this.product()?.id??0,
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

 selectVariation(v: IProductVariation) {
  this.selectedVariation.set(v);
  this.calculateTotal();
}
}
