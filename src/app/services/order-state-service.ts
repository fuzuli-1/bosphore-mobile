import { Injectable, signal } from '@angular/core';
 

@Injectable({ providedIn: 'root' })
export class OrderStateService {
  // Savaşın haritası burada tutuluyor
  readonly selectedAddress = signal<any>(null);
  readonly deliveryType = signal<'delivery' | 'pickup'>('delivery');
  readonly currentUser = signal<any>(null);

  // Veriyi güncelleme metodları
  setAddress(address: any) {
    this.selectedAddress.set(address);
  }

  setDeliveryType(type: 'delivery' | 'pickup') {
    this.deliveryType.set(type);
  }

  setCurrentUser(user: any) {
    this.currentUser.set(user);
  }
}