import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, ViewChild } from '@angular/core';

import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonCol,
  IonModal,
  IonButtons,
  IonRow,
  IonButton,
  IonIcon,
  IonImg,
  IonFooter,
  IonText,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
} from '@ionic/angular/standalone';
import {  appCode, appVersion } from '../../../app/page';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { OverlayEventDetail } from 'src/app/shared/typeahead/typeahead.component';
import { decodeToken } from 'src/app/shared/token';
import { Langs } from '../lang';

import { AlertController, LoadingController, NavController, MenuController, ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { FooterService } from 'src/app/services/footer-service';

import { AppComponent } from 'src/app/app.component';

import { MenuService } from 'src/app/services/menu-service';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from 'src/app/services/loading-service';
 
import { HomePage } from '../../home/home.page';
import { jwtDecode } from "jwt-decode";
import { AppJwtPayload } from 'src/app/interfaces/interfaces';
import { LoginService } from 'src/app/services/login-service';
import { Login } from './login.model';
import { TranslationService } from 'src/app/services/translation-service';
import { TranslatePipe } from "../../services/TranslatePipe";
import { Account } from 'src/app/core/auth/account.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonCheckbox, FormsModule, IonButton, IonRow, IonContent, IonFooter, IonText, IonGrid, IonCol,
    IonSelect, IonSelectOption, IonIcon, IonInput, TranslatePipe],
})
export class LoginPage implements OnInit {
  appVersion = appVersion;
  identificationNumber = ''; 
  @ViewChild(IonModal) modal?: IonModal;
  loginData = new Login('', '', false);
  appCode = appCode;
  showPassword: boolean = false;
  isCaptchaRequired: boolean = false;
  incorrectAttempts: number = 0;
  languages = Langs;
  isButtonDisabled: boolean = false;

  @ViewChild('modall', { static: true }) modall!: IonModal;
  myerror: string = '';
 


  private translateService = inject(TranslationService);

  private footerService = inject(FooterService);
  private loadingCtrl = inject(LoadingService);
  private router = inject(Router);
  private activeRoute = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private sanitizer = inject(DomSanitizer);

  private loginService = inject(LoginService);
  //private modalCtrl = inject(ModalController);
  private menuCtrl = inject(MenuController);
  private toastController = inject(ToastController);
  private menuService = inject(MenuService);
  private http = inject(HttpClient);
  public loadingController = inject(LoadingController);
  public alertCtrl = inject(AlertController);

  constructor() {
    this.menuCtrl.enable(false);
  }

  ngOnInit() {  }
 
  kullanimSozlesmesi() {}
 
  login() {
   
    if (this.loginData.username && this.loginData.password) {
      const loginData = new Login(this.loginData.username, this.loginData.password, false);
 

      this.loginService.login(loginData).subscribe({
        next: (res: any) => {
          console.log(this.router.config);
          this.navCtrl.navigateRoot('/home').then(r => console.log('NAV RESULT:', r));
          this.navCtrl.navigateRoot('/home'); 
        },
        error: async (error: any) => {
          let alert = this.alertCtrl.create({
            header: error.error.error ? error.error.error : this.translateService.instant('ERROR.NOT_CONNECT_SERVER'),
            cssClass: 'custom-alert',
            buttons: [
              {
                text: 'OK',
                cssClass: 'alert-button-cancel',
                handler: () => {},
              },
            ],
          });
          (await alert).present();
        },
      }); 
    } else {
      this.presentToast(0, 'top', this.translateService.instant('ERROR.USERPASS'));
    } 
  }  

  async presentToast(type: any, position: 'top' | 'middle' | 'bottom', mesaj: string) {
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

  changeLangue() {
    this.navCtrl.navigateRoot('/select-language');
  }
  showPasswords(input: any): any {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
  forgotPassword() {}

  changeLanguege() {
    let lang = this.loginData.lang ? this.loginData.lang : 'en';
    this.translateService
    this.translateService.use(lang); 
    if (this.loginData.lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
    this.navCtrl.navigateRoot('/');
  }

  changeLangue22() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        type: 2,
      },
    };
    this.navCtrl.navigateRoot('/select-language', navigationExtras);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  forgetPassword() {}

  changeLangue2() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        type: 2,
      },
    };
    this.navCtrl.navigateRoot('/select-lang', navigationExtras);
  }

  cancel() {
    if (this.modal?.isCmpOpen) {
      this.modal?.dismiss(null, 'cancel');
    }
  }

  confirm() {
    this.modal?.dismiss(this.myerror, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
    }
  }

  ionViewDidEnter() {
    this.modal?.dismiss();
  }
}
