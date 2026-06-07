import { AfterViewInit, Component, inject,  OnDestroy,  OnInit,  Signal,  ɵInputSignalNode} from '@angular/core';
import { FormsModule,} from '@angular/forms';
import { appCode, appVersion } from '../../../app/page';
import { OverlayEventDetail } from 'src/app/shared/typeahead/typeahead.component'; 
import { Langs } from '../lang';
 // 1. Üstteki eski @ionic/angular importunu tamamen silin veya şununla değiştirin:
import { 
  IonContent, 
  IonSegment, 
  IonSegmentButton, 
  IonLabel, 
  IonInput, 
  IonItem, 
  IonIcon, 
  IonSelect,
IonSelectOption,

  IonButton 
} from '@ionic/angular/standalone'; // 👈 'standalone' paketinden çekiyoruz
import { NavController } from '@ionic/angular/standalone';
import { MenuController } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular/standalone';
 
import { LoginService } from 'src/app/services/login-service';
import { LoginVM } from './login.model';
import { TranslationService } from 'src/app/services/translation-service';
import { TranslatePipe } from '../../services/TranslatePipe';
import { Account } from 'src/app/core/auth/account.model';
import { CommonModule } from '@angular/common';
import { AccountService } from 'src/app/core/auth/account.service';
import {   ModalController } from '@ionic/angular/standalone';

import { RegisterPage } from 'src/app/account/register/register.page';
import { StateStorageService } from 'src/app/core/auth/state-storage.service';
import { NgZone } from '@angular/core';
import { NgxTurnstileModule } from 'ngx-turnstile';
 

 

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
   CommonModule, 
    FormsModule, 
    NgxTurnstileModule,
    
    TranslatePipe,
    // 2. Buraya 'IonicModule' yerine kullandığımız bileşenleri tek tek ekliyoruz:
    IonContent, 
    IonSegment, 
    IonSegmentButton, 
    IonLabel, 
    IonInput, 
    IonItem, 
    IonIcon, 
    IonButton,
      IonSelect,
IonSelectOption,
  ]
})
export class LoginPage implements OnInit {


// 1. Değişkenlerinizi doğrudan tanımlandığı yerde başlatın:
langKey: string | null = 'fr';
loginType: 'email' | 'phone' = 'email'; // setTimeout kullanmayın
  appVersion = appVersion;
  identificationNumber = '';
 
  loginData = new LoginVM('', '', false, '', '', '', '');
  appCode = appCode;
  showPassword: boolean = false;
  
  incorrectAttempts: number = 0;
  languages = Langs;
  isButtonDisabled: boolean = false;
 
  myerror: string = '';
 
  private ts = inject(TranslationService);
  private navCtrl = inject(NavController);
  private loginService = inject(LoginService);
  private menuCtrl = inject(MenuController);
  private toastController = inject(ToastController);
  public loadingController = inject(LoadingController);
  public alertCtrl = inject(AlertController);
  private accountService = inject(AccountService);
  private modalCtrl = inject(ModalController);
  private storageService = inject(StateStorageService);
  private ngZone = inject(NgZone);
 
  account: Signal<Account | null> =
    this.accountService.trackCurrentAccount();

  constructor() {
    console.log('LoginPage constructor çalıştı');
    this.menuCtrl.enable(false);
  }  



ngOnInit() {
  console.log(' LoginPage ngOnInit çalıştı ');  
  // Signal değerini güvenli bir şekilde effect veya subscribe gibi izleyin ya da korumaya alın:
    try {
      const acc = this.account();
      if (acc) {
        this.langKey = acc.langKey ?? 'fr';
      }
    } catch (e) {
      console.warn('Account signal henüz hazır değil, varsayılan fr dili yükleniyor.');
    }
}
 

  kullanimSozlesmesi() {}

