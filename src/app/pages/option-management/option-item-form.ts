import { Component, inject } from "@angular/core";
import {FormBuilder,Validators,ReactiveFormsModule} from '@angular/forms';
import {ModalController,IonicModule} from '@ionic/angular';
import {LanguageSelectorComponent} from '../language/language-selector.component';

@Component({
  selector: 'app-option-item-form',
  template: `
    <ion-content class="ion-padding">
      <form [formGroup]="itemForm">
        <ion-item fill="outline">
          <ion-label position="stacked">Seçenek Adı (Örn: Kaşar Peyniri)</ion-label>
          <ion-input formControlName="name"></ion-input>
        </ion-item>

        <ion-item fill="outline" class="ion-margin-top">
          <ion-label position="stacked">Ek Fiyat (₺)</ion-label>
          <ion-input type="number" formControlName="additionalPrice"></ion-input>
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

        <ion-button expand="block" (click)="save()">Seçeneği Ekle</ion-button>
      </form>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule]
})
export class OptionItemFormComponent {
  private modalCtrl = inject(ModalController);
  itemForm = inject(FormBuilder).group({
    id: [null],
    name: [null, [Validators.required]],
    additionalPrice: [0],
    isActive: [true],
    isDefault: [false],
    optionGroup: [null],
    language: [null]
  });

  save() { this.modalCtrl.dismiss(this.itemForm.value); }
}