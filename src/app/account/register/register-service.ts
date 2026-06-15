import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Registration } from './register.model';
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
 
@Injectable({ providedIn: 'root' })
export class RegisterService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl =
    this.applicationConfigService.getEndpointFor('/api/register');
    // register.service.ts içindeki save metodu muhtemelen şöyledir:
    /*
save(user: any): Observable<any> {
  return this.http.post(this.resourceUrl, user, { responseType: 'text' }); 
  // 🔥 responseType: 'text' ekleyerek Angular'ın JSON beklemesini engelliyoruz.
}
/* */
  save(registration: any): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor('/api/register'), registration);
  }
  

    get(key: string): Observable<{}> {
    return this.http.get(this.applicationConfigService.getEndpointFor('api/activate'), {
      params: new HttpParams().set('key', key),
    });
  }

}
