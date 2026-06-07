import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IMenuGroup } from 'src/app/interfaces/interfaces';
import { TranslatePipe } from 'src/app/services/TranslatePipe';
import { LanguageSelectorComponent } from '../language/language-selector.component';
 
 

@Component({
  selector: 'app-group-form',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ group ? 'Grubu Düzenle' : 'Yeni Grup' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()">{{ 'CLOSE' | translate }}</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="groupForm">
        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="stacked">{{ 'GROUP_TITLE' | translate }}</ion-label>
          <ion-input formControlName="title" placeholder="Örn: İçecekler"></ion-input>
        </ion-item>
        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="stacked">{{ 'ORDER_NUMBER' | translate }}</ion-label>
          <ion-input type="number" formControlName="orderNo"></ion-input>
        </ion-item>
        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="stacked">{{ 'ICON_PATH' | translate }}</ion-label>
          <ion-input formControlName="iconPath" placeholder="Örn: beverage-icon"></ion-input>
        </ion-item>
        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="stacked">{{ 'LANGUAGE_ID' | translate }}</ion-label>
          <ion-input type="number" formControlName="languageId"></ion-input>
          <ion-button (click)="selectLanguage()">Seç </ion-button>
        </ion-item>

        <ion-button expand="block" (click)="save()" [disabled]="!groupForm.valid">
           group ?  {{'UPDATE' | translate}} : {{'SAVE' | translate }}
        </ion-button>
      </form>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class GroupFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  
  group: IMenuGroup | null = null; // ComponentProps ile dışarıdan gelir
  groupForm!: FormGroup;

  selectLanguage() {
    // Burada dil seçici modalini açabilirsin
    // Modal'den seçilen dilin ID'sini alıp formdaki languageId'ye set et
    this.modalCtrl.create({
      component: LanguageSelectorComponent,
      cssClass: 'language-selector-modal'
    }).then(modal => {
      modal.present();
      modal.onDidDismiss().then(result => {
        if (result.data) {
          this.groupForm.patchValue({ languageId: result.data.id });
        } else {
          this.groupForm.patchValue({ languageId: null });
        }
      });
    });
  }


  ngOnInit() {    
    this.groupForm = this.fb.group({
      id: [this.group?.id || null],
      title: [this.group?.title || '', [Validators.required]],
      orderNo: [this.group?.orderNo || 0],
      iconPath: [this.group?.iconPath || ''],
      languageId: [1] // Şimdilik default 1
    });
  }

  save() { this.modalCtrl.dismiss(this.groupForm.value); }
  cancel() { this.modalCtrl.dismiss(); }
}