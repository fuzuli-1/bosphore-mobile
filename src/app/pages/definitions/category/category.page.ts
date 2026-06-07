import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule,ToastController, ModalController,AlertController } from '@ionic/angular';
 
import { ICategory } from 'src/app/interfaces/interfaces';
import { CategoryService } from './category-service';
import { CategoryFormComponent } from './category-form';
import { TranslationService } from 'src/app/services/translation-service';
import { TranslatePipe } from 'src/app/services/TranslatePipe';
import { LanguageFormComponent } from '../language/language-form.component';
import { LanguageSelectorComponent } from '../language/language-selector.component';
 
 
 
@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslatePipe],
})
export class CategoryPage implements OnInit {
  page=0;
  totalItems = 0;
  itemsPerPage = 20; 
  categories=signal<ICategory[]>([]);
  selectedCategory: ICategory | null = null;
  selectedCategories=signal<ICategory[]>([]); 
  itemCount=signal<number>(0);

  //injection
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private service=inject(CategoryService); // Bu servisi oluşturman gerekecek, backend ile iletişim için.
  private ts = inject(TranslationService);
  private toastCtrl = inject(ToastController);
  constructor() {}

  ngOnInit() {
    this.locadCategories();
  }

  locadCategories() {
    const queryParams = {
      page: this.page,
      size: this.itemsPerPage,
      sort: ['id,asc'],
    };
    this.service.query(queryParams).subscribe(res => {
      this.categories.set(res.body ?? []);
      this.totalItems = res.headers.get('X-Total-Count') ? parseInt(res.headers.get('X-Total-Count')!, 10) : 0;
    });
  }

  nextPage() {
    if ((this.page + 1) * this.itemsPerPage < this.totalItems) {
      this.page++;
      this.locadCategories();
    } else {
      this.alertCtrl.create({
        header:  this.ts.instant('LAST_PAGE'),
        message:  this.ts.instant('NO_MORE_CATEGORIES'),
        buttons: [ this.ts.instant('OK') ]  
      }).then(alert => alert.present());
    }
  }

  previousPage() {
    if (this.page > 0) {
      this.page--;  
      this.locadCategories();
    } else {
      this.alertCtrl.create({
        header:  this.ts.instant('FIRST_PAGE'),
        message:  this.ts.instant('ALREADY_FIRST_PAGE'),
        buttons: [ this.ts.instant('OK') ]
      }).then(alert => alert.present());
    }
  }

 async openCategoryModal(category:ICategory) {
    const modal=await this.modalCtrl.create({
      component:CategoryFormComponent,
      componentProps:{category:category}

    });

    modal.onDidDismiss().then((result)=>{
      if(result.data){
        this.locadCategories();
      }

    });

    await modal.present();
  }

   selectCategory(cat :ICategory){
     this.selectedCategory =cat;
      let data: ICategory[]=this.categories().filter(t=>t.id==cat.id)??[];
     this.selectedCategories.set(data);
     this.itemCount.set(data.length);
   }

  async selectOrCreateLanguage() {
    const modal = await this.modalCtrl.create({
      component: LanguageFormComponent,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        const selectedLanguageId = result.data;
        console.log(
          'Yeni oluşturulan veya seçilen Dil ID:',
          selectedLanguageId,
        );
        this.showToast('success', this.ts.instant('LANGUAGE_SELECTED_OR_CREATED')+':'+ { id: selectedLanguageId }, 'top');
        // Bu ID'yi ana formuna (Ürün/Grup) set edebilirsin.
      }
    });
    await modal.present();
  }

  async openLanguageSelector() {
    const modal = await this.modalCtrl.create({
      component: LanguageSelectorComponent,
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        const selectedLang = result.data;
        
        // result.data burada ILanguage objesi döner.
        console.log('Seçilen Dil ID:', selectedLang.id);
        this.showToast('success',  `Seçilen Dil: ${selectedLang.desc}`,'top');

        // Kategori formunu güncelle
      /*  this.categoryForm.patchValue({
          languageId: selectedLang.id,
          name: selectedLang.tr, // Otomatik ismi de doldurabilirsin kanki
        });*/
      }
    });

    await modal.present();
  }

   EMOJI_MAP: Record<string, string> = {
      elma: '🍎',
      armut: '🍐',
      muz: '🍌',
      hamburger: '🍔',
      pizza: '🍕',
      sandwich: '🥪'   
  };

  getEmoji(name?: string): string {
  if (!name) return '🍽️';
  return this.EMOJI_MAP[name.toLowerCase()] ?? '🍽️';
  }

  addCategory() {
     const modal = this.modalCtrl.create({
      component: CategoryFormComponent,
    }).then(modal => {
      modal.present();
      modal.onDidDismiss().then(result => {
        if (result.data) {
          this.locadCategories(); // Yeni kategori eklendikten sonra listeyi yenile
        }
      });
    });
  }

  async deleteCategory(cat:ICategory){
    const alert=await this.alertCtrl.create({
      header:this.ts.instant("DELETE"),
      message:this.ts.instant('CONFIRM_DELETE'),
      buttons:[
        {text:this.ts.instant("CANCEL"),role:"cancel"},
        {
          text:this.ts.instant('DELETE'),
          role:"destructive",
          handler:()=>{
             this.service.delete(cat.id).subscribe({
              next:(res:any)=>{
                 this.locadCategories();
              },
              error:(res:any)=>{
                this.locadCategories();
                this.showToast('danger', res.error, 'bottom');
                
              }
             });
          }
        }
      ]
    });

    await alert.present();

  }

  async showToast(color: string, message: string, position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 250,
      cssClass: `custom-toast-${color}`,
      icon: 'checkmark-done-outline',
      position: position,
    });
    await toast.present();
  }

 

}
