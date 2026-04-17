import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AccountService } from '../core/auth/account.service';
import { Observable,map } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {

  private account = inject(AccountService);
  private router = inject(Router);

 

  canActivate(): Observable<boolean> {
    // identity() bir Observable döndüğü için map ile içindeki veriye bakıyoruz
    return this.account.identity().pipe(
      map(identity => {
        const isAdmin = identity?.authorities?.includes('ROLE_ADMIN');
        if (isAdmin) {
          return true;
        }
        this.router.navigate(['/home']);
        return false;
      })
    );
  }

 /* canActivate(): boolean {
    const account = this.account.identity();

    let isAdmin =false;

      this.account.identity().subscribe((identity) => {
        isAdmin= identity?.authorities?.includes('ROLE_ADMIN') ? true : false;
      });

    if (isAdmin) {
      return true;
    }

    this.router.navigate(['/home']);
    return false;
  }*/
}