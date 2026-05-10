import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController,ToastController, IonicModule } from '@ionic/angular';
import { OptionGroupType } from 'src/app/interfaces/interfaces';
import { LanguageSelectorComponent } from '../language/language-selector.component';
import { ProductSelectorComponent } from '../products/product-selector';
import { LanguageService } from '../language/language-service';
import { ProductService } from '../products/product-service';

@Component({
  selector: 'app-option-group-form',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
 
        <ion-title>{{ optionGroup ? 'Grup Düzenle' : 'Yeni Seçenek Grubu' }}</ion-title>
        <ion-buttons slot="end">
          <ion-icon ></ion-icon>
          <ion-button  (click)="closeForm()">
             <ion-icon name="close-circle" slot="start"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="editForm">
        <ion-item fill="outline" class="ion-margin-bottom">
          <ion-label position="stacked">Grup Adı</ion-label>
          <ion-input formControlName="name" placeholder="Örn: Ekstra Malzemeler"></ion-input>
        </ion-item>

        <ion-item fill="outline" class="ion-margin-bottom">
          <ion-label position="stacked">Grup Tipi</ion-label>
          <ion-select formControlName="type" placeholder="Tip Seçin">
            <ion-select-option value="STANDARD">Standard (Ücretsiz)</ion-select-option>
            <ion-select-option value="EXTRA">Extra (Ücretli)</ion-select-option>
            <ion-select-option value="REQUIRED">Required (Zorunlu)</ion-select-option>
            <ion-select-option value="EXCLUSIVE">Exclusive (Tek Seçim)</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-grid>
          <ion-row>
            <ion-col size="6">
              <ion-item fill="outline">
                <ion-label position="stacked">Min Seçim</ion-label>
                <ion-input type="number" formControlName="minSelect"></ion-input>
              </ion-item>
            </ion-col>
            <ion-col size="6">
              <ion-item fill="outline">
                <ion-label position="stacked">Max Seçim</ion-label>
                <ion-input type="number" formControlName="maxSelect"></ion-input>
              </ion-item>
            </ion-col>
          </ion-row>
        </ion-grid>   
        <ion-item> 
          <ion-label position="stacked">Aktif:</ion-label>
           <ion-select  formControlName="isActive">
            <ion-select-option value="true" [value]="true">Evet</ion-select-option>
            <ion-select-option value="false">Hayir</ion-select-option>         
          </ion-select>
        </ion-item>

         <ion-item>
           <ion-label position="stacked">Ürün Seçiminde Zorunlu:</ion-label>
           <ion-select  formControlName="requiredGroup">
            <ion-select-option value="true" [value]="true">Zorunlu</ion-select-option>
            <ion-select-option value="false">Secimli</ion-select-option>         
          </ion-select>
        </ion-item>

        <ion-item fill="outline" button (click)="selectLanguage()" class="ion-margin-top">
          <ion-label position="stacked">Dil</ion-label>
          <ion-input [value]="selectedLanguageName" readonly placeholder="Dil Seçin"></ion-input>
        </ion-item>

        
        <ion-item fill="outline" button (click)="selectProduct()" class="ion-margin-top">
          <ion-label position="stacked">Ürün Seç</ion-label>
          <ion-input [value]="selectedProductName" readonly placeholder="Ürün Seçin"></ion-input>
        </ion-item>

        <ion-button expand="block" (click)="save()" [disabled]="editForm.invalid" class="ion-margin-top">
          Kaydet
        </ion-button>
      </form>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule]
})
export class OptionGroupFormComponent implements OnInit {


  isLoading = true; 
   @Input() optionGroup: any;
   selectedLanguageName = '';
   selectedProductName = '';

  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private languageService=inject(LanguageService);
  private toastc = inject(ToastController);
  protected   productService = inject(ProductService);

  editForm = this.fb.group({
    id: [null],
    name: [null, [Validators.required]],
    type: ['STANDARD', [Validators.required]],
    minSelect: [0],
    maxSelect: [1],
    isActive: [true,[Validators.required]],
    requiredGroup: [true,[Validators.required]],
    product: [null, [Validators.required]], // Parent ürün ID'si
    language: [null, [Validators.required]]
  });

  ngOnInit() {
    if (this.optionGroup) {
      let lang=this.optionGroup.language;
      let p=this.optionGroup.product;
      this.loadLanguage(lang.id);
      this.loadProduct(p.id);
      this.editForm.patchValue(this.optionGroup);
    }
  }

  loadLanguage(id:number){
      this.languageService.find(id).subscribe({
        next:((res:any)=>{
          this.selectedLanguageName = res.body.tr;
          this.editForm.patchValue({ language: { id: res.body.id } as any });
        }),
        error:((res:any)=>{
           this.showToast(res.detail,'bottom');
        })
      });
  }

    private loadProduct(id: any): void {
      this.isLoading = true;
  
      this.productService.find(id).subscribe({
        next: (res:any) => {
          this.isLoading = false;
          this.selectedProductName = res.body.name;
          this.editForm.patchValue({ product: { id: res.body?.id } as any });
          
        },
        error: () => {
          this.isLoading = false;
        },
      });
    } 

  async selectLanguage() {
    const modal = await this.modalCtrl.create({ component: LanguageSelectorComponent });
    modal.onDidDismiss().then(res => {
      if (res.data) {
        this.selectedLanguageName = res.data.tr;
        this.editForm.patchValue({ language: { id: res.data.id } as any });
      }
    });
    await modal.present();
  }

  async selectProduct(){
    const modal=await this.modalCtrl.create({
      component:ProductSelectorComponent
      
    });

    modal.onDidDismiss().then(res=>{
      if(res.data){
        this.selectedProductName=res.data.name;
        this.editForm.patchValue({ product: { id: res.data.id } as any });
      }
    });
   await modal.present();

  }

  save() { this.modalCtrl.dismiss(this.editForm.value); }

 closeForm() {
    this.modalCtrl.dismiss();
}

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
}