import { Component, inject, OnInit, signal } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
 
import { IMenuGroupItem } from 'src/app/interfaces/interfaces';
import { TranslatePipe } from 'src/app/services/TranslatePipe';
import { MenuGroupItemService } from '../../menu-grup/menu-group-item/menu-group-item-service';

@Component({
  selector: 'app-menu-group-item-selector',
  template: `
    <ion-header>
      <ion-toolbar color="tertiary">
        <ion-title> {{ 'SELECT_MENU_GROUP_ITEM' | translate }} </ion-title>  
        <ion-buttons slot="end">
          <ion-button (click)="cancel()"> {{ 'CLOSE' | translate }} </ion-button>
        </ion-buttons>  
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar   

          placeholder=" {{ 'SEARCH_MENU_GROUP_ITEM' | translate }}" 
          show-clear-button="always"
          [(ngModel)]="searchTerm"    
          (ionInput)="search($event)">
        </ion-searchbar>
      </ion-toolbar>
    </ion-header> 
    <ion-content>
      <ion-list>
        <ion-item button *ngFor="let item of results()" (click)="select(item)"> 
          <ion-label>
            <h2>{{ item.label }}</h2>
            <p>Target Category ID: {{ item.targetCategoryId }}</p>
          </ion-label>
          <ion-icon name="chevron-forward-outline" slot="end"></ion-icon>
        </ion-item>
        <ion-item *ngIf="results().length === 0 && searchTerm.length > 2" lines="none">
          <ion-label color="medium"> {{ 'NO_RESULTS_FOUND' | translate }} </ion-label>
        </ion-item>
 
      </ion-list>
    </ion-content>  

  `,
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslatePipe] 
})
export class MenuGroupItemSelectorComponent implements OnInit {

  private modalCtrl = inject(ModalController);
  private menuGroupItemService = inject(MenuGroupItemService);

  searchTerm: string = '';
  results = signal<IMenuGroupItem[]>([]);

  ngOnInit() {
    // İstersen başlangıçta popüler olanları veya boş bir liste getirebilirsin
  }

  search(event: any) {
    const term = event.target.value;
    if (term.length > 2) {
      this.menuGroupItemService.query({
        'query': term,
        'page': 0,
        'size': 20, 
      }).subscribe((res) => { 
          this.results.set(res.body ?? []);
      });
    } else {
      this.results.set([]);
    }
  }
  
  select(item: IMenuGroupItem) {
    this.modalCtrl.dismiss(item); // Seçilen öğeyi geri gönder
  }

  cancel() { this.modalCtrl.dismiss(); }
}