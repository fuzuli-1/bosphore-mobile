import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class StateStorageService {
  private readonly previousUrlKey = 'previousUrl';
  private readonly authenticationKey = 'jhi-authenticationToken';
  private readonly localeKey = 'locale';

  // --- URL YÖNETİMİ ---
  async storeUrl(url: string): Promise<void> {
    const urlStr = JSON.stringify(url);
    sessionStorage.setItem(this.previousUrlKey, urlStr);
    await Preferences.set({ key: this.previousUrlKey, value: urlStr });
  }

  // Senkron çalışan eski metot (Web geçişleri veya ilk yüklemeler için)
  getUrl(): string | null {
    const previousUrl = sessionStorage.getItem(this.previousUrlKey);
    return previousUrl ? (JSON.parse(previousUrl) as string | null) : previousUrl;
  }

  // Mobil için Asenkron Garanti Metot
  async getUrlMobile(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.previousUrlKey });
    return value ? (JSON.parse(value) as string | null) : null;
  }

  async clearUrl(): Promise<void> {
    sessionStorage.removeItem(this.previousUrlKey);
    await Preferences.remove({ key: this.previousUrlKey });
  }

  // --- TOKEN / OTURUM YÖNETİMİ (En Kritik Kısım) ---
  async storeAuthenticationToken(authenticationToken: string, rememberMe: boolean): Promise<void> {
    const tokenStr = JSON.stringify(authenticationToken);
    await this.clearAuthenticationToken();

    // 1. Web uyumluluğu için mevcut yapı korunsun
    if (rememberMe) {
      localStorage.setItem(this.authenticationKey, tokenStr);
    } else {
      sessionStorage.setItem(this.authenticationKey, tokenStr);
    }

    // 2. Mobil için Preferences katmanına KALICI olarak yazıyoruz (rememberMe bağımsız)
    // Mobilde kullanıcı uygulamayı kapatana kadar her türlü hatırlanmak ister.
    await Preferences.set({ key: this.authenticationKey, value: tokenStr });
  }

  // Senkron çalışan eski metot (Mevcut Interceptor yapılarının bozulmaması için)
  getAuthenticationToken(): string | null {
    const authenticationToken = localStorage.getItem(this.authenticationKey) ?? sessionStorage.getItem(this.authenticationKey);
    return authenticationToken ? (JSON.parse(authenticationToken) as string | null) : authenticationToken;
  }

  // Mobil için Asenkron Garanti Metot (Uygulama açılışında kontrol etmek için en güvenlisi)
  async getAuthenticationTokenMobile(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.authenticationKey });
    if (value) {
      // Eğer local/session boşsa Preferences'tan çekip web hafızasını da besleyelim (Senkron yapılar düşmesin)
      if (!localStorage.getItem(this.authenticationKey)) {
        localStorage.setItem(this.authenticationKey, value);
      }
      return JSON.parse(value) as string | null;
    }
    return null;
  }

  async clearAuthenticationToken(): Promise<void> {
    sessionStorage.removeItem(this.authenticationKey);
    localStorage.removeItem(this.authenticationKey);
    await Preferences.remove({ key: this.authenticationKey });
  }

  // --- DİL YÖNETİMİ ---
  async storeLocale(locale: string): Promise<void> {
    sessionStorage.setItem(this.localeKey, locale);
    await Preferences.set({ key: this.localeKey, value: locale });
  }

  getLocale(): string | null {
    return sessionStorage.getItem(this.localeKey);
  }

  // Mobil için Asenkron Garanti Metot
  async getLocaleMobile(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.localeKey });
    if (value && !sessionStorage.getItem(this.localeKey)) {
      sessionStorage.setItem(this.localeKey, value);
    }
    return value;
  }

  async clearLocale(): Promise<void> {
    sessionStorage.removeItem(this.localeKey);
    await Preferences.remove({ key: this.localeKey });
  }

  isTokenExpired(): boolean {
  const token = this.getAuthenticationToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expMs = payload.exp * 1000; // saniye → milisaniye
    return Date.now() >= expMs;
  } catch {
    return true; // decode edilemiyorsa geçersiz say
  }
}
}
