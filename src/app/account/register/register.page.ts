import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { RegisterService } from './register-service';
import { OtpVerificationPage } from 'src/app/pages/otp-verification/otp-verification.page';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class RegisterPage implements OnInit {

  // Sınıfın içine ekle
  showPassword = false;
  registerForm!: FormGroup;
  private fb = inject(FormBuilder);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);
  private registerService = inject(RegisterService);
  private modalCtrl = inject(ModalController);

  constructor() {
    this.initForm();
  }

  ngOnInit() {}

  initForm() {
    this.registerForm = this.fb.group({
      // 5 ile başlayan 10 haneli telefon no (Örn: 5551234567)
      phoneNumber: ['', [Validators.required, Validators.pattern(/^5[0-9]{9}$/)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]], // Opsiyonel olduğu için sadece format kontrolü
      password: ['', [Validators.required, Validators.minLength(4)]],
      kvkkCheck: [false, [Validators.requiredTrue]], // KVKK zorunlu
      marketingCheck: [false] // Kampanya izni opsiyonel
    });
  }

  async onRegister() {
  if (this.registerForm.valid) {
    const userData = this.registerForm.value;
     this.completeRegistration(userData);
    // 1. Önce SMS'i gönder ve Modal'ı aç
    /*const modal = await this.modalCtrl.create({
      component: OtpVerificationPage,
      componentProps: { 
        phoneNumber: userData.phoneNumber // Parametre gönderiyoruz
      },
      backdropDismiss: false // Kod girmeden kaçamasın
    });

    await modal.present();

    // 2. Modal kapandığında dönen sonucu bekle
    const { data } = await modal.onDidDismiss();

    if (data && data.verified) {
      // 3. BİNGO! Telefon doğrulandı, şimdi asıl kaydı yapalım
      this.completeRegistration(userData);
    }/**/
  }
}

private completeRegistration(userData: any) {
  // Backend'e gidip DB'ye yazma vakti
  this.registerService.save(userData).subscribe({
    next: () => {
      console.log('Kayıt başarılı, lezzet dünyasına hoş geldin!');
      this.showSuccess('Kayıt başarılı, lezzet dünyasına hoş geldin!');
      this.navCtrl.navigateRoot('/login');
      this.modalCtrl.dismiss();
     // this.navCtrl.navigateRoot('/home');
    },
    error: () => this.showError('Kayıt sırasında bir hata oluştu.')
  });
} 

  async showError(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });
    await toast.present();
  }

    async showSuccess(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: 'success',
    });
    await toast.present();
  }

  goToLogin() {
    this.navCtrl.navigateBack('/login');
  }
}