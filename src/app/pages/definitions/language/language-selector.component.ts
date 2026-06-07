import { Component, inject, OnInit, signal } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from './language-service';
import { ILanguage } from 'src/app/interfaces/interfaces';
import { LanguageFormComponent } from './language-form.component';

@Component({
  selector: 'app-language-selector',
  template: `
    <ion-header>
      <ion-toolbar color="tertiary">
        <ion-title>Dil / Çeviri Seç</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()">Kapat</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar 
          placeholder="Çeviri veya Kod Ara (örn: tr, en...)" 
          show-clear-button="always"
          [(ngModel)]="searchTerm"
          (ionInput)="search($event)">
        </ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item button *ngFor="let lang of results()" (click)="select(lang)">
          <ion-label>
            <h2>{{ lang.tr || lang.translateCode }}</h2>
            <p>Kod: {{ lang.translateCode }} | EN: {{ lang.en }}</p>
          </ion-label>
          <ion-icon name="chevron-forward-outline" slot="end"></ion-icon>
        </ion-item>

        <ion-item *ngIf="results().length === 0 && searchTerm.length > 2" lines="none">
          <ion-label color="medium">Sonuç bulunamadı...</ion-label>
          <ion-button slot="end" fill="outline" (click)="addNewLanguage()">
            <ion-icon name="add" slot="start"></ion-icon> Yeni Oluştur
          </ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LanguageSelectorComponent implements OnInit {
  private languageService = inject(LanguageService);
  private modalCtrl = inject(ModalController);

  searchTerm: string = '';
  results = signal<ILanguage[]>([]);

  ngOnInit() {
    // İlk açılışta popüler olanları veya boş bir liste getirebilirsin
  }

  search(event: any) {
  const term = event.target.value.toLowerCase();
  if (term && term.length > 3) {
    // SEÇENEK A: Backend'den ara (Daha profesyonel)
    this.languageService.search({
      'query': term, // JHipster filtre yapısı (Eğer Filtering aktifse)
      size: 20
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
      this.languageService.search({
        'query': query,
        size: 10,
        sort: ['tr,asc']
      }).subscribe(res => {
        this.results.set(res.body ?? []);
      });
    } else {
      this.results.set([]);
    }
  }

  select(lang: ILanguage) {
    this.modalCtrl.dismiss(lang); // Seçilen dili geri gönder
  }

  async addNewLanguage() {
    // Eğer aradığını bulamazsa, senin yaptığın o güzel form modalını açalım
    const modal = await this.modalCtrl.create({
      component: LanguageFormComponent,
      componentProps: { 
        // Arama terimini formun içine default değer olarak paslayabiliriz
        language: { translateCode: this.searchTerm.toUpperCase(), tr: this.searchTerm } 
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