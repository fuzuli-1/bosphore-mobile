import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { NavController, ModalController, ToastController } from '@ionic/angular';
 
import * as iface from '../../interfaces/interfaces';
import { FooterService } from 'src/app/services/footer-service';
import { MenuService } from 'src/app/services/menu-service';
import { TranslationService } from 'src/app/services/translation-service';
import { TranslatePipe } from "../../services/TranslatePipe";
import { ProductService } from './product-service';
@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Hata mesajını bastırır
  providers: [
 
    FooterService,
    MenuService,
    // Diğer servisler...
  ],
})
export class ProductsPage implements OnInit {
filterByMenuGroupId() {
throw new Error('Method not implemented.');
}
  private service = inject(ProductService);
  private toastController = inject(ToastController);
  private translateService = inject(TranslationService);
  public menuGrups: iface.IMenuGroup[] = [];
  public subMenuItems: iface.IMenuGroupItem[] = [];
  selectedGroupId = 1;
  private navCtrl = inject(NavController);

  constructor() {}

  ngOnInit(): void {
   
  }

 

  openDetail(pizza: any) {
    this.navCtrl.navigateForward(`/pizza-detail/${pizza.id}`);
  }

  async presentToast(type: any, position: 'top' | 'middle' | 'bottom', mesaj: string) {
    //type 1 success , 0   error
    const toast = await this.toastController.create({
      message: mesaj,
      duration: 2500,
      cssClass: 'custom-toast-success',
      icon: 'checkmark-done-outline',
      position: position,
    });

    const toast0 = await this.toastController.create({
      message: mesaj,
      duration: 2500,
      cssClass: 'custom-toast-warning',
      icon: 'information-outline',
      position: position,
    });

    if (type === 1) {
      await toast.present();
    }
  }
}
