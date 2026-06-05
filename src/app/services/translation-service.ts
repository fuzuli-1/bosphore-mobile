import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ApplicationConfigService } from '../core/config/application-config.service';
 
// Backend'den gelen nesnenin yapısı kanki
interface LanguageTranslationPayload {
  id: number;
  translateCode: string;
  desc: string;
  tr: string | null;
  en: string | null;
  fr: string | null;
  kz: string | null;
  an: string | null;
  isActive: boolean;
  groupCode: string | null;
  [key: string]: any; // Diğer null gelen ilişkiler için
}

@Injectable({ providedIn: 'root' })
export class TranslationService {

  private availableLangs: string[] = ["en", "tr", "de", "fr"];
  private fallbackLang = 'en';

  private currentLang$ = new BehaviorSubject<string>('en');
  
  // İçeride aramayı ışık hızında yapmak için düz bir key-value Map nesnesi tutuyoruz kanki
  // Örn: { "EMAIL_ADDRESS": "E-posta", "ENTER_YOUR_EMAIL_ADDRESS": "E-Posta Adresinizi Giriniz" }
  private translations = signal<{ [key: string]: string }>({}); 
  
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  
  constructor(private http: HttpClient) {}

  private get resourceUrl(): string {
    return this.applicationConfigService.getEndpointFor('/api/languages/translations');
  }

  /** ✔ kullanılabilir dilleri ekle */
  addLangs(langs: string[]) {
    this.availableLangs = langs;
  }

  /** ✔ fallback dili ayarla */
  setFallbackLang(lang: string) {
    this.fallbackLang = lang;
  }

  /** ✔ aktif dili değiştir ve backend’den yükle */
  use(lang: string): Promise<void> {
    if (!this.availableLangs.includes(lang)) {
      console.warn(`Language ${lang} not registered`);
    }
    this.currentLang$.next(lang);
    return this.load(lang);
  }

  /** ✔ backend’den çeviri çekme ve formata uydurma */
  private load(lang: string): Promise<void> {
    // Backend'deki Java metoduna artık dil parametresini basıyoruz
    const url = `${this.resourceUrl}?lang=${lang}`;
    console.log('🌐 Translation URL:', url);
    
    return new Promise((resolve, reject) => {
      this.http.get<LanguageTranslationPayload[]>(url).subscribe({
        next: (data: LanguageTranslationPayload[]) => {
          console.log(`✅ Çeviri listesi yüklendi: ${data?.length || 0} adet kayıt geldi.`);
          
          const parsedTranslations: { [key: string]: string } = {};
          
          if (Array.isArray(data)) {
            data.forEach(item => {
              // Eğer gelen kayıt aktifse ve bir çeviri kodu varsa işleme alıyoruz kanki
              if (item.isActive && item.translateCode) {
                // Seçili dildeki karşılığını al, eğer o dil null ise fallback dile (en) bak, o da yoksa boş string koy
                const translationValue = item[lang] || item[this.fallbackLang] || '';
                parsedTranslations[item.translateCode] = translationValue;
              }
            });
          }

          // Signal içerisine işlenmiş temiz Map'i gömüyoruz
          this.translations.set(parsedTranslations);
          resolve();
        },
        error: (err) => {
          console.error('❌ Çeviri hatası:', err.status, err.message, url);
          reject(err);
        }
      });
    });
  }
  
  /** ✔ Anında çeviri (Düz haritada aradığı için artık aşırı hızlı) */
  instant(code: string): string {
    const currentTranslations = this.translations();
    
    // Direkt key üzerinden vurup alıyoruz kanki, döngülere (find) gerek kalmadı
    if (currentTranslations && currentTranslations[code]) {
      return currentTranslations[code];
    }

    return code; // Çeviri bulunamazsa ekranda direkt KEY_NAME yazsın ki patlamasın
  }

  /** ✔ Template içi otomatik güncellenen versiyon (pipe gibi) */
  translateSignal = computed(() => {
    return (code: string) => this.instant(code);
  });
} 
 /*import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ApplicationConfigService } from '../core/config/application-config.service';
 

@Injectable({ providedIn: 'root' })
export class TranslationService {

  private availableLangs: string[] = ["en", "tr", "de", "fr"];
  private fallbackLang = 'en';

  private currentLang$ = new BehaviorSubject<string>('en');
  private translations = signal<{ [key: string]: any }>({}); 
  protected readonly applicationConfigService = inject(ApplicationConfigService);
 
  constructor(private http: HttpClient) {}


  // ✅ DOĞRU - her çağrıda güncel prefix'i al
private get resourceUrl(): string {
  return this.applicationConfigService.getEndpointFor('/api/languages/translations');
}

  /** ✔ kullanılabilir dilleri ekle *//*
  addLangs(langs: string[]) {
    this.availableLangs = langs;
  }

  /** ✔ fallback dili ayarla *//*
  setFallbackLang(lang: string) {
    this.fallbackLang = lang;
  }

  /** ✔ aktif dili değiştir ve backend’den yükle *//*
  use(lang: string): Promise<void> {
    if (!this.availableLangs.includes(lang)) {
      console.warn(`Language ${lang} not registered`);
    }
    this.currentLang$.next(lang);
    return this.load(lang);
  }

  /** ✔ backend’den çeviri çekme *//*
 private load(lang: string): Promise<void> {
  const url = `${this.resourceUrl}?lang=${lang}`;
  console.log('🌐 Translation URL:', url);  // ← hangi URL'e gidiyor
  
  return new Promise((resolve, reject) => {
    this.http.get(url).subscribe({
      next: (data: any) => {
        console.log('✅ Çeviri yüklendi:', Object.keys(data).length, 'anahtar');
        this.translations.set(data);
        resolve();
      },
      error: (err) => {
        console.error('❌ Çeviri hatası:', err.status, err.message, url);
        reject(err);
      }
    });
  });
}
  

  /** ✔ Anında çeviri *//*
  instant(code: string): string {
    const result = this.find(code, this.translations());
    if (result) return result;

    // fallback dili dene
    if (this.currentLang$.value !== this.fallbackLang) {
      return code; 
    }

    return code; // hiç yoksa key döner
  }

  /** ✔ Template içi otomatik güncellenen versiyon (pipe gibi) *//*
  translateSignal = computed(() => {
    return (code: string) => this.instant(code);
  });

  /** ✔ Ağaç içinde ara *//*
  private find(code: string, tree: any): string | null {
    for (const key of Object.keys(tree)) {
      if (typeof tree[key] === 'object') {
        const result = this.find(code, tree[key]);
        if (result) return result;
      } else {
        if (key === code) return tree[key];
      }
    }
    return null;
  }
 
}
/** */