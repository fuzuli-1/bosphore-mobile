import { Component, inject, NgZone, OnInit, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
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

  subscription: Subscription | null = null;
  product: IProduct | null = null;

  isLoading = false;
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly productService = inject(ProductService);

  sortState = sortStateSignal({});
  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;
  public readonly router = inject(Router);

  protected readonly sortService = inject(SortService);
  protected modalService = inject(NavController);
  private navCtrl = inject(NavController);
  protected ngZone = inject(NgZone);
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

  const order: CartItem = {
    uuid: crypto.randomUUID(),

    productId: this.product.id,
    productName: Bosp.valueFrom(this.product, 'name'),

    quantity: this.orderDraft.quantity,
    basePrice: this.orderDraft.basePrice,
    optionPrice: this.orderDraft.optionPrice,
    totalPrice: this.orderDraft.totalPrice,

    options: this.selectedOptions,

    createdAt:  dayjs().toISOString()
  };

  const cart = CartUtils.getSafeCart();
  cart.push(order);

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

  /*
  toOrderItemEntity(draft: OrderItemDraft): IOrderItem {
    return {
      id: 0,
      quantity: draft.quantity,
      price: draft.totalPrice,
      createdAt: dayjs(),
      product: { id: draft.productId },
      
    }; 
  }*/
}
