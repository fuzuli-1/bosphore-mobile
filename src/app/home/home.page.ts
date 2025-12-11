import { IonApp } from '@ionic/angular/standalone';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
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
import { CategorySwiperComponent } from '../pages/category-swiper-component/category-swiper-component.component';
import { AccountService } from '../core/auth/account.service';
import { MenuGroupsPage } from '../pages/menu-groups/menu-groups.page';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CategorySwiperComponent, MenuGroupsPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Hata mesajını bastırır
  providers: [
    FooterService,
    MenuService,
    // Diğer servisler...
  ],
})
export class HomePage implements OnInit, AfterViewInit {
  private translateService = inject(TranslationService);

  private footerService = inject(FooterService);
  private loadingCtrl = inject(LoadingService);
  private router = inject(Router);
  private activeRoute = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private sanitizer = inject(DomSanitizer);

  private modalCtrl = inject(ModalController);

  private toastController = inject(ToastController);
  private menuService = inject(MenuService);
  private http = inject(HttpClient);
  private account = inject(AccountService);

  constructor(private translate: TranslationService) {
    this.translate.addLangs(['en', 'tr']); // hangi dillerin olduğunu bildir
    this.translate.setFallbackLang('tr'); // fallback dil
    this.translate.use('tr'); // aktif olarak kullanılacak dil
  }

  selectedSegment: number = 0;
  languages = Langs;
  products: iface.IProduct[] = [];
  subGroups: iface.IMenuGroupItem[] = [];

  selectedGroupId: number = 0;

  ngOnInit() {
    if (this.account.isAuthenticated()) {
      this.initAfterLogin();
    }
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

  onSelectedGroupChange(id: number) {
    this.selectedGroupId = id;
  }

  selectSubGroup(item: iface.IMenuGroupItem) {
    if (item.targetCategoryId != undefined) {
      // this.loadProducts(item.targetCategoryId);
    }
  }

  /* loadProducts(targetCategoryId: number) {
    let params = {
      page: 0,
      size: 20,
      sort: 'orderNo,asc',
    };
    this.service.products.list(params).subscribe({
      next: (res: any) => {
        this.products = res;
      },
      error: (err: any) => {
        this.presentToast(0, 'top', this.translateService.instant('ERROR.INTERNAL_SERVER_ERROR'));
      },
    });

  }*/

  /* getAvatar() {
    if (account.token != undefined && account.token.length > 0) {
      let id = account.id != undefined ? account.id : -1;
      if (id != -1)
        this.service.getAvatar(id.toString()).subscribe((res: any) => {
          if (res.length > 0 && res[0].document !== null) {
            let doc = res[0].document;
            this.footerService.setAvatar({ mydoc: String(doc) });
          } else {
            this.account_.img = '../../../assets/img/avatar.png';
            //this.footerService.setAvatar({ mydoc: null });
          }
        });
    }
  }*/

  ngAfterViewInit() {
    let x = 0;
  }
}
