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
import { IOrderItem, IProduct } from 'src/app/interfaces/interfaces';
import {
  EntityArrayResponseType,
  ProductService,
} from '../products/product-service';
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

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule,CommonModule],
})
export class ProductDetailPage implements OnInit {

  subscription: Subscription | null = null;
  product: IProduct | null = null;
  orderItem!: IOrderItem;
  isLoading = false;
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly productService = inject(ProductService);

  totalPrice: number = 0;

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

          this.orderItem = {
            id: 0, // yeni kayıt
            quantity: 1,
            price: this.product?.price, // string
            createdAt: dayjs(),
            product: { id: this.product.id },
          };
        }

      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  increase() {
    if (!this.orderItem.quantity) {
      this.orderItem.quantity = 0;
    } 
  this.orderItem.quantity++;
  this.calculateTotal();
}

decrease() {  
  if (!this.orderItem.quantity) {
    this.orderItem.quantity = 0;
  }

  if (this.orderItem.quantity > 1) {
    this.orderItem.quantity--;
    this.calculateTotal();
  }
}

calculateTotal() {

  if (!this.orderItem.quantity) {
    this.orderItem.quantity = 0;
  }
  if (!this.orderItem.price) {
    this.orderItem.price = 0;
  }

  this.totalPrice =
    this.orderItem.quantity * this.orderItem.price;
}

  sepeteEkle() {
    /*const siparis = { ...this.pizza, ...this.secimler };
    localStorage.setItem('cart', JSON.stringify(siparis));
    this.navCtrl.navigateForward('/cart');*/
  }
}
