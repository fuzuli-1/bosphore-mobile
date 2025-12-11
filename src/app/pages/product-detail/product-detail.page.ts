import { Component, inject, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule],
})
export class ProductDetailPage implements OnInit {
  pizza: any;
  boyutlar = ['Küçük', 'Orta', 'Büyük'];
  hamurlar = ['İnce', 'Kalın'];
  malzemeler = ['Mısır', 'Zeytin', 'Sucuk', 'Mantar'];
  secimler = { boyut: '', hamur: '', malzemeler: [], adet: 1 };
  private navCtrl = inject(NavController);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    // Örnek data:
    this.pizza = { id, ad: 'Margarita', aciklama: 'Mozzarella ve domates sos', fiyat: 120, resim: 'assets/pizza1.jpg' };
  }

  sepeteEkle() {
    const siparis = { ...this.pizza, ...this.secimler };
    localStorage.setItem('cart', JSON.stringify(siparis));
    this.navCtrl.navigateForward('/cart');
  }
}
