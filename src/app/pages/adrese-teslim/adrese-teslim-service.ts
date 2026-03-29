import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdreseTeslimService {
  
  private deliveryType = new BehaviorSubject<string>('Adrese Teslim');
  currentType$ = this.deliveryType.asObservable();

  updateType(type: string) {
    this.deliveryType.next(type === 'delivery' ? 'Adrese Teslim' : 'Gel Al');
  }
  
}
