import { Component, inject, NgZone, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PageHeaderPage } from '../page-header/page-header.page';
import {
  CartItem,
  CartChildItem,
  
  OrderRequestDTO,
} from 'src/app/interfaces/ui-model';
import { CartService } from './cart.service';
import { IOptionGroupWithItems, SelectedOption } from 'src/app/interfaces/interfaces';
import { ITEMS_PER_PAGE } from 'src/app/config/pagination.constants';
import { ExtraOptionGroupPage } from '../options/extra-options/extra-group.page';
import { OrderStateService } from 'src/app/services/order-state-service';
import { AdresListPage } from '../adres-list/adres-list.page';
import { ModalController } from '@ionic/angular';
import { PaymentMethod } from '../enumerations/payment-method.model';
import { CartUtils } from 'src/app/shared/utils/CartUtils';
import { AccountService } from 'src/app/core/auth/account.service';
import { Account } from 'src/app/core/auth/account.model';
import dayjs from 'dayjs/esm';
import { OrderService } from 'src/app/services/order-service';
import { NavController,ToastController } from '@ionic/angular';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class CartPage implements OnInit {
  page = 1;
  total = 0;
  isLoading = false;

  cartItems: CartItem[] = [];
  // Signal kullanarak (Modern Angular Yaklaşımı)
  selectedPayment = signal<PaymentMethod>(PaymentMethod.CREDIT_CARD);
  optionGroups = signal<IOptionGroupWithItems[]>([]);
  itemsPerPage = ITEMS_PER_PAGE;
  private account: Account = {} as Account;
  productId = 0;
  selectedOptions: SelectedOption[] = [];

  protected readonly cartService = inject(CartService);
  private accountService = inject(AccountService);
  public orderStateService = inject(OrderStateService);
  private modalCtrl = inject(ModalController);
  protected ngZone = inject(NgZone);
  private orderService = inject(OrderService);
  private navCtrl = inject(NavController);
  private toastController = inject(ToastController);

  // -------------------------
  // INIT
  // -------------------------
  ngOnInit() {
    /*this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.recalculateCart();
    });*/
    this.cartService.getCart().subscribe((items) => {
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
        0,
      ) ?? 0;

    const productTotal = (base + optionTotal) * item.quantity;

    const childrenTotal =
      item.children?.reduce(
        (sum, child) => sum + child.price * child.quantity,
        0,
      ) ?? 0;

    return productTotal + childrenTotal;
  }

  recalculateCart() {
    this.cartItems = this.cartItems.map((item) => ({
      ...item,
      totalPrice: this.calculateItemTotal(item),
    }));

    this.total = this.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

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
    this.cartItems = this.cartItems.filter((i) => i.uuid !== item.uuid);
    this.recalculateCart();
  }

  // -------------------------
  // CHILD (EXTRA / PROMO)
  // -------------------------
  removeChild(item: CartItem, child: CartChildItem) {
    item.children = item.children?.filter((c) => c.uuid !== child.uuid);
    this.recalculateCart();
  }

  // -------------------------
  // EXTRA OPTIONS FLOW
  // -------------------------
  onExtraOptionsChange(options: SelectedOption[]) {
    this.selectedOptions = options;

    const targetItem = this.getLastAddedItem();
    if (!targetItem) return;

    const extras: CartChildItem[] = options.map((opt) => ({
      uuid: crypto.randomUUID(),
      productId: opt.optionId,
      name: opt.optionName,
      type: 'EXTRA',
      quantity: 1,
      price: opt.price,
    }));

    targetItem.children = [...(targetItem.children ?? []), ...extras];

    this.recalculateCart();
  }

  // -------------------------
  // HELPERS
  // -------------------------
  private getLastAddedItem(): CartItem | undefined {
    return this.cartItems[this.cartItems.length - 1];
  }

  completeOrder() {
    const cart = CartUtils.getSafeCart();
    const address = this.orderStateService.selectedAddress(); // Savaş Merkezi'nden adresi alıyoruz
    this.accountService.getAuthenticationState().subscribe((user) => {
      this.account = user || ({} as Account);
    }); // Mevcut login olan kullanıcı

    const newOrder: any = {
      id: null,
      customerName: this.account?.firstName + ' ' + this.account?.lastName,
      customerAddress: address?.addressText,
      customerPhone: this.account?.phone || '', // Varsa telefon
      paymentMethod: this.selectedPayment(),
      totalAmount: this.total.toString(), // Java'da String bekliyor (@NotNull String totalAmount)
      paymentStatus: 'PENDING',
      status: 'PREPARING',
      orderDate: dayjs(),
      createdAt: dayjs(),
      updatedAt: dayjs(),

      // Java: List<OrderItemDTO> orderItems
      orderItems: cart.map((item) => ({
        quantity: item.quantity,
        price: item.totalPrice.toString(),
        createdAt: dayjs(),
        product: { id: item.product.productId }, // Java: ProductDTO product (Sadece ID yeterli)

        // Java: List<OrderItemOptionDTO> options
        options: item.product.options.map((o) => ({
          customName: o.optionName,
          quantity: 1,
          createdAt: dayjs(),
          // orderItem referansını Java tarafında set edeceğiz, buradan göndermeye gerek yok
        })),
      })),
    };

    this.orderService.create(newOrder).subscribe({
      next: (res) => {
        // 1. Sepeti temizle
        CartUtils.clearCart();

        // 2. Gelen cevaptan sipariş ID'sini al (Backend'den dönen id)
        const savedOrder = res.body;
        const orderId = savedOrder?.id;

        // 3. Sipariş ID'sini Savaş Merkezi'ne gönder (Eğer gerekiyorsa, şu an sadece logluyoruz)
        console.log('Sipariş başarıyla oluşturuldu. Sipariş ID:', orderId);

        // 4. Başarı sayfasına yönlendir
        // 3. Success sayfasına ID ile git
        this.navCtrl.navigateRoot(['/order-success'], {
          queryParams: { orderId: savedOrder?.id },
        });
      },

      error: (err) => {
    // Hata durumunda Toast ile mesaj ver
        this.presentToast(0, 'bottom', "Sipariş sırasında bir hata oluştu. Lütfen tekrar dene.");
  }
    });
  }

  changeAddress() {
    this.openAddressList();
  }

  async openAddressList() {
    const addressModal = await this.modalCtrl.create({
      component: AdresListPage,
      cssClass: 'address-list-modal', // Görseldeki gibi tam ekran veya geniş modal
    });
    await addressModal.present();

    const { data } = await addressModal.onWillDismiss();
    if (data) {
      // Seçilen adresi merkezi servise (Savaş Merkezi) gönderiyoruz
      this.orderStateService.setAddress(data);
      console.log('Seçilen adres:', data);
      // Burada seçilen adresle ne yapmak istediğinize karar verebilirsiniz
    }
  }

    async presentToast(
    type: any,
    position: 'top' | 'middle' | 'bottom',
    mesaj: string
  ) {
    //type 1 success , 0   error

    if (type === 1) {
      const toast = await this.toastController.create({
        message: mesaj,
        duration: 2500,
        cssClass: 'custom-toast-success',
        icon: 'checkmark-done-outline',
        position: position,
      });
      await toast.present();
    } else {
      const toast0 = await this.toastController.create({
        message: mesaj,
        duration: 2500,
        cssClass: 'custom-toast-warning',
        icon: 'information-outline',
        position: position,
      });
      await toast0.present();
    }
  }
}
