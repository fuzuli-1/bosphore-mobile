// variation-selector.component.ts
import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProduct, IProductVariation } from 'src/app/interfaces/interfaces';
import { TranslatePipe } from 'src/app/services/TranslatePipe';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
  IonButton, IonButtons, IonIcon, IonBadge,
  ModalController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-variation-selector',
  standalone: true,
  imports: [
    CommonModule, TranslatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
    IonButton, IonButtons, IonIcon, IonBadge
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title class="modal-title">{{ product.name }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" (click)="dismiss()">
            <ion-icon slot="icon-only" name="close-circle" color="medium"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="modal-content">

      @if (product.description) {
        <p class="product-desc">{{ product.description }}</p>
      }

      <p class="choose-label">{{ 'CHOOSE_VARIANT' | translate }}</p>

      <div class="variant-list">
        @for (v of product.variations; track v.id) {
          <div
            class="variant-row"
            [class.variant-row--selected]="selectedVariation()?.id === v.id"
            (click)="select(v)">

            <div class="variant-left">
              <div class="radio-circle" [class.radio-circle--on]="selectedVariation()?.id === v.id">
                @if (selectedVariation()?.id === v.id) {
                  <ion-icon name="checkmark" style="font-size:13px;color:#fff"></ion-icon>
                }
              </div>
              <div>
                <span class="variant-name">{{ v.name }}</span>
                @if (v.name === 'Seul') {
                  <span class="variant-hint">Sadece yemek</span>
                } @else if (v.name === 'Frites') {
                  <span class="variant-hint">+ Patates kızartması</span>
                } @else if (v.name === 'Menu') {
                  <span class="variant-hint">+ Patates + İçecek</span>
                } @else if (v.name === 'Menu') {
                  <span class="variant-hint">+ İçecek</span>
                }
              </div>
            </div>

            <span class="variant-price">
              {{ ((product.price ??0) + (v.additionalPrice??0)) | number:'1.2-2' }} €
            </span>

          </div>
        }
      </div>
    <ion-footer class="ion-no-border">
      <div class="footer-wrap">

        <div class="qty-row">
          <button class="qty-btn" (click)="changeQty(-1)">−</button>
          <span class="qty-num">{{ qty() }}</span>
          <button class="qty-btn" (click)="changeQty(1)">+</button>
        </div>

        <ion-button
          expand="block"
          class="confirm-btn"
          [disabled]="!selectedVariation()"
          (click)="confirm()">
          {{ 'ADD_TO_CART' | translate }} —
          {{ totalPrice() | number:'1.2-2' }} €
        </ion-button>

      </div>
    </ion-footer>
    </ion-content>


  `,
  styles: [`
    .modal-title {
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 16px;
    }

    .modal-content {
      --background: var(--ion-background-color);
    }

    .product-desc {
      font-size: 13px;
      color: var(--ion-color-medium);
      padding: 12px 16px 0;
      margin: 0;
      line-height: 1.5;
    }

    .choose-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--ion-color-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 16px 16px 8px;
      margin: 0;
    }

    .variant-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 0 16px 16px;
    }

    .variant-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--ion-item-background, var(--ion-color-light));
      border: 1.5px solid var(--ion-color-light-shade);
      border-radius: 14px;
      padding: 14px 16px;
      cursor: pointer;
      transition: all 0.15s;

      &--selected {
        border-color: var(--ion-color-primary);
        background: rgba(var(--ion-color-primary-rgb), 0.05);
      }
    }

    .variant-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .radio-circle {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid var(--ion-color-medium-shade);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s;

      &--on {
        background: var(--ion-color-primary);
        border-color: var(--ion-color-primary);
      }
    }

    .variant-name {
      display: block;
      font-size: 15px;
      font-weight: 600;
      color: var(--ion-text-color);
    }

    .variant-hint {
      display: block;
      font-size: 12px;
      color: var(--ion-color-medium);
      margin-top: 2px;
    }

    .variant-price {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 16px;
      color: var(--ion-color-primary);
    }

    .footer-wrap {
      padding: 12px 16px 24px;
      background: var(--ion-background-color);
      border-top: 1px solid var(--ion-color-light-shade);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .qty-row {
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--ion-color-light);
      border-radius: 12px;
      padding: 6px 10px;
      flex-shrink: 0;
    }

    .qty-btn {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: none;
      background: var(--ion-background-color);
      font-size: 18px;
      font-weight: 500;
      color: var(--ion-text-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;

      &:hover { background: var(--ion-color-primary); color: #fff; }
    }

    .qty-num {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 16px;
      min-width: 20px;
      text-align: center;
      color: var(--ion-text-color);
    }

    .confirm-btn {
      --border-radius: 12px;
      --background: var(--ion-color-primary);
      --color: var(--ion-color-primary-contrast);
      --box-shadow: 0 4px 16px rgba(var(--ion-color-primary-rgb), 0.3);
      height: 48px;
      font-weight: 700;
      font-size: 15px;
      flex: 1;
    }
  `]
})
export class VariationSelectorComponent {
  @Input() product!: IProduct;

  selectedVariation = signal<IProductVariation | null>(null);
  qty = signal(1);

  totalPrice = () => {

    const v = this.selectedVariation();
    if (!v) return this.product.price;
    return ((this.product.price?? 0) + (v.additionalPrice?? 0)) * this.qty();

  };

  constructor(private modalCtrl: ModalController) {}

  select(v: IProductVariation) {
    this.selectedVariation.set(v);
  }

  changeQty(d: number) {
    const next = this.qty() + d;
    if (next >= 1) this.qty.set(next);
  }

  confirm() {
    const v = this.selectedVariation();
    if (!v) return;
    this.modalCtrl.dismiss({
      product: this.product,
      variation: v,
      quantity: this.qty(),
      totalPrice: this.totalPrice()
    });
  }

  dismiss() {
    this.modalCtrl.dismiss(null);
  }
}