import { Component, inject, NgZone, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { NavController,ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { combineLatest, Observable, Subscription, tap } from 'rxjs';
import {
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
import { CartItem, OrderItemDraft, SelectedOption } from 'src/app/interfaces/ui-model';
import { CartUtils } from 'src/app/shared/utils/CartUtils';
import { OrderStateService } from 'src/app/services/order-state-service';
import { AdresListPage } from '../../adres-list/adres-list.page';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    CommonModule,
    PageHeaderPage,
    OptionGroupPage,
  ],
})
export class ProductDetailPage implements OnInit {
  totalPrice = 0;
  selectedOptions: SelectedOption[] = [];

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
 
  product: IProduct | null = null;
  isLoading = false; 
  public readonly router = inject(Router);
 
  
  private navCtrl = inject(NavController);
  protected modalService = inject(NavController);
  // 1. Servisi public olarak inject et (HTML'den erişebilmek için)
  public orderService = inject(OrderStateService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly productService = inject(ProductService);
  protected modalCtrl = inject(ModalController);
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

    this.productService.find(id).subscribe({
      next: (res) => {
        this.product = res.body;
        this.isLoading = false;
        if (this.product) {
          this.orderDraft = {
            id: 0, // yeni kayıt
            quantity: 1,
            basePrice: 0, // string
            optionPrice: 0,
            totalPrice: Bosp.getValue(this.product, 'price'),
            productName: Bosp.valueFrom(this.product, 'name'),
            createdAt: dayjs(),
            productId: this.product.id,
            options: [],
          };
        }
      },
      error: () => {
        this.isLoading = false;
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

  calculateTotal() {
    const base =Bosp.getValue(this.product,"price");

    const optionTotal = this.selectedOptions.reduce(
      (sum, opt) => sum + Number(opt.price || 0),
      0
    );

    this.orderDraft.basePrice = base;
    this.orderDraft.optionPrice = optionTotal;

    const singleItemTotal = base + optionTotal;

    this.totalPrice = singleItemTotal * this.orderDraft.quantity;
    this.orderDraft.totalPrice = this.totalPrice;
  }

 sepeteEkle() {
  if (!this.product) return;
// 2. Cephelerden gelen bilgileri topla
    const selectedAddress = this.orderService.selectedAddress(); // Signal'den oku
    const deliveryType = this.orderService.deliveryType();

  if (deliveryType === 'delivery' && !selectedAddress) {
    this.openAddressList();
   return;
  }


  const basePrice = Number(Bosp.getValue(this.product, 'price'));

  const optionTotal = this.selectedOptions.reduce(
    (sum, opt) => sum + Number(opt.price || 0),
    0
  );

  const singleItemTotal = basePrice + optionTotal;
  const totalPrice = singleItemTotal * this.orderDraft.quantity;

  const cartItem: CartItem = {
    uuid: crypto.randomUUID(),

    product: {
      productId: this.product.id,
      name: Bosp.valueFrom(this.product, 'name'),
      basePrice: basePrice,
      options: this.selectedOptions
    },

    quantity: this.orderDraft.quantity,

    // şimdilik child yok (extra sonradan cart’ta eklenecek)
    children: [],

    totalPrice: totalPrice,

    createdAt: new Date().toISOString(),
    // Savaşın sonucu: Bu sipariş nereye ve nasıl gidecek?
      address: selectedAddress
      
  };

  const cart = CartUtils.getSafeCart();
  cart.push(cartItem);
  CartUtils.saveCart(cart);

  this.navCtrl.navigateForward('/payments/cart');
}

  go(path: string) {
    this.router.navigateByUrl(path);
  }

  onOptionsChange(options: SelectedOption[]) {
    this.selectedOptions = options;
    this.calculateTotal();
  }
  
    async openAddressList() {
      const addressModal = await this.modalCtrl.create({
        component: AdresListPage,
        cssClass: 'address-list-modal' // Görseldeki gibi tam ekran veya geniş modal
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
  
}
