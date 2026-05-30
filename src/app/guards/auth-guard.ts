import { inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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

  // auth.guard.ts veya ilgili guard dosyanızın check metodu
private check(currentUrl: string): Observable<boolean> {
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
}

  /*
  private check(currentUrl: string): Observable<boolean> {
    console.log('AUTH GUARD CALISTI - Hedef Rota:', currentUrl);

    // 1. Eğer kullanıcı zaten login sayfasına gitmeye çalışıyorsa kontrolü atla, sonsuz döngüyü kır
    if (currentUrl.includes('/login')) {
      return of(true);
    }

    // 2. Önce asenkron olarak Preferences'taki token'ı web hafızasına (localStorage) eşitleyin
    return from(this.storageService.getAuthenticationTokenMobile()).pipe(
      switchMap(() => {
        // 3. Hafıza eşitlendikten sonra mevcut identity kontrolünü güvenle çalıştırın
        return this.account.identity().pipe(
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
  }/** */
}


/*
import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AccountService } from '../core/auth/account.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private account = inject(AccountService);
  private router = inject(Router);

 
  canActivate(): Observable<boolean> {
    console.log("AUTH GUARD CALISTI");
    return this.account.identity().pipe(
      map(account => {
        if (account) {
          return true;
        }

        this.router.navigate(['/login']);
        return false;
      })
    );
  }
}/** */
