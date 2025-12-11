import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class CartPage implements OnInit {
  cartItems: any[] = [];
  toplam = 0;

  ngOnInit() {
    const item = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartItems = Array.isArray(item) ? item : [item];
    this.toplam = this.cartItems.reduce((t, i) => t + i.fiyat * i.adet, 0);
  }
}
