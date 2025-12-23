import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Registration } from './register.model';
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';
import { Observable } from 'rxjs';

 
@Injectable({ providedIn: 'root' })
export class RegisterService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  save(registration: Registration): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor('/register'), registration);
  }
  
}
