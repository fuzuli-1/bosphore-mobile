import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslationService } from 'src/app/services/translation-service';
import { AccountService } from 'src/app/core/auth/account.service';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { TranslatePipe } from '../../services/TranslatePipe';
import {NewAddress } from 'src/app/interfaces/interfaces';
import { AddressService } from '../address/address.service';

@Component({
  selector: 'app-adres-map-detail',
  templateUrl: './adres-map-detail.page.html',
  styleUrls: ['./adres-map-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Hata mesajını bastırır
})
export class AdresMapDetailPage implements OnInit {
  private ts = inject(TranslationService);
  private modalCtrl = inject(ModalController);
  private occount = inject(AccountService);
  private router = inject(Router);
  protected readonly addressService = inject(AddressService);
  private toastController = inject(ToastController);
   @Input() data: any={
    location: { lat: 0, lng: 0 },
    fullAddress: ''
  };
   
 address!: NewAddress;

  ngOnInit() {
    if (!this.address) {

      this.address = {
        id: null,
        title: '',
        description: '',
        latitude: null,
        longitude: null,
      };

      if(this.data){
        this.address.latitude = this.data['location'].lat;
        this.address.longitude = this.data['location'].lng;
        this.address.addressText = this.data['fullAddress'];
      }
    }
  }

  async saveAddress() {
    this.addressService.create(this.address).subscribe({
      next: (res) => {
        // Başarılıysa tüm modalları kapat ve ana sayfaya dön
        this.modalCtrl.dismiss(res, 'confirm');
        this.presentToast(1, 'top',this.ts.instant('ADDRESS_SAVED_SUCCESS') );
      },
      error: (err) =>{
        console.error('Hata:', err);
        this.presentToast(0, 'top', this.ts.instant('ADDRESS_SAVED_ERROR')+': ' + err.message);
      }  
    });
  }

  async presentToast(
    type: any,
    position: 'top' | 'middle' | 'bottom',
    mesaj: string,
  ) {
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

  close() {
    this.modalCtrl.dismiss();
  }
}
