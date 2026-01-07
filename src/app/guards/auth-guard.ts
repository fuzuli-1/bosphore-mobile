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
}
