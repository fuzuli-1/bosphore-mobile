import { Component, inject, OnInit, signal } from '@angular/core';
import { ProductService } from './product-service';
import { IProduct } from 'src/app/interfaces/interfaces';
import { ModalController, AlertController, IonicModule } from '@ionic/angular';
import { ProductFormComponent } from './product-form';
import { TranslationService } from 'src/app/services/translation-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'products',
  templateUrl: './products.page.html',
  standalone: true,
  imports: [IonicModule,CommonModule]
})
export class ProductsPage implements OnInit {
  private productService = inject(ProductService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private translate = inject(TranslationService);

  products = signal<IProduct[]>([]);
  searchTerm: string = '';
  page = 0;
  itemsPerPage = 20; // Sabit boyutu buraya alalım
  isLastPage = false; // Veri bitti mi kontrolü

  ngOnInit() { 
    this.loadAll(); 
  }

  loadAll(event?: any) {
    // Eğer veri bittiyse ve infinite scroll tetiklendiyse durdur
    if (this.isLastPage && event) {
      event.target.disabled = true;
      return;
    }

    const queryParams: any = {
      page: this.page,
      size: this.itemsPerPage,
      sort: ['id,desc']
    };

    if (this.searchTerm) {
      queryParams['name'] = this.searchTerm;
    }

    this.productService.query(queryParams).subscribe({
      next: (res) => {
        const data = res.body ?? [];
        
        // Gelen veri sayfa boyutundan azsa "son sayfadayız" demektir
        if (data.length < this.itemsPerPage) {
          this.isLastPage = true;
        }

        if (this.page === 0) {
          this.products.set(data);
        } else {
          // Önceki verilerin üzerine yeni gelenleri ekle
          this.products.set([...this.products(), ...data]);
        }

        // Başarılıysa sayfa numarasını bir sonraki için hazırla
        this.page++;

        if (event) {
          event.target.complete();
          // Veri bittiyse infinite scroll'u tamamen kapat
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
    this.resetList(); // Arama yapınca her şeyi sıfırla
    this.loadAll();
  }

    // Listeyi baştan yüklemek için yardımcı metod
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

    modal.onDidDismiss().then(res => { if (res.data) this.loadAll(); });
    return await modal.present();

  }

  async delete(id: number) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant('delete'),
      message: this.translate.instant('CONFIRM_DELETE'),
      buttons: [
        { text: this.translate.instant('cancel'), role: 'cancel' },
        { text: this.translate.instant('delete'), handler: () => {
          this.resetList();
          this.productService.delete(id).subscribe(() => this.loadAll()) 

          }          
        }
      ]
    });
    await alert.present();
  }
}