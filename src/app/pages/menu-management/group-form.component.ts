import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IMenuGroup } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-group-form',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ group ? 'Grubu Düzenle' : 'Yeni Grup' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()">Kapat</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="groupForm">
        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="stacked">Grup Başlığı</ion-label>
          <ion-input formControlName="title" placeholder="Örn: İçecekler"></ion-input>
        </ion-item>
        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="stacked">Sıra No</ion-label>
          <ion-input type="number" formControlName="orderNo"></ion-input>
        </ion-item>
        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="stacked">İkon Yolu (icon_path)</ion-label>
          <ion-input formControlName="iconPath" placeholder="Örn: beverage-icon"></ion-input>
        </ion-item>
        <ion-button expand="block" (click)="save()" [disabled]="!groupForm.valid">
          {{ group ? 'Güncelle' : 'Kaydet' }}
        </ion-button>
      </form>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class GroupFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  
  group: IMenuGroup | null = null; // ComponentProps ile dışarıdan gelir
  groupForm!: FormGroup;

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