import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonicModule, 
   NavController,
   ModalController } from '@ionic/angular';
import { TranslationService } from 'src/app/services/translation-service';
import { AccountService } from 'src/app/core/auth/account.service';
 import { NavParams } from '@ionic/angular';
@Component({
  selector: 'app-adrese-teslim',
  templateUrl: './adrese-teslim.page.html',
  styleUrls: ['./adrese-teslim.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Hata mesajını bastırır
})
export class AdreseTeslimPage implements OnInit {

  /*Eğer çok fazla veri gönderiyorsanız ve bunları bir servis aracılığıyla toplu almak isterseniz 
   NavParams kullanabilirsiniz.*/
   private navParams = inject(NavParams);
  // Gönderdiğiniz 'userName' anahtarı ile aynı isimde olmalı
 // @Input() userName: string="";
  
 private userName: string="";
   private ts = inject(TranslationService);
   private modalCtrl = inject(ModalController);
   // Servisi inject ediyoruz
  private accountService = inject(AccountService);
  
 // Aktif kullanıcıyı signal olarak alıyoruz
  readonly account = this.accountService.trackCurrentAccount();

  welcomeMessage(): string {
    const user =this.account();
    const selam = this.ts.instant('merhaba');
    const misafir = this.ts.instant('misafir');   
   return  this.userName ? `${selam} ${this.userName}!` : `${selam} ${misafir}!`;  
   
  }

  constructor() { 
     this.userName = this.navParams.get('userName');
    
  }

  ngOnInit() {
  }

  
selectType(arg0: string) {
   console.log('Seçilen teslimat tipi:', arg0); 
   if (arg0 === 'delivery') {    
     // Modal içinde kapatırken:
      this.modalCtrl.dismiss({
        type: 'delivery'
      });
      console.log('Adrese teslimat seçildi');
      
   } else if (arg0 === 'pickup') {    
     console.log('Ofis teslimatı seçildi');
   }  
}

}
