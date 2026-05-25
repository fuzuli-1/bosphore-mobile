import {
  Component,
  computed,
  inject,
  NgZone,
  OnInit,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { combineLatest, Observable, Subscription, tap } from 'rxjs';
import {
  CartItem,
  IOptionGroupWithItems,
  IOptionItem,
  IOrderItem,
  IProduct,
 
} from 'src/app/interfaces/interfaces';
import {
  EntityArrayResponseType,
  ProductService,
} from '../../products/product-service';
import { SortService, sortStateSignal } from 'src/app/shared/sort';
import {
  ITEMS_PER_PAGE,
  PAGE_HEADER,
  TOTAL_COUNT_RESPONSE_HEADER,
} from 'src/app/config/pagination.constants';
import { DEFAULT_SORT_DATA, SORT } from 'src/app/config/navigation.constants';
import { HttpHeaders } from '@angular/common/http';
import dayjs from 'dayjs/esm';
import { CommonModule } from '@angular/common';
import { PageHeaderPage } from '../../page-header/page-header.page';
import { OptionGroupPage } from '../../option-group/option-group.page';
import { Bosp } from 'src/app/shared/utils/Bosp';
import {  OrderItemDraft } from 'src/app/interfaces/ui-model';

import { OrderStateService } from 'src/app/services/order-state-service';
import { AdresListPage } from '../../adres-list/adres-list.page';
import { TranslatePipe } from '../../../services/TranslatePipe';
import { OptionGroupService } from '../../option-group/option-group-service';
import { CartService } from '../../cart/cart.service';
import { TranslationService } from 'src/app/services/translation-service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    CommonModule,
    OptionGroupPage,
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
    private translate = inject(TranslationService);
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
    lang: this.translate.getActiveLang(),
  };
  this.productService.getRecordsById(pageToLoad).subscribe({
    next: (res) => {
      this.product = res.body;
      this.isLoading = false;

      if (this.product) {

        this.loadOptionGroups();  

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

  const group = this.optionGroups()
    .find(g => g.id === groupId);

  if (!group) return;

  const item = group.items.find(i => i.id === itemId);

  if (!item) return;

  // TEK SEÇİM
  if (group.maxSelect === 1) {

    group.items.forEach(i => {
      i.selected = false;
    });

    item.selected = true;
this.calculateTotal();
    return;
  }

  // ÇOKLU SEÇİM
  item.selected = !item.selected;

  const selectedCount =
    group.items.filter(i => i.selected).length;

  if (selectedCount > group.maxSelect) {
    item.selected = false;
  }

  this.calculateTotal();
 }

 

  calculateTotal() {

    const base = Bosp.getValue(this.product, 'price');
    let optionTotal = 0;
    for (const group of this.optionGroups()) {
      const selectedItems = group.items?.filter(i => i.selected) || [];
      for (const item of selectedItems) {
        optionTotal += Number(item.additionalPrice || 0);
      }
    }

    this.orderDraft.basePrice = base;
    this.orderDraft.optionPrice = optionTotal;

    const singleItemTotal = base  + optionTotal;

    this.orderDraft.totalPrice = singleItemTotal* this.orderDraft.quantity;
  }

  async openAddressList() :Promise<number> {
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

  async  sepeteEkle() {
    if (!this.product) return;

     this.cartService.clear(); 
    // 2. Cephelerden gelen bilgileri topla
    const selectedAddress = this.orderService.selectedAddress(); // Signal'den oku
    const deliveryType = this.orderService.deliveryType();

    if (deliveryType === 'delivery' && !selectedAddress) {
 
        const result = await this.openAddressList();
        
        if (result === 1) {
          // Adres başarıyla seçildi
          console.log('Adres seçimi tamamlandı'); 
        } else {
          // Adres seçilmedi veya iptal edildi
          return;
        }    
    }    
    const basePrice = Number(Bosp.getValue(this.product, 'price'));
    for (const group of this.optionGroups()) {
      const selectedItems = group.items?.filter(i => i.selected) || [];
      for (const item of selectedItems) {
        this.orderDraft.options.push({
          id: item.id,
          name: item.name,
          additionalPrice: item.additionalPrice,
          quantity: 1,
          type: item.type,
        });
      }   
        };
      
    
    let optionTotal = 0;
      for (const item of this.orderDraft.options) {
        optionTotal += Number(item.additionalPrice || 0);
    }
    const singleItemTotal = basePrice + optionTotal;
    const totalPrice = singleItemTotal* this.orderDraft.quantity;
    const cartItem: CartItem = {
      uuid: crypto.randomUUID(),
      product: this.product,
      quantity: this.orderDraft.quantity,
      // şimdilik child yok (extra sonradan cart’ta eklenecek)
      children: [],

      totalPrice: totalPrice,

      createdAt: new Date().toISOString(),
      // Savaşın sonucu: Bu sipariş nereye ve nasıl gidecek?
      address: selectedAddress,
    };
    
    cartItem.children?.push(...this.orderDraft.options);
    this.cartService.add(cartItem);

    this.navCtrl.navigateForward('/payments/cart');
    this.addedToCart.set(true);
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
      data = data.map(group => {
        if (group.requiredGroup==true && group.type === 'STANDARD' && group.items?.length > 0) {
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
