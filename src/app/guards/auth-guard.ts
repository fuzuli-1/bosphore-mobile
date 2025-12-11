import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StateStorageService } from '../core/auth/state-storage.service';
import { AccountService } from '../core/auth/account.service';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private account  = inject(AccountService);

  constructor(private router: Router) {}

  canActivate(): boolean {
   
    if (this.account.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
