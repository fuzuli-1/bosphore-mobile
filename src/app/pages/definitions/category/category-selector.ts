import { Component, inject, OnInit, signal } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {  ICategory, ILanguage } from 'src/app/interfaces/interfaces';
import { CategoryService } from './category-service';
import { CategoryFormComponent } from './category-form';
import { TranslatePipe } from 'src/app/services/TranslatePipe';
 

@Component({
  selector: 'app-category-selector',
  template: `
    <ion-header>
      <ion-toolbar color="tertiary">
        <ion-title>{{'CHOOSE_CATEGORY'|translate}}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()">{{'CLOSE'|translate}}</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar 
          placeholder="{{'FIND_CATEGORY'|translate}}" 
          show-clear-button="always"
          [(ngModel)]="searchTerm"
          (ionInput)="search($event)">
        </ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item button *ngFor="let category of results()" (click)="select(category)">
          <ion-label>
            <h2>{{ category.categoryId }}</h2>
            <p> {{ category.name }}</p>
          </ion-label>
          <ion-icon name="chevron-forward-outline" slot="end"></ion-icon>
        </ion-item>

        <ion-item *ngIf="results().length === 0 && searchTerm.length > 2" lines="none">
          <ion-label color="medium">{{'NO_RECORDS_FOUND'|translate}}</ion-label>
          <ion-button slot="end" fill="outline" (click)="addNewCategory()">
            <ion-icon name="add-outline" slot="start"></ion-icon> {{'yeniOlustur'|translate}}
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslatePipe]
})
export class CategorySelectorComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private modalCtrl = inject(ModalController);

  searchTerm: string = '';
  results = signal<ICategory[]>([]);

  ngOnInit() {
    // İlk açılışta popüler olanları veya boş bir liste getirebilirsin
    this.loadAll();
  }


 loadAll() {
      this.categoryService.query({      
      size: 20,
      sort:["name,asc"]
    }).subscribe(res => {
      this.results.set(res.body ?? []);
    });

 
}

  search(event: any) {
  const term = event.target.value.toLowerCase();
  if (term && term.length > 3) {
    // SEÇENEK A: Backend'den ara (Daha profesyonel)
    this.categoryService.query({
      'query': term, // JHipster filtre yapısı (Eğer Filtering aktifse)
      size: 20,
      sort:["name,asc"]
    }).subscribe(res => {
      this.results.set(res.body ?? []);
    });

    /* SEÇENEK B: Eğer filtreleme çalışmıyorsa /search endpoint'ini kullan:
    this.http.get<ICategory[]>(`/api/categories/search?query=${term}`).subscribe(...)
    */
  } else {
    this.results.set([]);
  }
}

  search1(event: any) {
    const query = event.target.value.toLowerCase();
    if (query && query.length > 3) {
      // JHipster Query yapısını kullanarak hem TR hem EN hem de Kod içinde ara
      this.categoryService.search({
        'query': query,
        size: 10,
        sort: ['name,asc']
      }).subscribe(res => {
        this.results.set(res.body ?? []);
      });
    } else {
      this.results.set([]);
    }
  }

  select(category: ICategory) {
    this.modalCtrl.dismiss(category); // Seçilen kategoriyi geri gönder
  }

  async addNewCategory() {
    // Eğer aradığını bulamazsa, senin yaptığın o güzel form modalını açalım
    const modal = await this.modalCtrl.create({
      component: CategoryFormComponent,
      componentProps: { 
        // Arama terimini formun içine default değer olarak paslayabiliriz
        category: { translateCode: this.searchTerm.toUpperCase(), tr: this.searchTerm } 
      }
    });
    modal.present();
    modal.onDidDismiss().then(res => {
      if (res.data) {
        // Yeni oluşturulan dilin ID'si gelirse onu ana ekrana dön
        this.modalCtrl.dismiss(res.data); 
      }
    });
  }

  cancel() { this.modalCtrl.dismiss(); }
}