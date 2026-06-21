import { Component, inject, Input, OnInit } from "@angular/core";
import {FormBuilder,Validators,ReactiveFormsModule, FormGroup} from '@angular/forms';
import {ModalController,ToastController,IonicModule} from '@ionic/angular';
import { TranslatePipe } from "src/app/services/TranslatePipe";
import { LanguageService } from "../language/language-service";
import { LanguageSelectorComponent } from "../language/language-selector.component";
import { OptionItemService } from "../../menu-extra/option-group-item/option-item-service";
 
 

@Component({
  selector: 'app-option-item-form',
  template: `
      <ion-header>
      <ion-toolbar>
        <ion-title>{{
          item ? ['EDIT' | translate] : ['NEW_RECORD' | translate]
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
          <ion-label position="stacked">{{'ADDITIONAL_PRICE'|translate}}</ion-label>
          <ion-input type="number" formControlName="additionalPrice"></ion-input>
        </ion-item>
          <!--dil-->
        <ion-item fill="outline" button (click)="selectLanguage()" class="ion-margin-top">
          <ion-label position="stacked">{{'LANGUAGE'|translate}}</ion-label>
          <ion-input [value]="selectedLanguageName" readonly placeholder="Dil Seçin"></ion-input>
        </ion-item>

        <ion-list>
          <ion-item lines="none">
            <ion-label>{{'DEFAULT_OPTION_SELECT'|translate}}</ion-label>
            <ion-toggle formControlName="isDefault"></ion-toggle>
          </ion-item>
          <ion-item lines="none">
            <ion-label>{{'ACTIVE'|translate}}</ion-label>
            <ion-toggle formControlName="isActive"></ion-toggle>
          </ion-item>
        </ion-list>
        <ion-item fill="outline">
          <ion-label position="stacked">{{ 'image_url' | translate }}</ion-label>
          <div style="display: flex; align-items: center; gap: 10px; width: 100%; padding-top: 8px;">
            <ion-input formControlName="imageUrl" placeholder=" {{ 'PLACEHOLDER_ICON_PATH' | translate }}" style="flex: 1;"></ion-input>
            
            <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" style="display: none;">
            <ion-button size="small" fill="solid" color="secondary" (click)="fileInput.click()">
              <ion-icon name="cloud-upload-outline" slot="start"></ion-icon>
              Yükle
            </ion-button>
          </div>
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
    private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private languageService=inject(LanguageService);
  private toastc = inject(ToastController);
  private service=inject(OptionItemService);
  itemForm!: FormGroup;


  ngOnInit() {
    this.initForm();
    
    if (this.item) {
      let lang=this.item.language;
      this.loadLanguage(lang.id) ;
      this.itemForm.patchValue(this.item);
    }else{
    this.itemForm.patchValue({ optionGroup: { id: this.groupId } as any });
 
    }


  }

    private initForm() {
 

      this.itemForm =  this.fb.group({
    id: [null],
    name: [null, [Validators.required]],
    additionalPrice: [0],
    isActive: [true,[Validators.required]],
    isDefault: [false],
    optionGroup: [null,[Validators.required]],
    language: [null, [Validators.required]],
    imageUrl: [null, [Validators.required]],
  });
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

     onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
  
      // Spring Boot'a yazdığımız endpoint'e gönderiyoruz
      this.service.uploadImage(formData).subscribe({
        next: (responsePath) => {
          // Gelen "/uploads/uuid.png" değerini formdaki imageUrl alanına set ediyoruz
          this.itemForm.patchValue({ imageUrl:responsePath  });
          console.log('Resim başarıyla yüklendi:', responsePath);
        },
        error: (err) => {
          console.error('Resim yüklenirken hata oluştu:', err); 
          // Burada kullanıcıya bir toast mesajı gösterebilirsin
        }
      });
    }
   
  }
}