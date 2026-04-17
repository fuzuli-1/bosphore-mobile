import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
 
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
 
@Injectable({ providedIn: 'root' })
export class OtpVerificationService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);
 
    get(key: string): Observable<{}> {
    return this.http.get(this.applicationConfigService.getEndpointFor('api/activate'), {
      params: new HttpParams().set('key', key),
    });
  }

}

