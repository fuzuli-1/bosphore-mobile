import {
  Component,
  computed,
  inject,
  NgZone,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CartService } from './cart.service';
import {
  CartItem,
  IOptionGroupWithItems,
  IOptionItem,
} from 'src/app/interfaces/interfaces';
import { ITEMS_PER_PAGE } from 'src/app/config/pagination.constants';
import { OrderStateService } from 'src/app/services/order-state-service';
 

import { PaymentMethod } from '../enumerations/payment-method.model';
import { CartUtils } from 'src/app/shared/utils/CartUtils';
import { AccountService } from 'src/app/core/auth/account.service';
import { Account } from 'src/app/core/auth/account.model';
import { OrderService } from 'src/app/services/order-service';

import {
  AndroidWebViewOptions,
  InAppBrowser,
  iOSAnimation,
  iOSViewStyle,
  iOSWebViewOptions,
  ToolbarPosition,
} from '@capacitor/inappbrowser'; // Mobil tarayıcı için

import { firstValueFrom } from 'rxjs';
import { App } from '@capacitor/app';
import { DeliveryType } from '../../interfaces/interfaces';
import { Router } from '@angular/router';
import { Bosp } from 'src/app/shared/utils/Bosp';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { TranslatePipe } from '../../services/TranslatePipe';
import { TranslationService } from 'src/app/services/translation-service';

import {
  ToastController,
  NavController,
  ModalController,
  Platform,
  IonFooter,
  IonCard,
  IonCardContent,
  IonLabel,
  IonItemOption,
  IonHeader,
  IonItem,
  IonList,
  IonBadge,
  IonButtons,
  IonButton,
  IonIcon,
  IonToolbar,
  IonBackButton,
  IonTitle,
  IonContent,
  IonItemSliding,
  IonItemOptions,
} from '@ionic/angular/standalone';
import { AppUtil } from 'src/app/shared/utils/app-util';
import { AdresListPage } from '../adres/adres-list/adres-list.page';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    IonFooter,
    IonCard,
    IonCardContent,
    IonLabel,
    IonItemOptions,
    IonItemOption,
    IonItemSliding,
    IonHeader,
    IonItem,
    IonList,
    IonBadge,
    IonButtons,
    IonButton,
    IonIcon,
    IonToolbar,
    IonBackButton,
    IonTitle,
    IonContent,
    CommonModule,
    FormsModule,
    TooltipDirective,
    TranslatePipe,
  ],
})
export class CartPage implements OnInit {
  deliveryType = signal<DeliveryType>('delivery');
  private platform = inject(Platform);

  page = 1;
  total = 0;
  isLoading = false;
  isSubmitting = signal(false);
  cartItems: CartItem[] = [];
  orderPlaced = signal(false);

  // Signal kullanarak (Modern Angular Yaklaşımı)

  optionGroups = signal<IOptionGroupWithItems[]>([]);
  itemsPerPage = ITEMS_PER_PAGE;
  private account: Account = {} as Account;
  productId = 0;

  private cartService = inject(CartService);
  private accountService = inject(AccountService);
  public orderStateService = inject(OrderStateService);
  private modalCtrl = inject(ModalController);
  protected ngZone = inject(NgZone);
  private orderService = inject(OrderService);
  private navCtrl = inject(NavController);
  private toastController = inject(ToastController);
  private zone = inject(NgZone); // 🔥 Zone'u ekle
  private router = inject(Router);
  private ts = inject(TranslationService);
  // HTML'deki seçimi tam eşitlemek için: senin HTML'de CARD ve ONLINE var
  selectedPayment = signal<PaymentMethod>(PaymentMethod.CASH);

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
    const base = item.product.price ?? 0;
    const optionTotal =
      item.children?.reduce(
        (sum, child) =>
          sum + Bosp.getValue(child, 'additionalPrice') * (child.quantity || 1),
        0,
      ) ?? 0;
    const productTotal = (base + optionTotal) * item.quantity;
    return productTotal;
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
  removeChild(item: CartItem, child: IOptionItem) {
    item.children = item.children?.filter((c) => c.uuid !== child.uuid);
    this.recalculateCart();
  }

