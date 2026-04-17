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
  addCircleOutline,
  addOutline,
  airplaneOutline,
  arrowForwardOutline,
  bicycle,
  bicycleOutline,
  cartOutline,
  cashOutline,
  chatbubbleEllipsesSharp,
  checkmarkCircle,
  checkmarkDoneCircleOutline,
  chevronBack,
  chevronForward,
  closeCircle,
  cloudOutline,
  cloudUploadOutline,
  documentOutline,
  documentTextOutline,
  eye,
  fastFood,
  fastFoodOutline,
  folderOpenOutline,
  gridOutline,
  help,
  helpCircleOutline,
  home,
  homeSharp,
  imagesOutline,
  informationCircleOutline,
  informationOutline,
  key,
  keyOutline,
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
  personAddOutline,
  personCircleOutline,
  personOutline,
  printOutline,
  receiptOutline,
  receiptSharp,
  refresh,
  refreshCircleOutline,
  refreshOutline,
  remove,
  removeOutline,
  restaurantOutline,
  searchOutline,
  settingsOutline,
  storefrontOutline,
  trashOutline,
  
} from 'ionicons/icons';
 
import { TokenInterceptor } from './app/interceptors/token.interceptor.ts';
 // main.ts
import { register } from 'swiper/element/bundle';
import { initializeApp } from 'firebase/app';
import { provideFirebaseApp, initializeApp as initializeApp_alias } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from './environments/environment';

register();

 
 

// İkonları ekleyin
addIcons({
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
  'chevron-forward-outline': arrowForwardOutline,
  'chevron-back-outline': arrowForwardOutline,
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
  'refresh-outline': refreshOutline,
  'print-outline': printOutline,
  'grid-outline':gridOutline,
  'add-circle-outline':addCircleOutline,
  'add':addCircleOutline,
  'grid-outline-outline':gridOutline
});

import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslationService } from './app/services/translation-service';
import { add } from 'ngx-bootstrap/chronos';
 // ... diğer importlar aynı kalsın ...

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(), 
    provideRouter(routes),
    provideIonicAngular({
      mode: 'md',
      rippleEffect: true,
    }), 
    // 🔥 DOĞRU YÖNTEM BURASI: Angular Fire'ın kendi başlatıcısı
    provideFirebaseApp(() => initializeApp(environment.firebase)), 
    provideAuth(() => getAuth()),
    
    provideHttpClient(
      withInterceptors([TokenInterceptor]),
    )/*, 
    provideFirebaseApp(() => initializeApp({ 
      projectId: "bosphore-app", 
      appId: "1:131341859706:web:197f24060604d0be12b4c3", 
      storageBucket: "bosphore-app.firebasestorage.app", 
      apiKey: "AIzaSyAs9Vqi6uXGsqakomYiyqK--EdoLiG5zHk", 
      authDomain: "bosphore-app.firebaseapp.com", 
      messagingSenderId: "131341859706", measurementId: "G-DDP31R4CQR", 
      
        })), provideAuth(() => getAuth()),/**/
  ],
}).then(app => {
  
  const ts = app.injector.get(TranslationService);
   return ts.use('tr');
}).catch(err => {
 
  console.error('Bootstrap Hatası:', err);
});

 