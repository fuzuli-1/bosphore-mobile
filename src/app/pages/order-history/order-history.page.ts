import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule} from '@ionic/angular';
import { inject } from '@angular/core';
import { OrderService } from '../../services/order-service';
import { IOrder } from '../../interfaces/interfaces';
import { NavController } from '@ionic/angular';
import { CartService } from '../cart/cart.service';
import { ToastController } from '@ionic/angular';  
import { CartItem } from 'src/app/interfaces/ui-model';
import { Bosp } from 'src/app/shared/utils/Bosp';
import { OrderStateService } from 'src/app/services/order-state-service';
 
@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.page.html',
  styleUrls: ['./order-history.page.scss'],
  standalone: true,
  imports: [IonicModule,CommonModule, FormsModule]
})
export class OrderHistoryPage implements OnInit {


  orders: IOrder[] = [];
  public orderStateService = inject(OrderStateService);
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
      product: {
        productId: item.product?.id ?? 0,
        name: Bosp.valueFrom(item.product, 'name'),
        basePrice: item.product?.price ?? 0,
        options: item.options?.map(opt => ({         
          type: 'EXTRA',
          optionName: opt.name ?? '',
          groupId: opt.optionGroup?.id ?? 0,
          optionId: opt.id,         
          price: opt.additionalPrice ?? 0
        })) || []
      },
      quantity: item.quantity ?? 1,
      totalPrice: (item.price ?? 0) * (item.quantity ?? 1),
      address:  this.orderStateService.selectedAddress()
    };
      
      if (item.product) { 
        this.cartService.add(cartItem);
      }
    });

    const toast = await this.toastCtrl.create({
      message: 'Hadi yine iyisin kanki, ürünleri sepete attık! 🚀',
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

