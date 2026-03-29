import { Component, inject, NgZone, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderPage } from '../page-header/page-header.page';
import {
  CartItem,
  CartChildItem,
  SelectedOption
} from 'src/app/interfaces/ui-model';
import { CartService } from './cart.service';
import { IOptionGroupWithItems } from 'src/app/interfaces/interfaces';
import { ITEMS_PER_PAGE } from 'src/app/config/pagination.constants';
import { ExtraOptionGroupPage } from '../options/extra-options/extra-group.page';
import { OrderStateService } from 'src/app/services/order-state-service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    PageHeaderPage,
  ],
})
export class CartPage implements OnInit {
confirmOrder() {
throw new Error('Method not implemented.');
}
changeAddress() {
throw new Error('Method not implemented.');
}

  page = 1;
  total = 0;
  isLoading = false;

  cartItems: CartItem[] = [];

  optionGroups = signal<IOptionGroupWithItems[]>([]);
  itemsPerPage = ITEMS_PER_PAGE;

  productId = 0;
  selectedOptions: SelectedOption[] = [];

  protected readonly cartService = inject(CartService);
  public orderService = inject(OrderStateService);
  protected ngZone = inject(NgZone);

  // -------------------------
  // INIT
  // -------------------------
  ngOnInit() {
    /*this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.recalculateCart();
    });*/
    this.cartService.getCart().subscribe(items => {
    this.cartItems = Array.isArray(items) ? items : [];
    this.recalculateCart();
  });
  }

  // -------------------------
  // PRICE CALCULATION
  // -------------------------
  calculateItemTotal(item: CartItem): number {
    const base = item.product.basePrice ?? 0;

    const optionTotal =
      item.product.options?.reduce(
        (sum, opt) => sum + (Number(opt.price) || 0),
        0
      ) ?? 0;

    const productTotal = (base + optionTotal) * item.quantity;

    const childrenTotal =
      item.children?.reduce(
        (sum, child) => sum + (child.price * child.quantity),
        0
      ) ?? 0;

    return productTotal + childrenTotal;
  }

  recalculateCart() {
    this.cartItems = this.cartItems.map(item => ({
      ...item,
      totalPrice: this.calculateItemTotal(item)
    }));

    this.total = this.cartItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  // -------------------------
  // QUANTITY
  // -------------------------
  increase(item: CartItem) {
    item.quantity++;
    this.recalculateCart();
  }

  decrease(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
      this.recalculateCart();
    }
  }

  remove(item: CartItem) {
    this.cartItems = this.cartItems.filter(i => i.uuid !== item.uuid);
    this.recalculateCart();
  }

  // -------------------------
  // CHILD (EXTRA / PROMO)
  // -------------------------
  removeChild(item: CartItem, child: CartChildItem) {
    item.children = item.children?.filter(c => c.uuid !== child.uuid);
    this.recalculateCart();
  }

  // -------------------------
  // EXTRA OPTIONS FLOW
  // -------------------------
  onExtraOptionsChange(options: SelectedOption[]) {
    this.selectedOptions = options;

    const targetItem = this.getLastAddedItem();
    if (!targetItem) return;

    const extras: CartChildItem[] = options.map(opt => ({
      uuid: crypto.randomUUID(),
      productId: opt.optionId,
      name: opt.optionName,
      type: 'EXTRA',
      quantity: 1,
      price: opt.price
    }));

    targetItem.children = [
      ...(targetItem.children ?? []),
      ...extras
    ];

    this.recalculateCart();
  }

  // -------------------------
  // HELPERS
  // -------------------------
  private getLastAddedItem(): CartItem | undefined {
    return this.cartItems[this.cartItems.length - 1];
  }

 


}
