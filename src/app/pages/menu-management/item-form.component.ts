import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ICategory, ILanguage, IMenuGroupItem } from 'src/app/interfaces/interfaces';
import { CategoryService } from '../category/category-service';
import { LanguageService } from '../language/language-service';
 
@Component({
  selector: 'app-item-form',
  template: `
    <ion-header>
      <ion-toolbar color="secondary">
        <ion-title>{{ item ? 'Item Düzenle' : 'Yeni Item Ekle' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()">Vazgeç</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="itemForm">
        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="stacked">Etiket (Label)</ion-label>
          <ion-input formControlName="label" placeholder="Örn: Kebaplar"></ion-input>
        </ion-item>

        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="stacked">Hedef Kategori (DB ID)</ion-label>
          <ion-select formControlName="targetCategoryId" placeholder="Ürün Kategorisi Seç">
            <ion-select-option *ngFor="let cat of dbCategories" [value]="cat.id">
              {{ cat.name }} (ID: {{cat.id}})
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item fill="outline" mode="md" class="ion-margin-bottom">
          <ion-label position="stacked">Sıralama</ion-label>
          <ion-input type="number" formControlName="orderNo"></ion-input>
        </ion-item>

        <ion-button expand="block" color="secondary" (click)="save()" [disabled]="!itemForm.valid">
          {{ item ? 'Güncelle' : 'Ekle' }}
        </ion-button>
      </form>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class ItemFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private categoryService=inject(CategoryService);
  private langService=inject(LanguageService);

  item: IMenuGroupItem | null = null;
  menuGroupId!: number; // Üst grubun ID'si
  dbCategories: ICategory[] = []; // Java'dan çektiğin gerçek ürün kategorileri
  languages=signal<ILanguage[]>([]);
  itemForm!: FormGroup;
 

  ngOnInit() {
    this.initForm();
    this.loadDbCategories();  
  }

  private loadDbCategories() {
    // Ürün kategorilerini Java backend'den çekiyoruz
    this.categoryService.query({ size: 200, sort: ['name,asc'] }).subscribe({
      next: (res) => {
        this.dbCategories = res.body ?? [];
      },
      error: () => console.error('Kategoriler yüklenirken hata oluştu kanki!')
    });
  }



  private initForm() {
    this.itemForm = this.fb.group({
      id: [this.item?.id || null],
      label: [this.item?.label || '', [Validators.required]],
      orderNo: [this.item?.orderNo || 0],
      targetCategoryId: [this.item?.targetCategoryId || null, [Validators.required]],
      menuGroupId: [this.menuGroupId, [Validators.required]],
      languageId: [1] //
    });
  }



  save() { this.modalCtrl.dismiss(this.itemForm.value); }
  cancel() { this.modalCtrl.dismiss(); }

 

}