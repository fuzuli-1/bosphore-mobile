import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  HttpClient,
  HTTP_INTERCEPTORS,
  withInterceptors,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
 
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; 
import { provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  airplaneOutline,
  arrowForwardOutline,
  chatbubbleEllipsesSharp,
  checkmarkDoneCircleOutline,
  cloudOutline,
  cloudUploadOutline,
  documentOutline,
  documentTextOutline,
  eye,
  folderOpenOutline,
  help,
  helpCircleOutline,
  home,
  imagesOutline,
  informationOutline,
  key,
  keyOutline,
  listOutline,
  lockClosed,
  mailOutline,
  menu,
  menuOutline,
  notifications,
  personAddOutline,
  personCircleOutline,
  refresh,
  refreshCircleOutline,
  settingsOutline,
  storefrontOutline,
} from 'ionicons/icons';
 
import { TokenInterceptor } from './app/interceptors/token.interceptor.ts';
 // main.ts
import { register } from 'swiper/element/bundle';

register();

 

// İkonları ekleyin
addIcons({
  'arrow-forward-outline': arrowForwardOutline,
  'mail-outline': mailOutline,
  'lock-closed': lockClosed,
  eye: eye,
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
  notifications: notifications,
  'chatbubble-ellipses-sharp': chatbubbleEllipsesSharp,
  'person-add-outline': personAddOutline,
  'images-outline': imagesOutline,
  'settings-outline': settingsOutline,
  'airplane-outline': airplaneOutline,
  'chevron-forward-outline': arrowForwardOutline,
  'chevron-back-outline': arrowForwardOutline,
});

import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslationService } from './app/services/translation-service';
bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(), // ServiceManager'ı providers'a ekleyin
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([TokenInterceptor]), // 🔥 interceptor burada devreye girer
    ),
    provideIonicAngular({
      mode: 'md', // opsiyonel: Ionic varsayılanı (ios/md) ayarlayabilirsin
      rippleEffect: true, // opsiyonel: Material ripple efekti
    }), 
  ],
}).then(app => {
  const ts = app.injector.get(TranslationService);
  return  ts.use('tr'); // uygulama başlamadan çevirileri yükle
}).catch(err => {
  debugger;
  console.error(err);
});


/*

.then(app => {
  const ts = app.injector.get(TranslationService);
  return ts.load('tr'); // uygulama başlamadan çevirileri yükle
});

// Custom Translate Loader
class CustomTranslateLoader implements TranslateLoader {
  constructor(
    private http: HttpClient,
    private service: ServiceManager,
  ) {}

  getTranslation(lang: string): Observable<any> {
    const languageCode = lang || 'en';
    console.log('Servise erişim ile dosya çekildi');

    return this.service.getTranslation(languageCode).pipe(
      catchError(error => {
        console.error('Servise erişimde hata oluştu:', error);
        console.log('Yerel çeviri dosyasından yükleniyor...');
        return this.loadLocalTranslation(languageCode);
      }),
    );
  }

  // Yerel çeviri dosyasını yüklemek için bir yardımcı fonksiyon
  private loadLocalTranslation(languageCode: string): Observable<any> {
    // Yerel çeviri dosyasının yolu
    console.log('Yerel çeviri loadLocalTranslation yükleniyor...');
    const localTranslationPath = `assets/i18n/${languageCode}.json`;
    console.log(localTranslationPath);

    // Yerel çeviri dosyasını yükle
    return this.http.get(localTranslationPath).pipe(
      catchError(error => {
        console.error('Yerel çeviri dosyası yüklenirken hata oluştu:', error);
        // Hata durumunda boş bir Observable döndürülebilir veya başka bir şey yapılabilir
        return of({});
      }),
    );
  }
}

export function HttpLoaderFactory(http: HttpClient, service: ServiceManager): TranslateLoader {
  return new CustomTranslateLoader(http, service);
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),ServiceManager, // ServiceManager'ı providers'a ekleyin
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([TokenInterceptor]), // 🔥 interceptor burada devreye girer
    ),
    provideIonicAngular({
      mode: 'md', // opsiyonel: Ionic varsayılanı (ios/md) ayarlayabilirsin
      rippleEffect: true, // opsiyonel: Material ripple efekti
    }),

    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient, ServiceManager], // ServiceManager'ı deps array'ine ekleyin
        },
      }),
    ),
  ],
}).catch(err => {
  debugger;
  console.error(err);
});*/
