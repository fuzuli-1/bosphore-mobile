import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class FooterService {
  private footerData$ = new BehaviorSubject<any>({});
  private degisti$ = new BehaviorSubject<any>({});

  constructor() {}

  setData(mydata: any) {
    this.footerData$.next(mydata);
  }

  getData(): Observable<any> {
    return this.footerData$.asObservable();
  }

  setAvatar(myavatar: any) {
    this.degisti$.next(myavatar);
  }
  getAvatar(): Observable<any> {
    return this.degisti$.asObservable();
  }
}
