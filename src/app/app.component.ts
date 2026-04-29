import { Component, inject, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ApplicationConfigService } from './core/config/application-config.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { TrackerService } from './core/tracker/tracker.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { registerLocaleData } from '@angular/common';
import locale from '@angular/common/locales/tr';
import { fontAwesomeIcons } from './config/font-awesome-icons';
import dayjs from 'dayjs/esm';

import { GeneralSettings } from './page';
import { CartUtils } from './shared/utils/CartUtils';
import { CommonModule } from '@angular/common';
import { AccountService } from './core/auth/account.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly iconLibrary = inject(FaIconLibrary);
  private readonly trackerService = inject(TrackerService);
  private readonly account = inject(AccountService);
  private readonly dpConfig = inject(BsDatepickerConfig);

  public appPages: { title: string; url: string; icon: string }[] = [];

  public adminPages = [
    { title: 'Ana Sayfa', url: '/home', icon: 'home' },
    { title: 'Siparişlerim', url: '/order-history', icon: 'receipt' }, // Müşteri için
    { title: 'Adreslerim', url: '/address', icon: 'location' },
    // Mutfak Paneli - Şimdilik herkes görsün, sonra sadece admin yaparız
    { title: 'Mutfak Paneli', url: '/kitchen', icon: 'restaurant' },
    { title: 'Dil Yönetimi', url: '/language', icon: 'people' },
    { title: 'Category Tanim', url: '/category', icon: 'grid-outline' },
     { title: 'Ürün Tanim', url: '/products', icon: 'grid-outline' },
    { title: 'Menu Tanim', url: '/menu-management', icon: 'grid-outline' },
  ];

  public userPages = [
    { title: 'Ana Sayfa', url: '/home', icon: 'home' },
    { title: 'Siparişlerim', url: '/order-history', icon: 'receipt' }, // Müşteri için
    { title: 'Adreslerim', url: '/address', icon: 'location' },
 
  ];

  constructor() {
    //this.trackerService.setup();
    this.applicationConfigService.setEndpointPrefix(GeneralSettings.url);
    registerLocaleData(locale);
    this.iconLibrary.addIcons(...fontAwesomeIcons);
    // ✔️ Artık datepicker config ayarlayabilirsin:
    this.dpConfig.minDate = new Date(
      dayjs().subtract(100, 'year').year(),
      0, // Ocak
      1, // Birinci gün
    );
  }

  ngOnInit() {
    this.cleanInvalidCart();

   this.account.identity().subscribe((identity) => {
        this.appPages= identity?.authorities?.includes('ROLE_ADMIN') ? this.adminPages : this.userPages;
      });
  }

  private cleanInvalidCart(): void {
    try {
      CartUtils.clearCart();
    } catch (error) {
      console.warn('Invalid JSON in cart, clearing...');
      localStorage.removeItem('cart');
    }
  }
}
