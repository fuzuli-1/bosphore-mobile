import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule} from '@ionic/angular';
import { inject } from '@angular/core';
import { OrderService } from '../../services/order-service';
import { CartItem, IOrder } from '../../interfaces/interfaces';
import { NavController } from '@ionic/angular';
import { CartService } from '../cart/cart.service';
import { ToastController } from '@ionic/angular';  
import { Bosp } from 'src/app/shared/utils/Bosp';
import { OrderStateService } from 'src/app/services/order-state-service';
import dayjs from 'dayjs/esm';
import { TranslatePipe } from "../../services/TranslatePipe";
import { TranslationService } from 'src/app/services/translation-service';
 
@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslatePipe]
})
export class OrderHistoryPage implements OnInit {


  orders: IOrder[] = [];
  public orderStateService = inject(OrderStateService);
  private ts = inject(TranslationService);
 constructor(
    private orderService: OrderService,
    private navCtrl: NavController,
    private cartService: CartService,
    private toastCtrl: ToastController
  ) {}
 

  ngOnInit() {
 this.loadOrders();
}

loadOrders() {
  // Backend'de sadece giriş yapan kullanıcının siparişlerini getiren bir endpoint lazım
  this.orderService.query({
    sort: ['orderDate,desc'] // En sonuncuyu en üstte göster
  }).subscribe(res => {
    this.orders = res.body || [];
  });
}

viewDetail(orderId: number) {
  // Tıklanan siparişin detayına (takip ekranına) gider
  this.navCtrl.navigateForward(['/order-detail', orderId]);
}

    getStatusLabel(status?: any): string {
    const statusMap: { [key: string]: string } = {
      PENDING: 'Yeni Sipariş',
      PREPARING: 'Hazırlanıyor',
      COOKING: 'Fırında 🔥',
      ON_THE_WAY: 'Kuryede 🛵',
      DELIVERED: 'Teslim Edildi',
      CANCELLED: 'İptal',
    };
    return statusMap[status || ''] || 'Bilinmiyor';
  }

// Daha önce konuştuğumuz renk ve etiket metotları
  getStatusColor(status: any): string {
    const colors: { [key: string]: string } = {
      'PENDING': 'warning',
      'COOKING': 'danger',
      'ON_THE_WAY': 'primary',
      'DELIVERED': 'success',
      'CANCELLED': 'medium'
    };
    return colors[status] || 'dark';
  }

async reorder(order: IOrder, event: Event) {
  
  // Kartın tıklanma olayını durdur ki detay sayfasına gitmesin
  event.stopPropagation();

  if (order.orderItems && order.orderItems.length > 0) {
    order.orderItems.forEach(item => {
      let cartItem: CartItem = {
      uuid: crypto.randomUUID(),
      product: item.product as any,  
      quantity: item.quantity ?? 1,
      totalPrice: (item.price ?? 0) * (item.quantity ?? 1),
      address:  this.orderStateService.selectedAddress()
    };
      
      if (item.product) { 
        this.cartService.add(cartItem);
      }
    });

    const toast = await this.toastCtrl.create({
      message: this.ts.instant('REORDER_SUCCESS'),
      duration: 2000,
      color: 'success',
      position: 'bottom',
      buttons: [{
        text: 'Sepete Git',
        handler: () => {
          this.navCtrl.navigateForward('/cart');
        }
      }]
    });
    toast.present();
  }
}
}

