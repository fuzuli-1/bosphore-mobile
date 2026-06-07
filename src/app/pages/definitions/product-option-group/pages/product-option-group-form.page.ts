import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonButtons,
  IonSpinner, IonText, IonBackButton, IonNote,
  ToastController, LoadingController, NavController, ModalController, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark, close, trash, saveOutline, arrowBack, cubeOutline, optionsOutline } from 'ionicons/icons';
import { IOptionGroup, IProduct, IProductOptionGroup, NewProductOptionGroup } from 'src/app/interfaces/interfaces';
import { ProductOptionGroupService } from './product-option-group.service';
import { ProductService } from 'src/app/pages/products/product-service';
import { OptionGroupService } from 'src/app/pages/menu-extra/option-group/option-group-service';
import { Observable } from 'rxjs';
import { ProductSelectorComponent } from 'src/app/pages/products/product-selector';
import { Bosp } from 'src/app/shared/utils/Bosp';
 

@Component({
  selector: 'app-product-option-group-form',
  templateUrl: './product-option-group-form.page.html',
  styleUrls: ['./product-option-group-form.page.scss'],
  standalone: true,
  imports: [IonInput, 
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonButtons,
    IonSpinner, IonText, IonBackButton, IonNote
  ]
})
export class ProductOptionGroupFormPage implements OnInit {

  isEdit = false;
  editId: number | null = null;
  isLoadingPage = true;
  isSaving = false;

  selectedProductId: number | null = null;
  productName: string = '';
  selectedOptionGroupId: number | null = null;

 
  optionGroups: IOptionGroup[] = [];

  //service: ProductOptionGroupService; --- IGNORE ---
  private productService = inject(ProductService); 
  private optiongroupService = inject(OptionGroupService);
  private service=inject(ProductOptionGroupService);
  private modalCtrl= inject(ModalController);
    private route= inject(ActivatedRoute);
    private toastCtrl= inject(ToastController);
    private loadingCtrl= inject(LoadingController);
    private navCtrl= inject(NavController);


  constructor(

  ) {
    addIcons({ checkmark, close, trash, saveOutline, arrowBack, cubeOutline, optionsOutline });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = +id;
    }
    this.loadFormData();
  }

  async loadFormData() {
    this.isLoadingPage = true;
    let loaded = 0;
    const checkDone = () => {
      loaded++;
      if (loaded >= 1 + (this.isEdit ? 1 : 0)) {
        this.isLoadingPage = false;
      }
    };

    this.optiongroupService.query().subscribe({
      next: (data: any) => { this.optionGroups = data.body||[]; checkDone(); },
      error: () => { this.showToast('Seçenek grupları yüklenemedi', 'danger'); checkDone(); }
    });

    if (this.isEdit && this.editId) {
      this.service.find(this.editId).subscribe({
        next: (data: any) => {
          this.selectedProductId = data.product?.id ?? null;
          this.selectedOptionGroupId = data.optionGroup?.id ?? null;
          checkDone();
        },
        error: () => { this.showToast('Kayıt yüklenemedi', 'danger'); checkDone(); }
      });
    }
  }

  get isFormValid(): boolean {
    return this.selectedProductId !== null && this.selectedOptionGroupId !== null;
  }

  async save() {
    if (!this.isFormValid) return;
    this.isSaving = true;
    const payload = {
      productId: this.selectedProductId!,
      optionGroupId: this.selectedOptionGroupId!
    };
     let obs: Observable<any>;

    if(this.isEdit && this.editId) {
         let productOptionGroup: IProductOptionGroup = {
      id: this.editId ?? 0,
      product: { id: this.selectedProductId! } as Pick<IProduct, 'id'>,
      optionGroup: this.optionGroups.find(g => g.id === this.selectedOptionGroupId) ?? undefined      
    } as IProductOptionGroup;
 
    obs= this.service.update(this.editId!, payload, productOptionGroup);

    }else {
      let productOptionGroup: NewProductOptionGroup = {
        product: { id: this.selectedProductId! } as Pick<IProduct, 'id'>,
        optionGroup: this.optionGroups.find(g => g.id === this.selectedOptionGroupId) ?? undefined      
      } as NewProductOptionGroup;

      obs= this.service.create(productOptionGroup)
    }
    
    obs.subscribe({
      next: () => {
        this.isSaving = false;
        this.showToast(this.isEdit ? 'Başarıyla güncellendi' : 'Başarıyla eklendi', 'success');
        this.navCtrl.navigateBack('/product-option-groups');
      },
      error: () => {
        this.isSaving = false;
        this.showToast('İşlem başarısız oldu', 'danger');
      }
    });
  }

  goBack() {
    this.navCtrl.navigateBack('/product-option-groups');
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message, color, duration: 2500, position: 'bottom'
    });
    await toast.present();
  }

  /*
  getSelectedProductName(): string {
    this.productService.find(this.selectedProductId!).subscribe({
      next: (data: any) => {
        this.productName = data.body?.name ?? '';
      },
      error: () => {
        this.productName = 'Ürün bilgisi yüklenemedi';
      }
    }); 
    return this.productName;
  } */

  getSelectedGroupName(): string {
    return this.optionGroups.find(g => g.id === this.selectedOptionGroupId)?.name ?? '';
  }


 async openProductSelect() {
     const modal= await this.modalCtrl.create({
      component: ProductSelectorComponent,
      componentProps: {
          // İstersen seçili ürünü de gönderebilirsin  selectedProductId: this.selectedProductId
      }
    })
     modal.present();

      modal.onDidDismiss().then(res => {  
        if(res.data) {
          this.selectedProductId = res.data.id;
          this.productName = res.data.name ?? '';
        }
      });
  }

}
