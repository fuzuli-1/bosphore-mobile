import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonNote,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonBadge,
  IonSearchbar,
  IonChip,
  IonAvatar,
  IonText,
  AlertController,
  ToastController,
  LoadingController,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  trash,
  create,
  layersOutline,
  cubeOutline,
  optionsOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { IProductOptionGroup } from 'src/app/interfaces/interfaces';
import { ProductOptionGroupService } from '../pages/product-option-group.service';
 

@Component({
  selector: 'app-product-option-group-list',
  templateUrl: './product-option-group-list.page.html',
  styleUrls: ['./product-option-group-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    IonNote,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonBadge,
    IonSearchbar,
    IonChip,
    IonAvatar,
    IonText,
  ],
})
export class ProductOptionGroupListPage implements OnInit {
  items: IProductOptionGroup[] = [];
  filtered: IProductOptionGroup[] = [];
  isLoading = true;
  searchTerm = '';
  private service = inject(ProductOptionGroupService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private navCtrl = inject(NavController);

  constructor() {
    addIcons({
      add,
      trash,
      create,
      layersOutline,
      cubeOutline,
      optionsOutline,
      chevronForwardOutline,
    });
  }

  ngOnInit() {
    this.load();
  }

  async load(event?: any) {
    this.isLoading = !event;
    this.service.query().subscribe({
      next: (data) => {
        this.items = data.body ?? [];
        this.filtered = data.body ?? [];
        this.isLoading = false;
        event?.target?.complete();
      },
      error: (err:any) => {
        this.isLoading = false;
        event?.target?.complete();
        this.showToast('Veriler yüklenemedi', 'danger');
      }
    } );
  }

  onSearch(event: any) {
    const term = event.target.value?.toLowerCase() ?? '';
    this.filtered = this.items.filter(
      (i) =>
        i.product?.name?.toLowerCase().includes(term) ||
        i.optionGroup?.name?.toLowerCase().includes(term),
    );
  }

  goToAdd() {
     this.navCtrl.navigateForward(['/product-option-group/new']);  // ✅ tekil
  }

  goToEdit(id: number) {
    this.navCtrl.navigateForward(['/product-option-group/edit', id]);  // ✅ tekil
  }

  async confirmDelete(item: IProductOptionGroup, slidingItem: any) {
    await slidingItem.close();
    const alert = await this.alertCtrl.create({
      header: 'Silme Onayı',
      message: `<strong>${item.product?.name}</strong> ürününün <strong>${item.optionGroup?.name}</strong> seçenek grubunu silmek istediğinize emin misiniz?`,
      cssClass: 'custom-alert',
      buttons: [
        { text: 'İptal', role: 'cancel', cssClass: 'alert-cancel' },
        {
          text: 'Sil',
          cssClass: 'alert-danger',
          handler: () => this.deleteItem(item.id!),
        },
      ],
    });
    await alert.present();
  }

  async deleteItem(id: number) {
    const loading = await this.loadingCtrl.create({ message: 'Siliniyor...' });
    await loading.present();
    this.service.delete(id).subscribe({
      next: () => {
        loading.dismiss();
        this.items = this.items.filter((i) => i.id !== id);
        this.filtered = this.filtered.filter((i) => i.id !== id);
        this.showToast('Başarıyla silindi', 'success');
      },
      error: () => {
        loading.dismiss();
        this.showToast('Silme işlemi başarısız', 'danger');
      },
    });
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 2500,
      position: 'bottom',
      cssClass: 'custom-toast',
    });
    await toast.present();
  }

  getInitials(name: string): string {
    return (
      name
        ?.split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() ?? '?'
    );
  }

  getAvatarColor(name: string): string {
    if (!name) return '#ccc';
    const colors = [
      '#E8552A',
      '#2A7BE8',
      '#2AE87B',
      '#E8C42A',
      '#9B2AE8',
      '#E82A9B',
    ];
    const idx = (name?.charCodeAt(0) ?? 0) % colors.length;
    return colors[idx];
  }
}
