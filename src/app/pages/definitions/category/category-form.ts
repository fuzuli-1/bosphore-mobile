import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { CategoryService } from './category-service';
import { ICategory, ILanguage } from 'src/app/interfaces/interfaces';
  
import { MenuGroupItemSelectorComponent } from '../menu-management/item-selector.component';
import { TranslatePipe } from 'src/app/services/TranslatePipe';
import { LanguageSelectorComponent } from '../language/language-selector.component';
 
@Component({
  selector: 'app-category-form',
  template: `   <ion-header>
        <ion-toolbar color="primary">
            <ion-title>{{ category ? ['EDIT'|translate] : ['NEW_RECORD'|translate] }}</ion-title>    
            <ion-buttons slot="end">
                <ion-button (click)="cancel()">{{'CLOSE'|translate}}</ion-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
        <form [formGroup]="editForm">
            <ion-item fill="outline" class="ion-margin-bottom">
                <ion-label position="stacked">{{'NAME'|translate}}</ion-label>
                <ion-input formControlName="name"></ion-input>
            </ion-item> 
            <ion-item fill="outline" class="ion-margin-bottom">     
                <ion-label position="stacked">{{'MENU_GROUP_ITEM'|translate}}</ion-label>
                <ion-input formControlName="menuGroupItemId"></ion-input>
                <ion-button fill="outline" slot="end" (click)="openMenuGroupItemSelector()">
                    <ion-icon name="search" slot="start"></ion-icon> {{'CHOOSE'|translate}}
                </ion-button>
            </ion-item>
                <ion-item fill="outline" class="ion-margin-bottom">
                <ion-label position="stacked">{{'LANGUAGE'|translate}}</ion-label>
                <ion-input formControlName="languageId"></ion-input>
                <ion-button fill="outline" slot="end" (click)="openLanguageSelector()">
                    <ion-icon name="search" slot="start"></ion-icon> {{'CHOOSE'|translate}}
                </ion-button>
            </ion-item>

            <ion-item fill="outline" class="ion-margin-bottom">
                <ion-label position="stacked">{{'DESCRIPTION'|translate}}</ion-label>
                <ion-input formControlName="description"></ion-input>
            </ion-item>
            <ion-item fill="outline" class="ion-margin-bottom">
                <ion-label position="stacked">{{'imageUrl'|translate}}</ion-label>
                <ion-input formControlName="imageUrl"></ion-input>
            </ion-item>
            <ion-item fill="outline" class="ion-margin-bottom">
                <ion-label position="stacked">{{'DISPLAY_ORDER'|translate}}</ion-label>        
                <ion-input formControlName="displayOrder"></ion-input>
            </ion-item>
            <ion-item fill="outline" class="ion-margin-bottom">     
                <ion-label position="stacked">{{'active'|translate}}</ion-label>
                <ion-select formControlName="active">
                    <ion-select-option [value]="true">{{'YES'|translate}}</ion-select-option>
                    <ion-select-option [value]="false">{{'NO'|translate}}</ion-select-option>
                </ion-select>
            </ion-item>


            <ion-button expand="block" (click)="save()" [disabled]="editForm.invalid">
                {{'SAVE'|translate}}
            </ion-button>
        </form>
    </ion-content>`,
  standalone: true,
    imports: [IonicModule, ReactiveFormsModule, TranslatePipe]
})
export class CategoryFormComponent implements OnInit {

    private fb = inject(FormBuilder);
    private modalCtrl = inject(ModalController);
    private categoryService = inject(CategoryService);

   @Input() category: ICategory | null = null;
    editForm: FormGroup= this.fb.group({
        id: [null], 
        name: [null, [Validators.required]],
        description:[null],
        imageUrl:[null],
        displayOrder:[null],
        active:[null,[Validators.required]],
        menuGroupItemId:[null,[Validators.required]],
        languageId:[null,[Validators.required]]
    });

    ngOnInit() {
        if (this.category) {
            this.editForm.patchValue({
                id: this.category.id,
                name: this.category.name,
                description: this.category.description,
                imageUrl: this.category.imageUrl,
                displayOrder: this.category.displayOrder,
                active: this.category.isActive,
                menuGroupItemId: this.category.menuGroupItem?.id,
                languageId: this.category.language?.id
            });
        }
    }

   async openLanguageSelector() {
        // Dil seçici modalini açmak için gerekli kodu buraya ekleyin
        // Örneğin: this.languageModal.present();
      const  modal= await this.modalCtrl.create({
            component: LanguageSelectorComponent,
            cssClass: 'my-custom-modal-css'
        });
        await modal.present();
        const { data } = await modal.onWillDismiss();
        if (data) {
            this.editForm.patchValue({ languageId: data.id });
        }
    }

    async openMenuGroupItemSelector() {
        const modal = await this.modalCtrl.create({
            component: MenuGroupItemSelectorComponent,
            cssClass: 'my-custom-modal-css'
        });
        await modal.present();
        const { data } = await modal.onWillDismiss();
        if (data) {
            this.editForm.patchValue({ menuGroupItemId: data.id });
        }
    }

    save() {
        if (this.category) {
            this.editForm.value.language = { id: this.editForm.value.languageId };
            this.editForm.value.menuGroupItem = { id: this.editForm.value.menuGroupItemId };
            this.categoryService.update(this.editForm.value).subscribe(res => {
                this.modalCtrl.dismiss(res);
            });
        }
     else {
            this.editForm.value.language = { id: this.editForm.value.languageId };
            this.editForm.value.menuGroupItem = { id: this.editForm.value.menuGroupItemId };
            this.categoryService.create(this.editForm.value).subscribe(res => {
                this.modalCtrl.dismiss(res);
            });
        }
    }
   cancel() {
        this.modalCtrl.dismiss();
    }    
}