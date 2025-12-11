 import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { ApplicationConfigService } from '../core/config/application-config.service';
 

@Injectable({ providedIn: 'root' })
export class TranslationService {

  private availableLangs: string[] = ["en", "tr", "de", "fr"];
  private fallbackLang = 'tr';

  private currentLang$ = new BehaviorSubject<string>('tr');
  private translations = signal<{ [key: string]: any }>({}); 
  protected readonly applicationConfigService = inject(ApplicationConfigService);
 protected resourceUrl = this.applicationConfigService.getEndpointFor('/languages/translations');
  constructor(private http: HttpClient) {}

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

  /** ✔ backend’den çeviri çekme */
  private load(lang: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get(`${this.resourceUrl}?lang=${lang}`)       
        .subscribe({
          next: (data: any) => {
            this.translations.set(data);
            resolve();
          },
          error: (err) => {
            console.error('Translation load error:', err);
            reject(err);
          }
        });
    });
  }
  

  /** ✔ Anında çeviri */
  instant(code: string): string {
    const result = this.find(code, this.translations());
    if (result) return result;

    // fallback dili dene
    if (this.currentLang$.value !== this.fallbackLang) {
      return code; 
    }

    return code; // hiç yoksa key döner
  }

  /** ✔ Template içi otomatik güncellenen versiyon (pipe gibi) */
  translateSignal = computed(() => {
    return (code: string) => this.instant(code);
  });

  /** ✔ Ağaç içinde ara */
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