  changeAddress() {
    this.openAddressList();
  }

  getAdressText(): string {
    const address = this.orderStateService.selectedAddress();
    return address ? address.addressText : this.ts.instant('SELECT_ADDRESS');
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
    mesaj: string,
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

  async confirmOrder() {
    try {
      // Double submit engeli
      if (this.isSubmitting()) {
        return;
      }

      this.isSubmitting.set(true);

      // Sepet kontrolü
      if (this.cartItems.length === 0) {
        this.presentToast(0, 'bottom', this.ts.instant('CART_IS_EMPTY'));
        return;
      }

      // Adres kontrolü
      const address = this.orderStateService.selectedAddress();

      if (!address) {
        this.presentToast(
          0,
          'bottom',
          this.ts.instant('PLEASE_SELECT_ADDRESS'),
        );
        return;
      }

      // Login kullanıcıyı güvenli şekilde al
      const user = await firstValueFrom(
        this.accountService.getAuthenticationState(),
      );

      this.account = user || ({} as Account);

      // Güvenli cart
      const cart = CartUtils.getSafeCart();

      // Frontend SADECE gerekli bilgileri göndersin
      // Fiyat hesaplamasını backend yapsın
      const newOrder: any = {
        id: null,

        customerName:
          `${this.account?.firstName || ''} ${this.account?.lastName || ''}`.trim(),

        customerAddress: address?.addressText || '',

        customerPhone: this.account?.phone || '',

        paymentMethod: this.selectedPayment(),

        // Sadece görüntü amaçlı gönderilebilir
        // Backend tekrar hesaplamalı
        totalAmount: Number(this.total || 0).toFixed(2),

        paymentStatus: 'PENDING',

        status: this.selectedPayment() === 'ONLINE' ? 'PENDING' : 'PREPARING',

        // Backend üretmeli ama compatibility için bırakıldı
        clientRequestId: AppUtil.generateUUID(),

        orderItems: cart.map((item) => ({
          quantity: item.quantity,

          // PRICE GÖNDERME!
          // Backend DB’den hesaplasın

          product: {
            id: item.product.id,
          },
          // Option isim değil ID gönder
          options: item.children,
        })),
      };

      // ONLINE ÖDEME
      if (this.selectedPayment() === 'ONLINE') {
        await this.handleOnlinePayment(newOrder);
      }

      // KAPIDA ÖDEME
      else {
        await this.executeStandardOrder(newOrder);
      }
    } catch (err) {
      console.error('confirmOrder error:', err);

      this.presentToast(0, 'bottom', this.ts.instant('ORDER_PROCESS_ERROR'));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Online ödeme akışı
   */
  private async handleOnlinePayment(orderRequest: any) {
    try {
      const res: any = await firstValueFrom(
        this.orderService.initiateOnlinePayment(orderRequest),
      );

      const paymentUrl = res.body?.paymentPageUrl;

      if (!paymentUrl) {
        this.presentToast(
          0,
          'bottom',
          this.ts.instant('PAYMENT_LINK_NOT_AVAILABLE'),
        );

        return;
      }

      // WEB
      if (!this.platform.is('capacitor') && !this.platform.is('cordova')) {
        window.location.assign(paymentUrl);

        return;
      }

      // MOBİL
      const androidOptions: AndroidWebViewOptions = {
        allowZoom: true,
        hardwareBack: true,
        pauseMedia: true,
      };

      const iosOptions: iOSWebViewOptions = {
        allowOverScroll: true,
        enableViewportScale: true,
        allowInLineMediaPlayback: true,
        surpressIncrementalRendering: true,
        viewStyle: iOSViewStyle.FORM_SHEET,
        animationEffect: iOSAnimation.COVER_VERTICAL,
        allowsBackForwardNavigationGestures: false,
      };

      // Deep link dinleme
      App.addListener('appUrlOpen', async (event: any) => {
        const url = event?.url || '';

        console.log('Payment callback url:', url);

        // Başarılı ödeme
        if (url.includes('payment-success')) {
          try {
            const parsedUrl = new URL(url);

            const orderId = parsedUrl.searchParams.get('orderId');

            // Sepeti temizle
           this.clearCart();

            await this.navCtrl.navigateRoot(['/order-success'], {
              queryParams: {
                orderId,
              },
            });
          } catch (err) {
            console.error('payment-success parse error:', err);
          }
        }

        // Başarısız ödeme
        else if (url.includes('payment-failed')) {
          this.presentToast(0, 'bottom', this.ts.instant('PAYMENT_FAILED'));
        }
      });

      // WebView aç
      await InAppBrowser.openInWebView({
        url: paymentUrl,

        options: {
          showURL: true,

          showToolbar: true,

          clearCache: false,

          clearSessionCache: false,

          mediaPlaybackRequiresUserAction: true,

          closeButtonText: this.ts.instant('CLOSE'),

          toolbarPosition: ToolbarPosition.BOTTOM,

          showNavigationButtons: false,

          leftToRight: true,

          android: androidOptions,

          iOS: iosOptions,
        },

        customHeaders: {
          title: this.ts.instant('SECURE_PAYMENT'),
        },
      });
    } catch (err: any) {
      console.error('handleOnlinePayment error:', err);

      const backendMessage =
        err?.error?.message || this.ts.instant('PAYMENT_INIT_ERROR');

      this.presentToast(0, 'bottom', backendMessage);
    }
  }

  /**
   * Kapıda ödeme / nakit / pos
   */
  private async executeStandardOrder(newOrder: any) {
    try {
      const res = await firstValueFrom(this.orderService.create(newOrder));

      const savedOrder = res.body;

      if (!savedOrder?.id) {
        this.presentToast(
          0,
          'bottom',
          this.ts.instant('ORDER_PROCESS_ERROR') +
            ':' +
            this.ts.instant('ORDER_ID_NOT_RECEIVED'),
        );
        throw new Error('Sipariş ID alınamadı');
      }

      // Başarılıysa sepet temizle  
        this.clearCart();
      console.log('Sipariş başarıyla oluşturuldu. Sipariş ID:', savedOrder.id);

      // Success ekranı
      await this.navCtrl.navigateRoot(['/order-success'], {
        queryParams: {
          orderId: savedOrder.id,
        },
      });
    } catch (err: any) {
      console.error('executeStandardOrder error:', err);

      // Backend hata mesajı varsa göster
      const backendMessage =
        err?.error?.message || this.ts.instant('ORDER_PROCESS_ERROR');

      this.presentToast(0, 'bottom', backendMessage);
    }
  }

  clearCart() {   
    this.cartItems = [];
    this.total = 0;
    this.cartService.clear();
    this.presentToast(1, 'bottom', this.ts.instant('CART_CLEARED'));
  }

  setDelivery(type: DeliveryType): void {
    this.deliveryType.set(type);
  }

  getExtrasLabel(item: CartItem): string {
    const parts = [
      item.children?.length ? `${item.children.length} ekstra` : null,
    ].filter(Boolean) as string[];
    if (item.children != null && item.children.length > 0) {
      parts.push(item.children.map((c) => c.name).join(', '));
    }
    return parts.join(' · ');
  }

  placeOrder(): void {
    this.orderPlaced.set(true);
    setTimeout(() => {
      this.cartService.clear();
      this.orderPlaced.set(false);
      this.zone.run(() => {
        this.router.navigate(['/home']);
      });
    }, 2500);
  }

  selectPayment(odeme: string) {
    this.selectedPayment.set(odeme as PaymentMethod);
  }
}
