import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { OrderService } from 'src/app/services/order-service';
import { IOrder } from 'src/app/interfaces/interfaces';
import { OrderStatus } from '../enumerations/order-status.model';
import { OrderRequestDTO } from 'src/app/interfaces/ui-model';
import dayjs from 'dayjs/esm';
import { Subscription } from 'rxjs';
import { interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
@Component({
  selector: 'app-kitchen',
  templateUrl: './kitchen.page.html',
  styleUrls: ['./kitchen.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class KitchenPage implements OnInit {

  private orderService = inject(OrderService); // OrderService'ı burada tanımlayın
  private toastController = inject(ToastController);
  public activeOrders: IOrder[] = []; // Siparişleri tutacak dizi
  private  userInteracted:boolean = false;
  private pollingSub?: Subscription;

  constructor() {}

  ngOnInit() {
    this.startPolling();

      let userInteracted = false;

      document.addEventListener('click', () => {
        userInteracted = true;
      });

      function playSound() {
        if (userInteracted) {
          new Audio('assets/sounds/notification.mp3').play();
        }
      }

  }

  startPolling() {
    // 30 saniyede bir (30000 ms) çalışır
    this.pollingSub = interval(30000)
      .pipe(
        startWith(0), // Sayfa açılır açılmaz ilk isteği hemen atar
        switchMap(() =>
          this.orderService.query({
            'status.in': ['PENDING', 'COOKING', 'PREPARING'], // Sadece aktif olanları getir
            sort: ['orderDate,desc'], // En yeniler en üstte
          }),
        ),
      )
      .subscribe({
        next: (res) => {
          const newCount = res.body?.length || 0;
          if (newCount > this.activeOrders.length) {
            this.playNotificationSound(); // Yeni sipariş varsa çal
          }

          this.activeOrders = res.body || [];
          console.log('Mutfak listesi güncellendi:', this.activeOrders.length);
        },
        error: (err) => console.error('Siparişler çekilirken hata:', err),
      });
  }

  playNotificationSound() {
    const audio = new Audio('assets/sounds/notification.mp3');
    audio.play();
  }

  ngOnDestroy() {
    // Sayfadan çıkınca arka planda istek atmaya devam etmesin (Hafıza yönetimi)
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  formatOrderDate(date: dayjs.Dayjs | null | undefined): string {
    if (!date) return '--:--';
    return date.format('HH:mm'); // Dayjs'in kendi formatlama gücünü kullanıyoruz
  }

  getStatusColor(status?: any): string {
    switch (status) {
      case 'PENDING':
        return 'warning'; // Beklemede -> Sarı
      case 'PREPARING':
        return 'secondary'; // Hazırlanıyor -> Açık Mavi
      case 'COOKING':
        return 'danger'; // Pişiyor -> Kırmızı (Ateş simgesi gibi)
      case 'ON_THE_WAY':
        return 'primary'; // Yolda -> Mavi
      case 'DELIVERED':
        return 'success'; // Teslim Edildi -> Yeşil
      case 'CANCELLED':
        return 'medium'; // İptal Edildi -> Gri
      default:
        return 'dark'; // Bilinmeyen -> Siyah
    }
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

  changeStatus(order: any, newStatus: string) {
    const partialOrder: Partial<IOrder> & { id: number } = {
      id: order.id,
      status: newStatus || order.status, // Eğer newStatus geçersizse mevcut durumu koru
    };

    this.orderService.partialUpdate(partialOrder).subscribe({
      next: (res) => {
        // backend’den dönen güncel data varsa onu kullan
        const updatedOrder = res.body;

        if (updatedOrder) {
          order.status = updatedOrder.status;
        } else {
          // fallback (genelde gerekmez ama garanti olsun)
          order.status = newStatus;
        }

        this.presentToast(
          0,
          'top',
          `Sipariş #${order.id} durumu ${newStatus} yapıldı.`,
        );
      },
      error: () => {
        this.presentToast(0, 'top', `Sipariş durumu güncellenemedi ❌`);
      },
    });
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

 printOrder(order: IOrder) {
  // 1. Yeni bir pencere açıyoruz (veya görünmez bir div kullanabilirsin)
  const printWindow = window.open('', '_blank');
  
  // 2. Fiş içeriğini hazırlıyoruz (HTML + Minimal CSS)
  const content = `
    <html>
      <head>
        <title>Sipariş #${order.id}</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 80mm; padding: 10px; }
          .center { text-align: center; }
          .line { border-bottom: 1px dashed #000; margin: 5px 0; }
          .item { display: flex; justify-content: space-between; }
          @media print { @page { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="center">
          <h3>BOSPHORE ADİSYON</h3>
          <p>Sipariş: #${order.id}</p>
          <p>${new Date().toLocaleString()}</p>
        </div>
        <div class="line"></div>
        <div class="customer">
          <strong>Müşteri:</strong> ${order.customerName}<br>
          <strong>Adres:</strong> ${order.customerAddress}
        </div>
        <div class="line"></div>
        ${order.orderItems?.map(item => `
          <div class="item">
            <span>${item.quantity}x ${item.product?.name}</span>
          </div>
        `).join('')}
        <div class="line"></div>
        <div class="center">
          <h4>TOPLAM: ${order.totalAmount} TL</h4>
          <p>Afiyet Olsun!</p>
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `;

  // 3. İçeriği bas ve yazdır
  printWindow?.document.write(content);
  printWindow?.document.close();
}
}
