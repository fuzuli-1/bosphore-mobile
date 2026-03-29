import { Component, inject, NgZone, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { IonicModule, NavController, ModalController } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslatePipe } from '../../services/TranslatePipe';
import * as iface from '../../interfaces/interfaces';
import { Address } from 'src/app/interfaces/ui-model';
import {
  AddressService,
  EntityArrayResponseType,
} from '../address/address.service';
import { SortService, SortState, sortStateSignal } from 'src/app/shared/sort';
import {
  ITEMS_PER_PAGE,
  PAGE_HEADER,
  TOTAL_COUNT_RESPONSE_HEADER,
} from 'src/app/config/pagination.constants';
import { DEFAULT_SORT_DATA, SORT } from 'src/app/config/navigation.constants';

import { Observable, Subscription, tap } from 'rxjs';
import { ActivatedRoute, Data, ParamMap, Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { AdresMapPage } from '../adres-map/adres-map.page';
import { AdresMapDetailPage } from '../adres-map-detail/adres-map-detail.page';
import { NewAddress } from '../../interfaces/interfaces';
@Component({
  selector: 'app-adres-list',
  templateUrl: './adres-list.page.html',
  styleUrls: ['./adres-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Hata mesajını bastırır
})
export class AdresListPage implements OnInit {
  selectedAddressId: number | null = null;
  addresses: iface.IAddress[] = [];
  isLoading = false;

  public readonly router = inject(Router);
  protected readonly addressService = inject(AddressService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected modalService = inject(ModalController);
  protected ngZone = inject(NgZone);
  trackId = (item: iface.IAddress): number =>
    this.addressService.getAddressIdentifier(item);

  constructor() {}

  ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    this.isLoading = true;
    this.addressService.sorgula().subscribe({
      next: (res) => {
        this.addresses = res;
        this.isLoading = false;

        // Eğer kullanıcının kayıtlı adresleri varsa, ilkini otomatik seçili yapalım
        if (this.addresses.length > 0) {
          this.selectedAddressId = this.addresses[0].id;
        }
      },
      error: (err) => {
        console.error('Adresler yüklenemedi', err);
        this.isLoading = false;
      },
    });
  }

  close() {
    this.modalService.dismiss();
  }

  confirmAddress() {
    const selectedAddress = this.addresses.find(
      (addr) => addr.id === this.selectedAddressId,
    );
    if (selectedAddress) {
      this.modalService.dismiss(selectedAddress);
    } else {
      console.warn('Hiçbir adres seçilmedi');
    }
  }

  async openAddressModal() {
    // Yeni adres ekleme veya düzenleme için modal açma işlemi burada yapılabilir
    // Örneğin, AdresEkleDüzenlePage adında bir sayfa oluşturup modal olarak açabilirsiniz
    // this.modalService.create({ component: AdresEkleDüzenlePage }).then(modal => modal.present());
    const modal = await this.modalService.create({
      component: AdresMapPage, // Bu sayfayı oluşturmanız gerekiyor
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      // Modal'dan dönen veriyi kullanarak adres ekleme işlemi yapabilirsiniz
      //selectedCoords: { lat: number; lng: number } ve fullAddress: string
      const payload = {
        location: data.location,
        fullAddress: data.fullAddress, 
      };
      const modal2 = await this.modalService.create({
        component: AdresMapDetailPage, // Bu sayfayı oluşturmanız gerekiyor
        componentProps: {
          data: payload, // Modal'dan dönen adres verisi
        },
      });
      await modal2.present();

      const data2 = await modal2.onDidDismiss();

      if (data2) {
        // Adres detay modalından dönen veriyi kullanarak adres kaydetme işlemi yapabilirsiniz
        this.loadAddresses(); // Adres listesini güncellemek için tekrar yükleyelim
      }
    }
  }
  editAddress(_t24: Address) {
    throw new Error('Method not implemented.');
  }
}
