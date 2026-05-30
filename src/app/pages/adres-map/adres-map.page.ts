import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController} from '@ionic/angular';
import L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { TranslatePipe } from "../../services/TranslatePipe";
@Component({
  selector: 'app-adres-map',
  templateUrl: './adres-map.page.html',
  styleUrls: ['./adres-map.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, TranslatePipe]
})
export class AdresMapPage implements OnInit, AfterViewInit {

 protected readonly http = inject(HttpClient);
 private modalCtrl = inject(ModalController);
  map!: L.Map;
  selectedCoords: { lat: number; lng: number } = { lat: 41.0082, lng: 28.9784 }; // Varsayılan İstanbul
  currentAddressText: string="";

  ngOnInit(): void {
    // Kullanıcının mevcut konumunu alalım
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.selectedCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.getAddressFromCoords(this.selectedCoords.lat, this.selectedCoords.lng);  
      });
    }
  }

  ngAfterViewInit() {
    this.initMap();
  }

  initMap() {
    this.map = L.map('map').setView([this.selectedCoords.lat, this.selectedCoords.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Harita her hareket ettiğinde merkez koordinatını güncelle
    this.map.on('moveend', () => {
      const center = this.map.getCenter();
      this.selectedCoords = { lat: center.lat, lng: center.lng };
      console.log('Yeni Koordinatlar:', this.selectedCoords);
      // Burada koordinatı adrese çeviren (Reverse Geocoding) servis çağrılabilir
    });
  }

  // ionViewDidEnter: Ionic modalı tamamen açıldığında çağrılır
  ionViewDidEnter() {
    this.fixMapRendering();
  }

  // EN KRİTİK BÖLÜM: Haritayı düzelten metod
  private fixMapRendering() {
    if (this.map) {
      // 200 milisaniye bekle (modal animasyonu tamamlansın)
      setTimeout(() => {
        // Haritaya "boyutlarını yeniden kontrol et" talimatı ver
        this.map.invalidateSize();
        // Haritayı merkeze geri odakla (opsiyonel ama önerilir)
        this.map.setView([this.selectedCoords.lat, this.selectedCoords.lng], 13);
      }, 200); 
    }
  }

  locateUser() {
    this.map.locate({ setView: true, maxZoom: 16 });
  }

  saveAndContinue() {
    // Koordinatları alıp bir sonraki forma (Bina no, Kat, Daire) aktaralım
    this.modalCtrl.dismiss({
      location: this.selectedCoords,
      fullAddress: this.currentAddressText
    });
  }

  getAddressFromCoords(lat: number, lng: number) {
  this.http.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    .subscribe((data: any) => {
      this.currentAddressText = data.display_name;
    });
  }

  /*
  verileri text'ten al 
  sorgula 
  sonuclari local dataya kaydet
  haritaya koordinatları gönder 
  haritayı yeni koordinatlara taşı
  haritayı modal içinde düzgün göstermek için invalidateSize() metodunu kullan
  haritayı yeni koordinatlara odakla
  */
 searchAddress($event: any) {
   const query = $event.detail.value;
   if (query && query.length > 3) { // 3 karakterden sonra arama başlasın
      this.http.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1&limit=1`)
        .subscribe((data: any) => {
          if (data.length > 0) {
            const result = data[0];
            const newCoords = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
            
            this.selectedCoords = newCoords;

            // KRİTİK: Haritayı yeni konuma yumuşak bir geçişle taşı
            this.map.flyTo([newCoords.lat, newCoords.lng], 16, {
              animate: true,
              duration: 1.5
            });

            // Opsiyonel: Adres bilgisini bir değişkende tutup input'u güncelleyebilirsiniz
            this.currentAddressText = result.display_name;
          }
        });
    }
  }

  close() {
    this.modalCtrl.dismiss();

  }

}