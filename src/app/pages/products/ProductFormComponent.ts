import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { LanguageSelectorComponent } from '../language/language-selector.component';
import { TranslationService } from 'src/app/services/translation-service';
import { ICategory, IProduct } from 'src/app/interfaces/interfaces';
import { Bosp } from 'src/app/shared/utils/Bosp';
import { CategorySelectorComponent } from '../category/category-selector';
import { ProductService } from './product-service';
import { TranslatePipe } from '../../services/TranslatePipe';
import { CategoryService } from '../category/category-service';
import { map } from 'rxjs';

@Component({
  selector: 'app-product-form',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{
          product ? ['edit_product' | translate] : ['new_product' | translate]
        }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()">
             <ion-icon name="close-circle"></ion-icon>
          </ion-button>

        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="editForm">
        <ion-item
          fill="outline"
          class="ion-margin-top"
          (click)="selectCategory()"
        >
          <ion-label position="stacked">{{ 'category' | translate }}</ion-label>
          <ion-input
            [value]="selectedCategoryName"
            readonly
            placeholder="{{ 'select_category' | translate }}}"
          ></ion-input>
          <ion-icon name="folder-outline" slot="end"></ion-icon>
        </ion-item>

        <ion-item fill="outline">
          <ion-label position="stacked">{{ 'name' | translate }}</ion-label>
          <ion-input formControlName="name"></ion-input>
        </ion-item>

        <ion-item
          fill="outline"
          class="ion-margin-top"
          (click)="selectLanguage()"
        >
          <ion-label position="stacked">{{ 'language' | translate }}</ion-label>
          <ion-input
            [value]="selectedLanguageName"
            readonly
            placeholder="{{ 'select_language' | translate }}}"
          ></ion-input>
          <ion-icon name="language-outline" slot="end"></ion-icon>
        </ion-item>

        <ion-item fill="outline">
          <ion-label position="stacked"
            >{{ 'price' | translate }} (TL)</ion-label
          >
          <ion-input type="number" formControlName="price"></ion-input>
        </ion-item>

        <ion-item fill="outline">
          <ion-label position="stacked">{{
            'description' | translate
          }}</ion-label>
          <ion-input formControlName="description"></ion-input>
        </ion-item>
        <ion-item fill="outline">
          <ion-label position="stacked">{{
            'image_url' | translate
          }}</ion-label>
          <ion-input formControlName="imageUrl"></ion-input>
        </ion-item>
        <ion-item fill="outline">
          <ion-label position="stacked">{{
            'is_active' | translate
          }}</ion-label>
          <ion-select formControlName="isActive">
            <ion-select-option [value]="true">Evet</ion-select-option>
            <ion-select-option [value]="false">Hayır</ion-select-option>
          </ion-select>
        </ion-item> 
        <ion-button expand="block" class="ion-margin-top" (click)="save()"
          >{{ product ? ['update' | translate] : ['save' | translate] }}</ion-button>
       
      </form>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, TranslatePipe],
})
export class ProductFormComponent implements OnInit {
  product: IProduct | null = null;
  selectedCategoryName: string | null = null;
  selectedLanguageName = '';
  category:ICategory|null=null;

  //inject edilen servisler ve diğer bağımlılıklar
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  public translate = inject(TranslationService);
  private productService = inject(ProductService);
  private categoryService=inject(CategoryService)

  editForm = this.fb.group({
    id: this.fb.control<number | null>(null),
    productId: this.fb.control<number | null>(null, Validators.required),
    name: this.fb.control<string | null>(null, Validators.required),
    description: this.fb.control<string | null>(null),
    price: this.fb.control<number | null>(null, Validators.required),
    imageUrl: this.fb.control<string | null>(null, Validators.required),
    category: this.fb.control<{ id: number } | null>(null, Validators.required),
    tax: this.fb.control<{ id: number } | null>(null),
    language: this.fb.control<{ id: number } | null>(null, Validators.required),
    reviewCount: this.fb.control<number | null>(0),
    rating: this.fb.control<number | null>(0),
    badge: this.fb.control<string | null>(null),
    emoji: this.fb.control<string | null>(null),

    isActive: this.fb.control<boolean | null>(true),
  });

  ngOnInit() {
    if (this.product != null && this.product != undefined) {
      this.loadCategory(this.product.category?.id)
      this.editForm.patchValue({
        id: this.product.id,
        productId: this.product.productId,
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        imageUrl: this.product.imageUrl,
        category: this.product.category?.id
          ? {
              id: this.product.category.id,
            }
          : null,

        tax: {
              id: 1, // Varsayılan bir tax id'si, gerçek uygulamada dinamik olarak gelmeli
            },

        language: this.product.language?.id
          ? {
              id: this.product.language.id,
            }
          : null,

        reviewCount: this.product.reviewCount,
        rating: this.product.rating,
        badge: this.product.badge,
        emoji: this.product.emoji,

        isActive: this.product.isActive,
      });
    }
  }

  loadCategory(id : any){ 
     if (this.product != null && this.product != undefined) {
      this.categoryService.find(id)
          .pipe(
            map(res => res.body?.name ?? null)
          )
          .subscribe(name => {
            this.selectedCategoryName = name;
          });
     }

  }
  // Kategori Seçiciyi Aç
  async selectCategory() {
    const modal = await this.modalCtrl.create({
      component: CategorySelectorComponent,
    });
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.selectedCategoryName = result.data.name;
        this.editForm.patchValue({ category: { id: result.data.id } });
      }
    });
    await modal.present();
  }

  async selectLanguage() {
    const modal = await this.modalCtrl.create({
      component: LanguageSelectorComponent,
    });
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.selectedLanguageName = result.data.tr;
        this.editForm.patchValue({ language: { id: result.data.id } });
      }
    });
    await modal.present();
  }

  save() {
    const productData = this.editForm.value;
    if (productData.id) {
      this.productService
        .update(productData as any)
        .subscribe(() => this.modalCtrl.dismiss(true));
    } else {
       productData.tax = { id: 1 }; // Varsayılan bir tax id'si, gerçek uygulamada dinamik olarak gelmeli
      this.productService
        .create(productData as any)
        .subscribe(() => this.modalCtrl.dismiss(true));
    }
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
