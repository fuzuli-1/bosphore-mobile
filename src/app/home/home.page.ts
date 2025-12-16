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
import { CategorySwiperComponent } from '../pages/menu-group-item/menu-group-item.page';
import { AccountService } from '../core/auth/account.service';
import { MenuGroupsPage } from '../pages/menu-groups/menu-groups.page';
import { ProductsPage } from "../pages/products/products.page";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CategorySwiperComponent, MenuGroupsPage, ProductsPage],
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

  }

  selectedSegment: number = 0;
  languages = Langs;
  products: iface.IProduct[] = [];
  subGroups: iface.IMenuGroupItem[] = [];

  selectedGroupId: number = 0;
  selectedGroupItemId: number = 0;

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

  onSelectedGroupItemChange(item:iface.IMenuGroupItem) {
      this.selectedGroupItemId=item.id;
  }

 

 
 

  ngAfterViewInit() {
    let x = 0;
  }
}
