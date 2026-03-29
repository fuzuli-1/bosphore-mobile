import { IonApp } from '@ionic/angular/standalone';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  Signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  NavController,
  ModalController,
  ToastController,
  RefresherEventDetail,
} from '@ionic/angular';

import { Subscription, timer } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { IonRefresherCustomEvent } from '@ionic/core';

import { FooterService } from '../services/footer-service';
import { MenuService } from '../services/menu-service';
import { LoadingService } from '../services/loading-service';

import { Langs } from '../pages/lang';

import { IMenuGroup } from '../interfaces/interfaces';
import * as iface from '../interfaces/interfaces';
import { TranslationService } from '../services/translation-service';
import { CategorySwiperComponent } from '../pages/menu-group-item/menu-group-item.page';
import { AccountService } from '../core/auth/account.service';
import { MenuGroupsPage } from '../pages/menu-groups/menu-groups.page';
import { ProductsPage } from '../pages/products/products.page';
import { PageHeaderPage } from '../pages/page-header/page-header.page';
import { AdreseTeslimPage } from '../pages/adrese-teslim/adrese-teslim.page';
import { Account } from '../core/auth/account.model';
import { AdresListPage } from '../pages/adres-list/adres-list.page';
import { OrderStateService } from '../services/order-state-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    MenuGroupsPage,
    ProductsPage,
    PageHeaderPage,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Hata mesajını bastırır
  providers: [
    FooterService,
    MenuService,
    // Diğer servisler...
  ],
})
export class HomePage implements OnInit, AfterViewInit {
 
  private router = inject(Router);
  private modalCtrl = inject(ModalController); 
  private account = inject(AccountService);
  private translate= inject(TranslationService); 
  public orderService = inject(OrderStateService); // HTML'den erişmek için public
  constructor() {}

  selectedSegment: number = 0;
  languages = Langs;
  products: iface.IProduct[] = [];
  subGroups: iface.IMenuGroupItem[] = [];

  selectedGroupId: number = 0;
  selectedGroupItemId: number = 0;
  selectedAddress: iface.IAddress | null = null;
 
  ngOnInit() {
    if (this.account.isAuthenticated()) {
      this.initAfterLogin();
    }
    if(this.account.isAuthenticated()) {
      this.account.getAuthenticationState().subscribe((account) => {
        if (account) { 
          this.orderService.setCurrentUser(account);
        }
      });
    };
 
  }

  initAfterLogin() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
      }
    });
  }

  doRefresh($event: IonRefresherCustomEvent<RefresherEventDetail>) {
    throw new Error('Method not implemented.');
  }

  onSelectedGroupChange(menuGroup: iface.IMenuGroup) {
    this.selectedGroupId = menuGroup.id;
  }

  ngAfterViewInit() {
    let x = 0;
  }

  async presentOrderTypeModal() {
     this.openAddressList();
    /*const currentUser = this.account.trackCurrentAccount()();
    const modal = await this.modalCtrl.create({
      component: AdreseTeslimPage,
      cssClass: 'delivery-selection-modal', // CSS ile resimdeki gibi yuvarlatılmış köşeler yapabiliriz
      breakpoints: [0, 0.5, 0.8], // Mobil için sürükleyerek kapatma özelliği
      backdropDismiss: true, // Dışarı tıklayınca kapanması için
      initialBreakpoint: 0.5,
      componentProps: {
        // Modal içine veri göndermek isterseniz burayı kullanabilirsiniz
        userName: currentUser?.firstName || 'Misafir',
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      // 3. Eğer Adrese Teslim seçildiyse, Adres Listesi Modalını aç
      if (data && data.type === 'delivery') {
        this.openAddressListModal();
      }
    }*/  
  }

  // Adres Listesi Modalını açan ayrı metod
  // 2. CEPHE: Adres Listesi ve Seçimi
  async openAddressList() {
    const addressModal = await this.modalCtrl.create({
      component: AdresListPage,
      cssClass: 'address-list-modal' // Görseldeki gibi tam ekran veya geniş modal
    });
      await addressModal.present();

      const { data } = await addressModal.onWillDismiss();
      if (data) {
       // Seçilen adresi merkezi servise (Savaş Merkezi) gönderiyoruz
         this.orderService.setAddress(data);
          console.log('Seçilen adres:', data);
          // Burada seçilen adresle ne yapmak istediğinize karar verebilirsiniz
      }
  }
}
