import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ICategory, ILanguage, IMenuGroupItem } from 'src/app/interfaces/interfaces';
import { CategoryService } from '../category/category-service';
 
import { icon } from 'leaflet';
import { TranslatePipe } from 'src/app/services/TranslatePipe';
import { LanguageService } from '../language/language-service';
import { LanguageSelectorComponent } from '../language/language-selector.component';
 
 
 
@Component({
  selector: 'app-item-form',
  template: `
    <ion-header>
      <ion-toolbar color="secondary">
        <ion-title>{{ item ? 'Item Düzenle' : 'Yeni Item Ekle' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()"> {{ 'CLOSE' | translate }}</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="itemForm">
        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="stacked">{{ 'LABEL' | translate }}</ion-label>
          <ion-input formControlName="label" placeholder=" {{ 'PLACEHOLDER_LABEL' | translate }}"></ion-input>
        </ion-item>
        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="stacked">{{ 'ICON_PATH' | translate }}</ion-label>
          <ion-input formControlName="iconPath" placeholder=" {{ 'PLACEHOLDER_ICON_PATH' | translate }}"></ion-input>
        </ion-item>
 
        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="stacked">{{ 'LANGUAGE' | translate }}</ion-label>
          <ion-input formControlName="languageId" placeholder=" {{ 'PLACEHOLDER_LANGUAGE' | translate }}"></ion-input>
          <ion-button (click)="loadLanguages()"> {{ 'SELECT_LANGUAGE' | translate }} </ion-button>
        </ion-item>

        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="stacked">{{ 'ORDER_NUMBER' | translate }}</ion-label>
          <ion-input type="number" formControlName="orderNo"></ion-input>
        </ion-item>

        <ion-button expand="block" color="secondary" (click)="save()" [disabled]="!itemForm.valid">
          {{ item ? 'Güncelle' : 'Ekle' }}
        </ion-button>
      </form>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class ItemFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private categoryService=inject(CategoryService);
  private langService=inject(LanguageService);

  item: IMenuGroupItem | null = null;
  menuGroupId!: number; // Üst grubun ID'si
  dbCategories: ICategory[] = []; // Java'dan çektiğin gerçek ürün kategorileri
  language=signal<ILanguage>({} as ILanguage);
  itemForm!: FormGroup;
 

  ngOnInit() {
    this.initForm();
    this.language().id
    //this.loadLanguages();  
  }

   async loadLanguages() {
        // Dil seçici modalini açmak için gerekli kodu buraya ekleyin
        // Örneğin: this.languageModal.present();
      const  modal= await this.modalCtrl.create({
            component: LanguageSelectorComponent,
            cssClass: 'my-custom-modal-css'
        });
        await modal.present();
        const { data } = await modal.onWillDismiss();
        if (data) {

            this.language.set(data);
            this.itemForm.patchValue({ languageId: data.id });
        }
    }



  private initForm() {
    this.itemForm = this.fb.group({
      id: [this.item?.id || null],
      label: [this.item?.label || '', [Validators.required]],
      iconPath: [this.item?.iconPath || null],
      orderNo: [this.item?.orderNo || 0],      
      menuGroupId: [this.menuGroupId, [Validators.required]],
      languageId: [this.language().id||this.item?.language?.id,[Validators.required]] //
    });
  }



  save() { this.modalCtrl.dismiss(this.itemForm.value); }
  cancel() { this.modalCtrl.dismiss(); }

 

}