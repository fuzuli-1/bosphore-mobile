import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { LanguageSelectorComponent } from '../language/language-selector.component';
import { TranslationService } from 'src/app/services/translation-service';
import { BadgeType, ICategory, IProduct } from 'src/app/interfaces/interfaces';
import { CategorySelectorComponent } from '../category/category-selector';
import { ProductService } from './product-service';
import { TranslatePipe } from '../../services/TranslatePipe';
import { CategoryService } from '../category/category-service';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../language/language-service';

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
            placeholder="{{ 'select_category' | translate }}"
          ></ion-input>
          <ion-icon name="folder-outline" slot="end"></ion-icon>
        </ion-item>

        <ion-item fill="outline">
          <ion-label position="stacked">{{ 'name' | translate }}</ion-label>
          <ion-input formControlName="name" (ionInput)="updateEmojiFromName()"></ion-input>
        </ion-item>

        <!-- Emoji Gösterimi -->
        <ion-item fill="outline">
          <ion-label position="stacked">{{ 'emoji' | translate }}</ion-label>
          <div class="emoji-container" style="display: flex; align-items: center; gap: 10px;">
            <ion-input 
              formControlName="emoji" 
              placeholder="🍽️"
              style="flex: 1;"
            ></ion-input>
            <div class="current-emoji" style="font-size: 32px; min-width: 50px; text-align: center;">
              {{ editForm.get('emoji')?.value || '🍽️' }}
            </div>
          </div>
        </ion-item>

        <!-- Hızlı Emoji Seçici -->
        <ion-item fill="outline">
          <ion-label position="stacked">{{ 'quick_emoji' | translate }}</ion-label>
          <div class="quick-emoji-grid" style="display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 0;">
            <ion-button 
              *ngFor="let emoji of quickEmojis" 
              fill="outline"
              size="small"
              (click)="setEmoji(emoji)"
              style="font-size: 24px; min-width: 50px; height: 50px;">
              {{ emoji }}
            </ion-button>
          </div>
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
            placeholder="{{ 'select_language' | translate }}"
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
          <ion-label position="stacked">
            {{ 'badge' | translate }}
          </ion-label>
          <ion-select
            formControlName="badge"
            interface="popover"
            placeholder="Badge seç"
          >
            <ion-select-option
              *ngFor="let badge of badgeTypes"
              [value]="badge"
            >
              {{ getBadgeLabel(badge) }}
            </ion-select-option>
          </ion-select>
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
  styles: [`
    .quick-emoji-grid ion-button {
      --border-radius: 12px;
      --padding-start: 0;
      --padding-end: 0;
    }
    .current-emoji {
      background: var(--ion-color-light);
      border-radius: 12px;
      padding: 8px;
    }
  `],
  standalone: true,
  imports: [
    IonicModule, 
    ReactiveFormsModule, 
    TranslatePipe,
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductFormComponent implements OnInit {
  product: IProduct | null = null;
  selectedCategoryName: string | null = null;
  selectedLanguageName = '';
  category: ICategory | null = null;
  
  badgeTypes: BadgeType[] = [
    'NEW',
    'HOT',
    'SALE',
    'TRENDING',
    'FEATURED',
    'BEST_SELLER'
  ];

  // Hızlı emoji seçenekleri
  quickEmojis: string[] = [
    '🍎', '🍐', '🍌', '🍔', '🍕', '🥪', '🥗', '🍜', '🍚', '🍣',
    '🍰', '🎂', '🍪', '☕', '🧃', '🥤', '🍺', '🍷', '🥩', '🐟'
  ];

  // Ürün adına göre emoji eşleme
  EMOJI_MAP: Record<string, string> = {
    'elma': '🍎',
    'armut': '🍐',
    'muz': '🍌',
    'hamburger': '🍔',
    'pizza': '🍕',
    'sandwich': '🥪',
    'salata': '🥗',
    'çorba': '🍜',
    'pirinç': '🍚',
    'suşi': '🍣',
    'pasta': '🍰',
    'kek': '🎂',
    'kurabiye': '🍪',
    'kahve': '☕',
    'çay': '🍵',
    'ayran': '🥛',
    'cola': '🥤',
    'bira': '🍺',
    'şarap': '🍷',
    'et': '🥩',
    'balık': '🐟',
    'tavuk': '🍗',
    'makarna': '🍝',
    'tost': '🥪'
  };

  // inject edilen servisler ve diğer bağımlılıklar
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  public translate = inject(TranslationService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private languageService=inject(LanguageService);

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
    emoji: this.fb.control<string | null>('🍽️'),
    isActive: this.fb.control<boolean | null>(true),
  });

  ngOnInit() {
    if (this.product != null && this.product != undefined) {
      this.loadCategory(this.product.category?.id);
       this.findLanguage(this.product.language?.id);
      this.editForm.patchValue({
        id: this.product.id,
        productId: this.product.productId,
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        imageUrl: this.product.imageUrl,
        category: this.product.category?.id ? { id: this.product.category.id } : null,
        tax: { id: 1 },
        language: this.product.language?.id ? { id: this.product.language.id } : null,
        reviewCount: this.product.reviewCount,
        rating: this.product.rating,
        badge: this.product.badge,
        emoji: this.product.emoji || this.getEmoji(this.product.emoji) || '🍽️',
        isActive: this.product.isActive,
      });
    }
  }

      findLanguage(id : any){ 
     if (this.product != null && this.product != undefined) {
      this.languageService.find(id)
          .pipe(
            map(res => res.body?.tr ?? null)
          )
          .subscribe(name => {
            this.selectedLanguageName = name??"";
          });
     }

  }

  loadCategory(id: any) { 
    if (this.product != null && this.product != undefined) {
      this.categoryService.find(id)
        .pipe(map(res => res.body?.name ?? null))
        .subscribe(name => {
          this.selectedCategoryName = name;
        });
    }
  }

  // Ürün adından emoji çıkar
  getEmoji(name?: string): string {
    if (!name) return '🍽️';
    
    // Tam eşleşme kontrolü
    const lowerName = name.toLowerCase();
    if (this.EMOJI_MAP[lowerName]) {
      return this.EMOJI_MAP[lowerName];
    }
    
    // Kısmi eşleşme kontrolü
    for (const [key, emoji] of Object.entries(this.EMOJI_MAP)) {
      if (lowerName.includes(key)) {
        return emoji;
      }
    }
    
    return '🍽️';
  }

  // İsim değiştiğinde emojiyi otomatik güncelle
  updateEmojiFromName() {
    const productName = this.editForm.get('name')?.value;
    if (productName && !this.editForm.get('emoji')?.value) {
      const suggestedEmoji = this.getEmoji(productName);
      this.editForm.patchValue({ emoji: suggestedEmoji });
    }
  }

  // Emoji seç
  setEmoji(emoji: string) {
    this.editForm.patchValue({ emoji: emoji });
  }

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
    
    // Emoji yoksa varsayılan emoji ekle
    if (!productData.emoji) {
      productData.emoji = this.getEmoji(productData.name || undefined);
    }
    
    if (productData.id) {
      this.productService
        .update(productData as any)
        .subscribe(() => this.modalCtrl.dismiss(true));
    } else {
      productData.tax = { id: 1 };
      this.productService
        .create(productData as any)
        .subscribe(() => this.modalCtrl.dismiss(true));
    }
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  getBadgeLabel(badge: BadgeType): string {
    switch (badge) {
      case 'NEW': return '🆕 Yeni';
      case 'HOT': return '🔥 Popüler';
      case 'SALE': return '💸 İndirim';
      case 'TRENDING': return '📈 Trend';
      case 'FEATURED': return '⭐ Öne Çıkan';
      case 'BEST_SELLER': return '🏆 Çok Satan';
      default: return badge;
    }
  }
}