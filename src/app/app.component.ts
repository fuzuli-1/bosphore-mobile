import { Component, inject, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router'; // 💡 Router eklendi
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
import { StateStorageService } from './core/auth/state-storage.service';
import { LoginService } from './services/login-service'; // 💡 Kendi login servis yolunu kontrol et kanki
import {
  IonApp,
  IonMenu,
  IonContent,
  IonList,
  IonListHeader,
  IonMenuToggle,
  IonItem,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  NavController,
  MenuController
} from '@ionic/angular/standalone';
import { TranslatePipe } from './services/TranslatePipe';

// 💡 Standalone ikon kaydı için importlar
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    IonApp,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonMenuToggle,
    IonItem,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    CommonModule,
    RouterModule,
    TranslatePipe,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly iconLibrary = inject(FaIconLibrary);
  private readonly trackerService = inject(TrackerService);
  private readonly account = inject(AccountService);
  private readonly storageService = inject(StateStorageService);
  private readonly loginService = inject(LoginService); // 💡 Inject edildi
  private readonly router = inject(Router); // 💡 Inject edildi
  private readonly dpConfig = inject(BsDatepickerConfig);
  private readonly menuCtrl = inject(MenuController);
  private readonly navCtrl = inject(NavController);
  public appPages: { title: string; url: string; icon: string }[] = [];

  isLoggedIn = false;
  public adminPages = [
    { title: 'HOME_PAGE', url: '/home', icon: 'home' },
    { title: 'ORDER_HISTORY', url: '/order-history', icon: 'receipt' },
    { title: 'MY_ADDRESSES', url: '/address', icon: 'location' },
    { title: 'KITCHEN_PANEL', url: '/kitchen', icon: 'restaurant' },
    { title: 'LANGUAGE_MANAGEMENT', url: '/language', icon: 'people' },
    { title: 'MENU_MANAGEMENT', url: '/menu-management', icon: 'grid-outline' },
    { title: 'CATEGORY_MANAGEMENT', url: '/category', icon: 'grid-outline' },
    { title: 'PRODUCT_MANAGEMENT', url: '/products', icon: 'grid-outline' },
    { title: 'PRODUCT_OPTION_GROUP', url: '/product-option-group', icon: 'grid-outline' },
    {
      title: 'OPTION_MANAGEMENT',
      url: '/option-management',
      icon: 'grid-outline',
    },
  ];

  public userPages = [
    { title: 'HOME_PAGE', url: '/home', icon: 'home' },
    { title: 'ORDER_HISTORY', url: '/order-history', icon: 'receipt' },
    { title: 'MY_ADDRESSES', url: '/address', icon: 'location' },
  ];

  constructor() {
    console.log('AppComponent constructor çalıştı');
    this.applicationConfigService.setEndpointPrefix(GeneralSettings.url);
    
    // 💡 Standalone menüde çıkış ikonunun görünmesi için kayıt işlemi
    addIcons({ 'log-out-outline': logOutOutline });

    registerLocaleData(locale);
    this.iconLibrary.addIcons(...fontAwesomeIcons);
    this.dpConfig.minDate = new Date(
      dayjs().subtract(100, 'year').year(),
      0,
      1,
    );
  }

// app.component.ts içindeki ngOnInit metodun
async ngOnInit() {
  console.log('AppComponent ngOnInit çalıştı');
  
  // 1. Kalıcı hafızadaki token ve dil bilgisini yükleyip kesinlikle bitmesini bekle
  await this.storageService.getAuthenticationTokenMobile();
  await this.storageService.getLocaleMobile();
  
  this.cleanInvalidCart();

  // 2. Token yüklendikten sonra JHipster kimlik kontrolünü 'true' (force tazelemeli) olarak tetikle
  // Bu sayede account() sinyali dolacak ve isLoggedIn true'ya dönecek
  this.account.identity(true).subscribe({
    next: (identity) => {
      if (identity) {
        console.log('Kalıcı hafızadan kullanıcı başarıyla doğrulandı:', identity);
        this.isLoggedIn = true;

        if (window.location.pathname.includes('order-success')) {
            console.log('Stripe dönüş sayfasındayız, otomatik ana sayfa yönlendirmesi iptal edildi.');
            return; 
          }
        
        // Eğer kullanıcı login sayfasında takılı kaldıysa onu ana sayfaya fırlat
        if (this.router.url === '/' || this.router.url.includes('/login')) {
          this.navCtrl.navigateRoot('/home');
        }
      } else {
        console.log('Kalıcı hafızada geçerli bir kullanıcı bulunamadı.');
      }
    },
    error: (err) => {
      console.error('İlk açılış identity kontrolü başarısız:', err);
    }
  });

  // Mevcut getAuthenticationState aboneliğin aynen kalabilir
  this.account.getAuthenticationState().subscribe((identity) => {
    this.isLoggedIn = !!identity;
    this.appPages = identity?.authorities?.includes('ROLE_ADMIN')
      ? this.adminPages
      : this.userPages;

    setTimeout(async () => {
      await this.menuCtrl.enable(this.isLoggedIn, 'mainMenu');
    }, 0);
  });
}


// app.component.ts içindeki logout fonksiyonunu şununla değiştirin:
logout(): void {
  console.log('Kullanıcı çıkış işlemi tetiklendi (Senkron).');
  
  // 1. Önce açık olan yan menüyü kapatın
  this.menuCtrl.close('mainMenu');

  try {
    // 2. JHipster servis çıkışını tetikleyin (Kendi içinde subscribe olur)
    this.loginService.logout();
  } catch (err) {
    console.warn('LoginService logout tetiklenirken hata oluştu:', err);
  }

  // 3. Mobil kalıcı hafızayı (Preferences) temizleyin ve yönlendirin
  // Bu işlem asenkron olduğu için bir 'async' sarmalayıcı veya IIFE kullanıyoruz:
  (async () => {
    await this.storageService.clearAuthenticationToken();
    
    // 4. Durumu sıfırlayıp login sayfasına kökten yönlendirin
    this.isLoggedIn = false;
    this.router.navigate(['/login'], { replaceUrl: true });
  })();
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
