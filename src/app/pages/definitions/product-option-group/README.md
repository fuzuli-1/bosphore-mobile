# ProductOptionGroup – Angular 20 + Ionic CRUD

## Dosya Yapısı

```
product-option-group/
├── models/
│   └── product-option-group.model.ts       # Interface'ler
├── services/
│   └── product-option-group.service.ts     # HTTP servisi
├── pages/
│   ├── list/
│   │   ├── product-option-group-list.page.ts
│   │   ├── product-option-group-list.page.html
│   │   └── product-option-group-list.page.scss
│   └── form/
│       ├── product-option-group-form.page.ts   (Ekle + Düzenle)
│       ├── product-option-group-form.page.html
│       └── product-option-group-form.page.scss
├── app.routes.ts                            # Route tanımları
└── global.styles.scss                       # Global stil + CSS değişkenleri
```

## Kurulum

### 1. Paketi yükleyin
```bash
npm install @ionic/angular @ionic/angular/standalone ionicons
```

### 2. `app.config.ts` içine HTTP istemcisini ekleyin
```typescript
import { provideHttpClient } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideIonicAngular({ mode: 'ios' })
  ]
};
```

### 3. `angular.json` içindeki global stillere ekleyin
```json
"styles": [
  "src/global.styles.scss",
  "node_modules/@ionic/angular/css/core.css",
  "node_modules/@ionic/angular/css/ionic.bundle.css"
]
```

### 4. API URL'yi ayarlayın
`product-option-group.service.ts` içindeki `apiUrl` değişkenini kendi backend URL'nize göre güncelleyin:
```typescript
private apiUrl = 'http://localhost:8080/api';
```

## Beklenen Backend Endpoint'leri

| Method | URL                                    | Açıklama              |
|--------|----------------------------------------|-----------------------|
| GET    | /api/product-option-groups             | Tümünü listele        |
| GET    | /api/product-option-groups/{id}        | Tekil getir           |
| POST   | /api/product-option-groups             | Yeni ekle             |
| PUT    | /api/product-option-groups/{id}        | Güncelle              |
| DELETE | /api/product-option-groups/{id}        | Sil                   |
| GET    | /api/products                          | Ürün listesi          |
| GET    | /api/option-groups                     | Seçenek grubu listesi |

## Özellikler

- **Liste Sayfası:**
  - Pull-to-refresh (aşağı çekerek yenileme)
  - Arama / filtreleme
  - Swipe-to-delete ve swipe-to-edit (kaydırarak)
  - Skeleton loading animasyonu
  - Boş durum ekranı
  - İstatistik bar (toplam / gösterilen)
  - Renkli avatar initials

- **Form Sayfası (Ekle/Düzenle):**
  - Tek sayfa hem ekleme hem düzenleme
  - Canlı önizleme kartı
  - Kaydet butonu validasyon kontrolü
  - Action sheet ile seçim
  - Loading spinner

## Tasarım Teması

- **Renk paleti:** Koyu lacivert arka plan + turuncu vurgu (#FF6B35)
- **Font:** Sora (Google Fonts)
- **Köşeler:** Yuvarlak (14-20px border-radius)
- **Mod:** iOS mode (Ionic)
