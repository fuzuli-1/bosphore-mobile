import { inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AccountService } from '../core/auth/account.service';
import { StateStorageService } from '../core/auth/state-storage.service';
 

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  private account = inject(AccountService);
  private router = inject(Router);
  private storageService = inject(StateStorageService);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.check(state.url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.check(state.url);
  }

  private check(currentUrl: string): Observable<boolean> {
  if (currentUrl.includes('/login')) return of(true);

  // ✅ APP_INITIALIZER zaten token'ı eşitledi ve cache'e aldı
  // Burada sadece cache'den oku — HTTP isteği YOK
  return this.account.identity().pipe(
    take(1),
    map(account => {
      if (account) return true;
      this.router.navigate(['/login']);
      return false;
    })
  );
}
  // auth.guard.ts veya ilgili guard dosyanızın check metodu
/*private check(currentUrl: string): Observable<boolean> {
  console.log('AUTH GUARD CALISTI - Hedef Rota:', currentUrl);

  if (currentUrl.includes('/login')) {
    return of(true);
  }

  // Önce asenkron mobil token eşitlemesini bekle
  return from(this.storageService.getAuthenticationTokenMobile()).pipe(
    switchMap(() => {
      // 🟢 BURAYA 'true' PARAMETRESİNİ EKLEDİK: identity(true)
      // Böylece cache'lenmiş eski null durumunu geçip hafızadaki yeni token ile kimliği zorlar
      return this.account.identity(true).pipe(
        map(account => {
          if (account) {
            return true;
          }
          console.warn('Kimlik doğrulanamadı, login sayfasına yönlendiriliyor.');
          this.router.navigate(['/login']);
          return false;
        })
      );
    })
  );
 }*/
}