import {
  Component,
  OnInit,
  inject,
  Input,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NavController,
  ModalController,
  ToastController,
  RefresherEventDetail,
} from '@ionic/angular';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.page.html',
  styleUrls: ['./order-success.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OrderSuccessPage implements OnInit {
  orderId: number | null = null;
  navCtrl = inject(NavController);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId') as
      | number
      | null;
  }

  goToTracking() {
    // elimizdeki orderId ile yönlendiriyoruz
    this.navCtrl.navigateForward(['/order-detail', this.orderId]);
  }

  goHome() {
    this.navCtrl.navigateRoot('/home');
  }
}
