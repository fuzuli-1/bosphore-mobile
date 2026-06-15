import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class AppUtil {

  // Generates a UUID v4 compatible with crypto.randomUUID()
static generateUUID(): string {
  // Use native method if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation using crypto.getRandomValues()
  // Based on https://stackoverflow.com/a/2117523
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (crypto.getRandomValues(new Uint32Array(1))[0] * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


  private sanitizer = inject(DomSanitizer);

getImageUrl(apiUrl: string, imagePath: string | undefined): SafeUrl | string {
  if (!imagePath) {
    return 'assets/menus/default.png';
  } 
  
  if (imagePath.startsWith('http')) {
    return this.sanitizer.bypassSecurityTrustUrl(imagePath);
  } 

  // Çift slash (//) oluşmasını engellemek için temizlik yapıyoruz
  const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) :  apiUrl;
  const cleanPath = imagePath.startsWith('/') ? imagePath : '/' + imagePath;
  
  const finalUrl = `${baseUrl}${cleanPath}`;
  
  // Angular'a bu URL'e güvendiğimizi söylüyoruz (unsafe yazısını kaldırır)
  return this.sanitizer.bypassSecurityTrustUrl(finalUrl);

  }

}
