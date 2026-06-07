import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { LanguageService } from './language-service';
import { ILanguage } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-language-form',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ language ? 'Düzenle' : 'Yeni Kayıt' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()">Kapat</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="editForm">
        <ion-item fill="outline" class="ion-margin-bottom">
          <ion-label position="stacked">Çeviri Kodu (translate_code)</ion-label>
          <ion-input formControlName="translateCode"></ion-input>
        </ion-item>
        
        <ion-grid>
          <ion-row>
            <ion-col size="6">
              <ion-item fill="outline"><ion-label position="stacked">TR</ion-label><ion-input formControlName="tr"></ion-input></ion-item>
            </ion-col>
            <ion-col size="6">
              <ion-item fill="outline"><ion-label position="stacked">EN</ion-label><ion-input formControlName="en"></ion-input></ion-item>
            </ion-col>
            <ion-col size="6">
              <ion-item fill="outline"><ion-label position="stacked">FR</ion-label><ion-input formControlName="fr"></ion-input></ion-item>
            </ion-col>            
            <ion-col size="6">
              <ion-item fill="outline">
                <ion-label position="stacked">Aktif</ion-label>
                <ion-toggle formControlName="isActive"></ion-toggle>
              </ion-item>
            </ion-col>
          </ion-row>
        </ion-grid>
        <ion-item fill="outline" class="ion-margin-bottom">
          <ion-label position="stacked">Açıklama</ion-label>
          <ion-input formControlName="desc"></ion-input>
        </ion-item>

        <ion-item fill="outline" class="ion-margin-bottom">
          <ion-label position="stacked">Grup Kodu</ion-label>
          <ion-input formControlName="groupCode"></ion-input>
        </ion-item>

        <ion-button expand="block" (click)="save()" [disabled]="editForm.invalid">
          Kaydet ve ID Dön
        </ion-button>
      </form>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule]
})
export class LanguageFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private languageService = inject(LanguageService);

  language: ILanguage | null = null;
  editForm: FormGroup = this.fb.group({
    id: [null],
    translateCode: [null, [Validators.required]],
    desc: ['JHI_DESC', [Validators.required]],
    tr: [null, [Validators.required]],
    en: [null, [Validators.required]],
    fr: [null, [Validators.required]],   
    isActive: [true],
    groupCode: [null, [Validators.required]],
  });

  ngOnInit() {
    if (this.language) {
      this.editForm.patchValue(this.language);
    }
  }

  save() {
    const val = this.editForm.value;
    if (val.id) {
      this.languageService.update(val).subscribe(res => this.modalCtrl.dismiss(res.body?.id));
    } else {
      this.languageService.create(val).subscribe(res => this.modalCtrl.dismiss(res.body?.id));
    }
  }

  cancel() { this.modalCtrl.dismiss(); }
}