  // login.page.ts içindeki login fonksiyonunu bununla değiştirin:
login() {

  if(!this.captchaToken) {
    this.presentToast(0, 'top', this.ts.instant('CAPTCHA_REQUIRED'));
    return;
  }

  if (this.loginData.username && this.loginData.password) {
    const loginData = new LoginVM(
      this.loginData.username,
      this.loginData.password,
      false,
      '',
      '',
      '',
      this.captchaToken // Captcha token'ını Login modeline ekleyin 
    );

    this.loginService.login(loginData).subscribe({
      next: () => {
        console.log('Giriş başarılı, token hafızaya alındı. Kimlik doğrulanıyor...');
        
        // 🟢 UNUTULAN KRİTİK ADIM: Hafızaya yazılan token ile kullanıcının kimlik bilgisini JHipster'a işletiyoruz
        this.accountService.identity(true).subscribe({
          next: (account) => {
            if (account) {
              console.log('Kimlik başarıyla işlendi, ana sayfaya yönlendiriliyor:', account);
              this.navCtrl.navigateRoot('/home');
            } else {
              // Eğer identity null dönerse önlem olarak yine de home'a zorla
              this.navCtrl.navigateRoot('/home');
            }
          },
          error: (err) => {
            console.error('Identity alınırken hata oluştu, yine de ana sayfayı dene:', err);
            this.navCtrl.navigateRoot('/home');
          }
        });
      },
      error: async (error: any) => {
        let errorMessage = '';
        if (error == null) {
          errorMessage = this.ts.instant('NOT_CONNECT_SERVER');
        } else {
          if (error.status === 401) {
            errorMessage = this.ts.instant('user-bag-hata');
          } else if (error.status === 403) {
            errorMessage = this.ts.instant('NOT_ALLOWED');
          } else {
            errorMessage = this.ts.instant('NOT_CONNECT_SERVER');
          }
        }

        const alert = await this.alertCtrl.create({
          header: errorMessage,
          cssClass: 'custom-alert',
          buttons: ['OK'],
        });
        alert.present();
      },
    });
  } else {
    this.presentToast(
      0,
      'top',
      this.ts.instant('USER_PASSWORD_REQUIRED')
    );
  }
}
 

  changeLangue() {
    this.navCtrl.navigateRoot('/select-language');
  }
  
  showPasswords(input: any): any {
    input.type = input.type === 'password' ? 'text' : 'password';
  }

  forgotPassword() {}

  changeLanguege() {   
    this.storageService.storeLocale(this.langKey || 'en');
    this.ts.use(this.langKey||'fr');
    if (this.loginData.lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
    this.navCtrl.navigateRoot('/');
  }
  

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  forgetPassword() {}
 

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
    }
  }

  togglePassword() {

  }

  async presentToast(
    type: any,
    position: 'top' | 'middle' | 'bottom',
    mesaj: string
  ) {
    //type 1 success , 0   error

    if (type === 1) {
      const toast = await this.toastController.create({
        message: mesaj,
        duration: 2500,
        cssClass: 'custom-toast-success',
        icon: 'checkmark-done-outline',
        position: position,
      });
      await toast.present();
    } else {
      const toast0 = await this.toastController.create({
        message: mesaj,
        duration: 2500,
        cssClass: 'custom-toast-warning',
        icon: 'information-outline',
        position: position,
      });
      await toast0.present();
    }
  }

async register(){
   const modal = await this.modalCtrl.create({
    component:RegisterPage
   } );

   modal.present();

    const { data, role } = await modal.onWillDismiss();
     if (role === 'confirm') {
      //this.message = `Hello, ${data}!`;
    }

}
 
captchaToken: string | null = null;
captchaWidgetId: string | null = null;
captchaSiteKey: string = '0x4AAAAAADfkphPs1Nn3ATaI'; // Cloudflare Turnstile test anahtarı, kendi anahtarınızla değiştirin
isCaptchaRequired: boolean = false;
isCaptchaVisible: boolean = false;

// Doğrulama başarılı olduğunda tetiklenir
  onTurnstileResolved(token: string | null): void {
    debugger;
    this.captchaToken = token;
    console.log('Alınan Turnstile Token:', token);
  }

    // Token geçersiz olduğunda veya süresi dolduğunda tetiklenir
  onTurnstileError(): void {
     debugger;
    this.captchaToken = null;
    console.log('Turnstile doğrulama hatası oluştu.');
  }
 
  onSubmit(): void {
     debugger;
    if (!this.captchaToken) {
      alert('Lütfen bot doğrulamasını tamamlayın.');
      return;
    }
    // Token bilgisini backend servisinize gönderin
    console.log('Form backend\'e gönderiliyor, token:', this.captchaToken);
  }
}