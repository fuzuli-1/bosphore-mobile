import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

 
import { ApplicationConfigService } from '../config/application-config.service';
import { StateStorageService } from './state-storage.service';
import { LoginVM } from 'src/app/pages/login/login.model';

type JwtToken = {
  id_token: string;
};

@Injectable({ providedIn: 'root' })
export class AuthServerProvider {
  private readonly http = inject(HttpClient);
  private readonly stateStorageService = inject(StateStorageService);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  getToken(): string {
    return this.stateStorageService.getAuthenticationToken() ?? '';
  }
  
login(credentials: LoginVM): Observable<void> {
  return this.http
    .post<JwtToken>(this.applicationConfigService.getEndpointFor('/api/authenticate'), credentials)
    .pipe(
      // ✅ map yerine switchMap + from kullan → async beklenir
      switchMap(response => from(this.authenticateSuccess(response, credentials.rememberMe)))
    );
}

// ✅ async Promise döndür
private async authenticateSuccess(response: JwtToken, rememberMe: boolean): Promise<void> {
  await this.stateStorageService.storeAuthenticationToken(response.id_token, rememberMe);
  // ↑ Token localStorage'a yazılana kadar bekler
}
  /*
  login(credentials: LoginVM): Observable<void> {
    return this.http
      .post<JwtToken>(this.applicationConfigService.getEndpointFor('/api/authenticate'), credentials)
      .pipe(map(response => this.authenticateSuccess(response, credentials.rememberMe)));
  }*/

  logout(): Observable<void> {
    return new Observable(observer => {
      this.stateStorageService.clearAuthenticationToken();
      observer.complete();
    });
  }

  /*
  private authenticateSuccess(response: JwtToken, rememberMe: boolean): void {
    this.stateStorageService.storeAuthenticationToken(response.id_token, rememberMe);
  }*/
}
