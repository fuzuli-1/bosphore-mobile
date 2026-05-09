import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { OptionGroupType } from 'src/app/interfaces/interfaces';
import { LanguageSelectorComponent } from '../language/language-selector.component';

@Component({
  selector: 'app-option-group-form',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ optionGroup ? 'Grup Düzenle' : 'Yeni Seçenek Grubu' }}</ion-title>
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

        <ion-item fill="outline" button (click)="selectLanguage()" class="ion-margin-top">
          <ion-label position="stacked">Dil</ion-label>
          <ion-input [value]="selectedLanguageName" readonly placeholder="Dil Seçin"></ion-input>
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
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  optionGroup: any;
  selectedLanguageName = '';

  editForm = this.fb.group({
    id: [null],
    name: [null, [Validators.required]],
    type: ['STANDARD', [Validators.required]],
    minSelect: [0],
    maxSelect: [1],
    isActive: [true],
    requiredGroup: [false],
    product: [null, [Validators.required]], // Parent ürün ID'si
    language: [null, [Validators.required]]
  });

  ngOnInit() {
    if (this.optionGroup) {
      this.editForm.patchValue(this.optionGroup);
    }
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

  save() { this.modalCtrl.dismiss(this.editForm.value); }
}