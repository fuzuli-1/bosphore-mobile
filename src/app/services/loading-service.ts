import { inject, Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  isLoading = false;
  public loadingController = inject(LoadingController);
  constructor() {}

  async present() {
    this.isLoading = true;
    return await this.loadingController
      .create({
        // duration: 5000,
        message: 'Loading..',
      })
      .then(a => {
        a.present().then(() => {
          console.log('presented');
          if (!this.isLoading) {
            a.dismiss().then(() => console.log('abort presenting'));
          }
        });
      });
  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingController.dismiss().then(() => console.log('dismissed'));
  }
}
