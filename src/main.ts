// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,

  withInterceptors,

} from '@angular/common/http';
import { importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
 
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; 
import { provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  addOutline,
  airplaneOutline,
  arrowForwardOutline,
  basketOutline,
  bicycle,
  bicycleOutline,
  calendarOutline,
  callOutline,
  car,
  carOutline,
  cartOutline,
  cashOutline,
  chatbubbleEllipsesSharp,
  checkmark,
  checkmarkCircle,
  checkmarkDoneCircleOutline,
  chevronBack,
  chevronBackOutline,
  chevronDownCircleOutline,
  chevronForward,
  chevronForwardOutline,
  closeCircle,
  cloudOutline,
  cloudUploadOutline,
  createOutline,
  documentOutline,
  documentTextOutline,
  eye,
  eyeOff,
  fastFood,
  fastFoodOutline,
  flameOutline,
  folderOpenOutline,
  gridOutline,
  heart,
  heartOutline,
  help,
  helpCircleOutline,
  home,
  homeSharp,
  imagesOutline,
  informationCircleOutline,
  informationOutline,
  key,
  keyOutline,
  languageOutline,
  listOutline,
  locate,
  locateOutline,
  locateSharp,
  locationOutline,
  lockClosed,
  mailOutline,
  menu,
  menuOutline,
  notifications,
  pencilOutline,
  peopleOutline,
  personAddOutline,
  personCircleOutline,
  personOutline,
  pricetagOutline,
  printOutline,
  receiptOutline,
  receiptSharp,
  refresh,
  refreshCircleOutline,
  refreshOutline,
  remove,
  removeCircleOutline,
  removeOutline,
  restaurantOutline,
  saveOutline,
  searchOutline,
  settingsOutline,
  storefrontOutline,
  timeOutline,
  trashOutline,
  walkOutline,
  
} from 'ionicons/icons';
 
import { TokenInterceptor } from './app/interceptors/token.interceptor.ts';
 // main.ts
import { register } from 'swiper/element/bundle';

import { getAuth, provideAuth } from '@angular/fire/auth';

import { TranslateModule} from '@ngx-translate/core';
register();

 
 

// İkonları ekleyin
addIcons({
  'chevron-down-circle-outline': chevronDownCircleOutline,
  'arrow-back-outline': arrowForwardOutline,
  'folder-outline': folderOpenOutline,
  'refresh-outline': refreshOutline,
  'people-outline': peopleOutline,
  'arrow-forward-outline': arrowForwardOutline,
  'mail-outline': mailOutline,
  'lock-closed': lockClosed,
  "eye": eye,
  'checkmark-done-outline': checkmarkDoneCircleOutline,
  'information-outline': informationOutline,
  'storefront-outline': storefrontOutline,
  'person-circle-outline': personCircleOutline,
  'key-outline': keyOutline,
  'refresh-circle-outline': refreshCircleOutline,
  'cloud-upload-outline': cloudUploadOutline,
  'cloud-outline': cloudOutline,
  'document-text-outline': documentTextOutline,
  'documents-outline': documentOutline,
  'folder-open-outline': folderOpenOutline,
  'help-circle-outline': helpCircleOutline,
  'home-outline': home,
  'list-outline': listOutline,
  'menu-outline': menuOutline,
  "notifications": notifications,
  'chatbubble-ellipses-sharp': chatbubbleEllipsesSharp,
  'person-add-outline': personAddOutline,
  'images-outline': imagesOutline,
  'settings-outline': settingsOutline,
  'airplane-outline': airplaneOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'chevron-back-outline': chevronBackOutline,
  "search-outline": searchOutline,
  'cart-outline':cartOutline,
  "person-outline":personOutline,
  'location-outline':locationOutline,
  'remove-outline':removeOutline,
  "add-outline":addOutline,
  'chevron-forward':chevronForward,
  'chevron-back':chevronBack,
  'information-circle-outline':informationCircleOutline,
  'close-circle':closeCircle,
  'trash-outline':trashOutline,
  'pencil-outline':pencilOutline,
  'bicycle-outline':bicycleOutline,
  'locate-outline': locateOutline,
  'information-circle': informationCircleOutline,
  'globe-outline': cloudOutline,
  'card-outline': documentOutline,
  'cash-outline': cashOutline,
  'bicycle': bicycle,
  'checkmark-circle':checkmarkCircle,
  'receipt': 'receipt',
  'home-sharp':homeSharp,
  'receipt-sharp': receiptSharp,
  'location-sharp': locateSharp,
  'restaurant-sharp': 'restaurant-sharp',
  'receipt-outline':receiptOutline,
  'restaurant-outline': restaurantOutline,
  'fast-food-outline': fastFoodOutline, 
  'print-outline': printOutline,
  'grid-outline':gridOutline,
  'add-circle-outline':addCircleOutline, 
  'grid-outline-outline':gridOutline,
  'star': 'star',
  'star-outline': 'star-outline',
  'help': help, 
  'search': searchOutline,
  'settings': settingsOutline,
  'home': home,
  'create-outline':createOutline,
  'language-outline':languageOutline,
  'heart-outline':heartOutline,
  'remove':remove,
  'heart':heart,
  'time-outline':timeOutline,
  'flame-outline':flameOutline,
  'checkmark':checkmark,
  'remove-circle-outline':removeCircleOutline,
  'walk-outline':walkOutline,
  'calendar-outline':calendarOutline,
  'pricetag-outline':pricetagOutline,
  'location':locationOutline,
  'car-outline':carOutline,
  'call-outline':callOutline,
  'basket-outline':basketOutline,
  'save-outline':saveOutline,
  'eye-off':eyeOff
});

import { firstValueFrom, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslationService } from './app/services/translation-service';
import { add } from 'ngx-bootstrap/chronos';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { appConfig } from './app/app.config';
import { StateStorageService } from './app/core/auth/state-storage.service';
import { ApplicationConfigService } from './app/core/config/application-config.service';
import { GeneralSettings } from './app/page';
 // ... diğer importlar aynı kalsın ...
import { APP_INITIALIZER } from '@angular/core';
import { AccountService } from './app/core/auth/account.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideIonicAngular({ mode: 'md' }),
    provideHttpClient(withInterceptors([TokenInterceptor])),
    importProvidersFrom(TranslateModule.forRoot()),
    provideZoneChangeDetection(),
    provideAuth(() => getAuth()),

    // APP_INITIALIZER ekleyerek uygulamanın dil dosyası yüklenene kadar açılmasını engelleyin:
 // APP_INITIALIZER
{
  provide: APP_INITIALIZER,
  useFactory: (
    ts: TranslationService,
    storageService: StateStorageService,
    configService: ApplicationConfigService,
    accountService: AccountService  // ✅ ekle
  ) => {
    return async () => {
      console.log('Uygulama başlatılıyor...');

      // 1. URL ayarla
      configService.setEndpointPrefix(GeneralSettings.url);

      // 2. Kalıcı storage'dan token'ı web hafızasına eşitle
      await storageService.getAuthenticationTokenMobile();

      // 3. Token varsa kimliği bir kez fetch et → cache'e al
      const token = storageService.getAuthenticationToken();
      if (token) {
        await firstValueFrom(
          accountService.identity(true).pipe(catchError(() => of(null)))
        );
        console.log('✅ Kimlik cache\'e alındı');
      }

      // 4. Dil yükle
      const locale = storageService.getLocale() || 'fr';
      await ts.use(locale);

      console.log('✅ Uygulama hazır');
    };
  },
  deps: [TranslationService, StateStorageService, ApplicationConfigService, AccountService],  // ✅ ekle
  multi: true
}
  ],
}).catch(err => { 
  console.error('Bootstrap Hatası:', err);
});
 
 