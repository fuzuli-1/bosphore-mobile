import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { EntityArrayResponseType, LanguageService } from './language-service';
import { ILanguage } from 'src/app/interfaces/interfaces';
import { LanguageFormComponent } from './language-form.component';

@Component({
  selector: 'app-language',
  templateUrl: './language.page.html',
  styleUrls: ['./language.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LanguagePage implements OnInit {

  private languageService = inject(LanguageService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  languages = signal<ILanguage[]>([]);
  searchTerm = ''; // Arama terimi için
  totalItems = 0;
  itemsPerPage = 20;
  page = 0;

  constructor() {}

  ngOnInit() {
    this.loadLanguages();
  }

  // Arama inputu değiştikçe tetiklenir
  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.page = 0; // Her aramada ilk sayfaya dön
    this.loadLanguages();
  }

  loadLanguages(): void {
    const queryParams: any = {
      page: this.page,
      size: this.itemsPerPage,
      sort: ['id,asc'],
    };

    // Eğer arama terimi varsa 'search' servisini, yoksa standart 'query' servisini kullan
    if (this.searchTerm && this.searchTerm.length > 2) {
      queryParams['query'] = this.searchTerm;
      this.languageService.search(queryParams).subscribe((res: EntityArrayResponseType) => {
        this.handleResponse(res);
      });
    } else {
      this.languageService.query(queryParams).subscribe((res: EntityArrayResponseType) => {
        this.handleResponse(res);
      });
    }
  }

  private handleResponse(res: EntityArrayResponseType): void {
    this.languages.set(res.body ?? []);
    this.totalItems = Number(res.headers.get('X-Total-Count'));
  }

  /*
  loadLanguages(): void {
    this.languageService
      .query({
        page: this.page,
        size: this.itemsPerPage,
        sort: ['id,asc'],
      })
      .subscribe((res: EntityArrayResponseType) => {
        this.languages.set(res.body ?? []);
        this.totalItems = Number(res.headers.get('X-Total-Count'));
      });
  }*/

  async openLanguageModal(language?: ILanguage): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: LanguageFormComponent,
      componentProps: { language: language || null },
    });
    await modal.present();

    await modal.onWillDismiss().then((res) =>{
        if(res?.data) {
          this.loadLanguages();
        }
    });
 

  }



  async deleteLanguage(language: ILanguage): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Confirm delete',
      message: `${language.translateCode} silinecek!`,      
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },  
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.languageService.delete(language.id).subscribe(() => {
              this.loadLanguages();
            });
          },
        },
      ],    
    });
    await alert.present();
  }

  nextPage(): void {
    if ((this.page + 1) * this.itemsPerPage < this.totalItems) {
      this.page++;
      this.loadLanguages();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadLanguages();
    }
  }

  goBack() {
    window.history.back();
}

}
