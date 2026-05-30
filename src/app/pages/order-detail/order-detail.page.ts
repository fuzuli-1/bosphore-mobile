import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule,ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { IOrder } from '../../../app/interfaces/interfaces';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order-service';
import { interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { TranslationService } from 'src/app/services/translation-service';
import { TranslatePipe } from "../../services/TranslatePipe";

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslatePipe],
})
export class OrderDetailPage implements OnInit {

  orderId: number | null = null;
  order: IOrder | null = null;
  private pollingSub?: Subscription;
  private ts = inject(TranslationService);
  private toastc = inject(ToastController);

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
        error: (err) =>{
            this.showToast(this.ts.instant('ORDER_FETCH_ERROR'), 'top');
            console.error('Sipariş bilgisi alınamadı:', err)
        }
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
      PENDING: this.ts.instant('ORDER_STATUS_PENDING'),
      PREPARING: this.ts.instant('ORDER_STATUS_PREPARING'),
      COOKING: this.ts.instant('ORDER_STATUS_COOKING'),
      ON_THE_WAY: this.ts.instant('ORDER_STATUS_ON_THE_WAY'),
      DELIVERED: this.ts.instant('ORDER_STATUS_DELIVERED'),
      CANCELLED: this.ts.instant('ORDER_STATUS_CANCELLED'),
    };
    return statusMap[status || ''] || 'Bilinmiyor';
  }

  showToast(msg: string, position: 'top' | 'middle' | 'bottom') {
    this.toastc.create({
      message: msg,
      duration: 2500,
      cssClass: 'custom-toast-success',
      icon: 'checkmark-done-outline',
      position: position,
    }).then(toast => toast.present());
  }
}
