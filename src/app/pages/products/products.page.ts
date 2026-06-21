import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductService } from './product-service';
import { IProduct } from 'src/app/interfaces/interfaces';
import { ModalController, AlertController, IonicModule } from '@ionic/angular';
import { ProductFormComponent } from './product-form';
import { TranslationService } from 'src/app/services/translation-service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from "../../services/TranslatePipe";
import { GeneralSettings } from 'src/app/page';
import { AppUtil } from 'src/app/shared/utils/app-util';
import { FormsModule } from '@angular/forms'; // <-- NgModel kullanabilmek için FormsModule ekledik
import { MenuGroupService } from '../menu-grup/menu-groups/menu-group-service';
import { MenuGroupItemService } from '../menu-grup/menu-group-item/menu-group-item-service';

@Component({
  selector: 'products',
  templateUrl: './products.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, TranslatePipe, FormsModule] // <-- FormsModule buraya eklendi
})
export class ProductsPage implements OnInit {
  private productService = inject(ProductService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private translate = inject(TranslationService);
  
  // TODO: Kendi servis isimlerine göre buraları güncelleyebilirsin
   private menuGroupService = inject(MenuGroupService); 
   private menuGroupItemService = inject(MenuGroupItemService);

  public apiUrl = GeneralSettings.url;
  public appUtil = inject(AppUtil);

  products = signal<IProduct[]>([]);
  searchTerm: string = '';
  page = 0;
  itemsPerPage = 20;
  isLastPage = false;

  // Filtre Seçimleri için State Tanımlamaları
  selectedMenuGroupId: number | null = null;
  selectedMenuGroupItemId: number | null = null;

  // Select elementlerinin içini dolduracak listeler
  menuGroups = signal<any[]>([]); // Tip tanımlamana göre IMenuGroup[] yapabilirsin
  menuGroupItems = signal<any[]>([]); // Tip tanımlamana göre IMenuGroupItem[] yapabilirsin

  ngOnInit() {
    this.loadMenuGroups(); // Sayfa açılışında ana grupları çek
    this.loadAll();
  }

  loadMenuGroups() {
    // Ana menü gruplarını backend'den çekecek metot
      this.menuGroupService.query().subscribe(res => {
      this.menuGroups.set(res.body ?? []);
    });
    
  }

  onMenuGroupChange(event: any) {
    this.selectedMenuGroupId = event.detail.value;
    this.selectedMenuGroupItemId = null; // Grup değiştiğinde alt grubu sıfırla
    this.menuGroupItems.set([]); // Alt grup listesini temizle

    if (this.selectedMenuGroupId) {
      this.loadMenuGroupItems(this.selectedMenuGroupId);
    }

    this.filterChanged();
  }

  loadMenuGroupItems(menuGroupId: number) {
    // Seçilen gruba ait alt kalemleri backend'den çekecek metot
      this.menuGroupItemService.query({ 'menuGroupId': menuGroupId }).subscribe(res => {
      this.menuGroupItems.set(res.body ?? []);
    });
 
  }

  onMenuGroupItemChange(event: any) {
    this.selectedMenuGroupItemId = event.detail.value;
    this.filterChanged();
  }

  // Filtreler değiştiğinde listeyi sıfırlayıp yeniden çeken yardımcı metot
  filterChanged() {
    this.resetList();
    this.loadAll();
  }

  loadAll(event?: any) {
    if (this.isLastPage && event) {
      event.target.disabled = true;
      return;
    }

    const queryParams: any = {
      page: this.page,
      size: this.itemsPerPage,
      sort: ['id,desc']
    };

    // Arama kriterlerini ekle
    if (this.searchTerm) {
      queryParams['name'] = this.searchTerm;
    }

    // Backend Spring Boot / JHipster ise isimlendirmeler genelde 'menuGroupId.equals' şeklinde olur


    if (this.selectedMenuGroupItemId) {
      queryParams['categoryId'] = this.selectedMenuGroupItemId;
    }

    this.productService.query(queryParams).subscribe({
      next: (res) => {
        const data = res.body ?? [];
        
        if (data.length < this.itemsPerPage) {
          this.isLastPage = true;
        }

        if (this.page === 0) {
          this.products.set(data);
        } else {
          this.products.set([...this.products(), ...data]);
        }

        this.page++;

        if (event) {
          event.target.complete();
          if (this.isLastPage) event.target.disabled = true;
        }
      },
      error: () => {
        if (event) event.target.complete();
      }
    });
  }

  search(event: any) {
    this.searchTerm = event.target.value;
    this.filterChanged();
  }

  private resetList() {
    this.page = 0;
    this.isLastPage = false;
    this.products.set([]);
  }

  async openForm(product?: IProduct) {
    const modal = await this.modalCtrl.create({
      component: ProductFormComponent,
      componentProps: { product: product || null }
    });

    modal.onDidDismiss().then(res => { if (res.data) this.filterChanged(); });
    return await modal.present();
  }

  async delete(id: number) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('DELETE_PRODUCT'),
      message: this.translate.instant('CONFIRM_DELETE'),
      buttons: [
        { text: this.translate.instant('CANCEL'), role: 'cancel' },
        { text: this.translate.instant('DELETE'), handler: () => {
          this.productService.delete(id).subscribe(() => this.filterChanged());
        }}
      ]
    });
    await alert.present();
  }
}