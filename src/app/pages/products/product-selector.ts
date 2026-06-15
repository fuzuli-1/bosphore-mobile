import { Component, inject, OnInit, signal } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
 
import { ILanguage, IProduct } from 'src/app/interfaces/interfaces';
import { ProductService } from './product-service';
import { ProductFormComponent } from './product-form';
 

@Component({
  selector: 'app-product-selector',
  template: `
    <ion-header>
      <ion-toolbar color="tertiary">
        <ion-title>Menu / Ürün Seç</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()">Kapat</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar 
          placeholder="Menu veya Ürün Ara (örn: kebab, en...)" 
          show-clear-button="always"
          [(ngModel)]="searchTerm"
          (ionInput)="search($event)">
        </ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item button *ngFor="let product of results()" (click)="select(product)">
          <ion-label>
            <h2>{{ product.name }}</h2>
            <p>Kod: {{ product.id }} | Category: {{product.category?.id }}</p>
            <p>Aciklama: {{ product.description }} | Aktif: {{product.isActive }}</p>
          </ion-label>
          <ion-icon name="chevron-forward-outline" slot="end"></ion-icon>
        </ion-item>

        <ion-item *ngIf="results().length === 0 && searchTerm.length > 2" lines="none">
          <ion-label color="medium">Sonuç bulunamadı...</ion-label>
          <ion-button slot="end" fill="outline" (click)="addNewProduct()">
            <ion-icon name="add-outline" slot="start"></ion-icon> Yeni Oluştur
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProductSelectorComponent implements OnInit {
  //inject
  private productService = inject(ProductService);
  private modalCtrl = inject(ModalController);

  searchTerm: string = '';
  results = signal<IProduct[]>([]);

  ngOnInit() {
    // İlk açılışta popüler olanları veya boş bir liste getirebilirsin
  }

  search(event: any) {
  const term = event.target.value.toLowerCase();
  if (term && term.length > 3) {
    // SEÇENEK A: Backend'den ara (Daha profesyonel)
    this.productService.query({
      'name': term, // JHipster filtre yapısı (Eğer Filtering aktifse)
      size: 20,
      sort: ['name,asc']
    }).subscribe(res => {
      this.results.set(res.body ?? []);
    });

    /* SEÇENEK B: Eğer filtreleme çalışmıyorsa /search endpoint'ini kullan:
    this.http.get<ILanguage[]>(`/api/languages/search?query=${term}`).subscribe(...)
    */
  } else {
    this.results.set([]);
  }
}

  search1(event: any) {
    const query = event.target.value.toLowerCase();
    if (query && query.length > 3) {
      // JHipster Query yapısını kullanarak hem TR hem EN hem de Kod içinde ara
      this.productService.query({
        'name': query,
        size: 10,
        sort: ['name,asc']
      }).subscribe(res => {
        this.results.set(res.body ?? []);
      });
    } else {
      this.results.set([]);
    }
  }

  select(product: IProduct) {
    this.modalCtrl.dismiss(product); // Seçilen ürünü geri gönder
  }

  async addNewProduct() {
    // Eğer aradığını bulamazsa, senin yaptığın o güzel form modalını açalım
    const modal = await this.modalCtrl.create({
      component: ProductFormComponent,
      componentProps: { 
        // Arama terimini formun içine default değer olarak paslayabiliriz
        product: { name: this.searchTerm.toUpperCase(), id: this.searchTerm } 
      }
    });
    modal.present();
    modal.onDidDismiss().then(res => {
      if (res.data) {
        // Yeni oluşturulan ürünü ana ekrana dön
        this.modalCtrl.dismiss(res.data); 
      }
    });
  }

  cancel() { this.modalCtrl.dismiss(); }
}