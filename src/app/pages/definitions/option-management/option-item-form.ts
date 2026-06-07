import { Component, inject, Input, OnInit } from "@angular/core";
import {FormBuilder,Validators,ReactiveFormsModule} from '@angular/forms';
import {ModalController,ToastController,IonicModule} from '@ionic/angular';
import { TranslatePipe } from "src/app/services/TranslatePipe";
import { LanguageService } from "../language/language-service";
import { LanguageSelectorComponent } from "../language/language-selector.component";
 
 

@Component({
  selector: 'app-option-item-form',
  template: `
      <ion-header>
      <ion-toolbar>
        <ion-title>{{
          item ? ['edit_product' | translate] : ['new_product' | translate]
        }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()">
             <ion-icon name="close-circle"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="itemForm">
        <ion-item fill="outline">
          <ion-label position="stacked">Seçenek Adı (Örn: Kaşar Peyniri)</ion-label>
          <ion-input formControlName="name"></ion-input>
        </ion-item>

        <ion-item fill="outline" class="ion-margin-top">
          <ion-label position="stacked">Ek Fiyat</ion-label>
          <ion-input type="number" formControlName="additionalPrice"></ion-input>
        </ion-item>
          <!--dil-->
        <ion-item fill="outline" button (click)="selectLanguage()" class="ion-margin-top">
          <ion-label position="stacked">Dil</ion-label>
          <ion-input [value]="selectedLanguageName" readonly placeholder="Dil Seçin"></ion-input>
        </ion-item>

        <ion-list>
          <ion-item lines="none">
            <ion-label>Varsayılan Seçili Gelsin</ion-label>
            <ion-toggle formControlName="isDefault"></ion-toggle>
          </ion-item>
          <ion-item lines="none">
            <ion-label>Aktif</ion-label>
            <ion-toggle formControlName="isActive"></ion-toggle>
          </ion-item>
        </ion-list>

  <ion-item fill="outline">
          <ion-label position="stacked">{{
            'image_url' | translate
          }}</ion-label>
          <ion-input formControlName="imageUrl"></ion-input>
        </ion-item>
        <ion-button expand="block" (click)="save()">Seçeneği Ekle</ion-button>
      </form>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, TranslatePipe]
})
 
export class OptionItemFormComponent  implements OnInit{
  @Input() item:any;
  @Input() groupId:number=0;
  selectedLanguageName = '';
  //injec
  private modalCtrl = inject(ModalController);
  private languageService=inject(LanguageService);
  private toastc = inject(ToastController);

  itemForm = inject(FormBuilder).group({
    id: [null],
    name: [null, [Validators.required]],
    additionalPrice: [0],
    isActive: [true,[Validators.required]],
    isDefault: [false],
    optionGroup: [null,[Validators.required]],
    language: [null, [Validators.required]],
    imageUrl: [null, [Validators.required]],
  });

  ngOnInit() {
    if (this.item) {
      let lang=this.item.language;
      this.loadLanguage(lang.id) ;
      this.itemForm.patchValue(this.item);
    }else{
    this.itemForm.patchValue({ optionGroup: { id: this.groupId } as any });
 
    }


  }


  loadLanguage(id:number){
      this.languageService.find(id).subscribe({
        next:((res:any)=>{
          this.selectedLanguageName = res.body.tr;
          this.itemForm.patchValue({ language: { id: res.body.id } as any });
        }),
        error:((res:any)=>{
           this.showToast(res.detail,'bottom');
        })
      });
  }

    async selectLanguage() {
    const modal = await this.modalCtrl.create({ component: LanguageSelectorComponent });
    modal.onDidDismiss().then(res => {
      if (res.data) {
        this.selectedLanguageName = res.data.tr;
        this.itemForm.patchValue({ language: { id: res.data.id } as any });
      }
    });
    await modal.present();
  }

  save() { 
    
    this.modalCtrl.dismiss(this.itemForm.value); }

    async  showToast(msg:string,position:'top' | 'middle' | 'bottom'){
       const toast = await this.toastc.create({
      message: msg,
      duration: 2500,
      cssClass: 'custom-toast-success',
      icon: 'checkmark-done-outline',
      position: position,
    });
    await toast.present();

  }

    cancel() {
    this.modalCtrl.dismiss();
  }
}