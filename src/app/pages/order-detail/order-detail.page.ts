import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { IOrder } from '../../../app/interfaces/interfaces';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order-service';
import { interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class OrderDetailPage implements OnInit {

  orderId: number | null = null;
  order: IOrder | null = null;
  private pollingSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    // 1. URL'den orderId'yi alıyoruz (Örn: /order-detail/123)
    const idParam = this.route.snapshot.paramMap.get('orderId');
    
    if (idParam) {
      this.orderId = Number(idParam);
      this.startTracking();
    }
  }

  startTracking() {
    // 2. Her 20-30 saniyede bir siparişin güncel durumunu sorgula
    this.pollingSub = interval(20000)
      .pipe(
        startWith(0), // Sayfa açılır açılmaz beklemeden ilk sorguyu at
        switchMap(() => this.orderService.find(this.orderId!))
      )
      .subscribe({
        next: (res) => {
          this.order = res.body;
          console.log('Sipariş güncel durumu:', this.order?.status);
          
          // Eğer teslim edildiyse veya iptal edildiyse takibi durdurabilirsin
          if (this.order?.status === 'DELIVERED' || this.order?.status === 'CANCELLED') {
            this.pollingSub?.unsubscribe();
          }
        },
        error: (err) => console.error('Sipariş bilgisi alınamadı:', err)
      });
  }

  ngOnDestroy() {
    // Sayfadan ayrılınca arka plandaki sorguları temizle
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  isStepActive(stepStatus: string): boolean {
    const statusLevels: { [key: string]: number } = {
      PENDING: 1,
      PREPARING: 2,
      COOKING: 2,
      ON_THE_WAY: 3,
      DELIVERED: 4,
    };

    const currentLevel = statusLevels[this.order?.status || 'PENDING'];
    const targetLevel = statusLevels[stepStatus];

    return currentLevel >= targetLevel;
  }

  getCurrentIcon(): string {
    switch (this.order?.status) {
      case 'COOKING':
        return 'restaurant';
      case 'ON_THE_WAY':
        return 'bicycle';
      case 'DELIVERED':
        return 'checkmark-done-circle';
      default:
        return 'receipt';
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
}
