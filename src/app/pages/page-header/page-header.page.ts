import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { fontAwesomeIcons } from 'src/app/config/font-awesome-icons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { MenuGroupsPage } from '../menu-groups/menu-groups.page';
 
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.page.html',
  styleUrls: ['./page-header.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule,IonicModule],
   schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
 
export class PageHeaderPage implements OnInit {
  private readonly iconLibrary = inject(FaIconLibrary);
  constructor() {
    this.iconLibrary.addIcons(...fontAwesomeIcons);
   }
  hasActiveCampaign = signal(true);
  activeCampaign = signal('50 TL İndirim!');
  currentLocation = signal('Kadıköy, İstanbul');
  cartItemCount = signal(3);
  
  // Kategoriler
  categories = signal([
    { id: 'kampanyalar', label: '🔥 Kampanyalar', icon: 'flame' },
    { id: 'pizzalar', label: '🍕 Pizzalar', icon: 'pizza' },
    { id: 'ekstralar', label: '🥤 Ekstralar & İçecekler', icon: 'fast-food' },
    { id: 'firsatlar', label: '🎯 Fırsatlar', icon: 'diamond' },
    { id: 'ayarlar', label: '⚙️ Ayarlar', icon: 'settings' }
  ]);

  ngOnInit() {
    // Lokasyon bilgisini al
    this.getUserLocation();
  }

  toggleMenu() {
    console.log('Menu toggled');
    // Side menu aç/kapat
  }

  selectLocation() {
    console.log('Select location');
    // Lokasyon seçim modal'ı aç
  }

  openSearch() {
    console.log('Open search');
    // Arama sayfasına git
  }

  openCart() {
    console.log('Open cart');
    // Sepet sayfasına git
  }

  openAccount() {
    console.log('Open account');
    // Hesap sayfasına git
  }

  closePromo() {
    this.hasActiveCampaign.set(false);
  }

  segmentChanged(event: any) {
    console.log('Segment changed to:', event.detail.value);
    // Kategori değişti, içeriği güncelle
  }

  private getUserLocation() {
    // Geolocation API veya kullanıcının kayıtlı lokasyonu
    // Örnek: localStorage'dan al
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      this.currentLocation.set(savedLocation);
    }
  }
}