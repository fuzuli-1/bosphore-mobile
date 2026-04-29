import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController,AlertController } from '@ionic/angular';
import { LanguageFormComponent } from '../language/language-form.component';
import { LanguageSelectorComponent } from '../language/language-selector.component';
import { TranslatePipe } from "../../services/TranslatePipe";
import { ICategory } from 'src/app/interfaces/interfaces';
import { CategoryService } from './category-service';
import { CategoryFormComponent } from './category-form';
 
 
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
 // private translatePipe = inject(TranslatePipe);
  private service=inject(CategoryService); // Bu servisi oluşturman gerekecek, backend ile iletişim için.
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
        header: 'Son Sayfa',
        message: 'Daha fazla kategori bulunmamaktadır.',
        buttons: ['Tamam']  
      }).then(alert => alert.present());
    }
  }

  previousPage() {
    if (this.page > 0) {
      this.page--;  
      this.locadCategories();
    } else {
      this.alertCtrl.create({
        header: 'İlk Sayfa',
        message: 'Zaten ilk sayfadasınız.',
        buttons: ['Tamam']
      }).then(alert => alert.present());
    }
  }

  openCategoryModal() {
    // Kategori oluşturma veya düzenleme modalini açmak için buraya kod ekleyebilirsin.
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

}
