import { Component, OnInit, inject } from '@angular/core';
import { Auth, signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult } from '@angular/fire/auth'; // 🔥 Mutlaka @angular/fire/auth'dan gelsin
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgZone } from '@angular/core';
@Component({
  selector: 'app-otp-verification',
  templateUrl: './otp-verification.page.html',
  styleUrls: ['./otp-verification.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class OtpVerificationPage implements OnInit {

  // 1. Angular'ın main.ts'de hazırladığı Auth instance'ını inject ediyoruz
  private auth = inject(Auth);
  private zone = inject(NgZone); // 🔥 Zone'u ekle
  private modalCtrl = inject(ModalController);

  phoneNumber: string = ''; // Register'dan gelen no
  otpCode: string = '';
  confirmationResult: ConfirmationResult | null = null;
  recaptchaVerifier: RecaptchaVerifier | null = null;

  ngOnInit() {
    // Sayfa açılır açılmaz SMS gönderimini tetikle
    setTimeout(() => {
      this.setupReCaptcha();
    }, 500);
  }

 setupReCaptcha() {
    // Firebase işlemlerini Angular Zone içinde çalıştırarak uyarıyı keseriz
    this.zone.run(() => {
      this.recaptchaVerifier = new RecaptchaVerifier(this.auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          console.log('ReCaptcha tamam kanki!');
        }
      });
    });
    // 🔥 KRİTİK DOKUNUŞ: ReCaptcha hazır olunca hemen SMS gönder
      this.sendOtp();
  }

  // ... diğer her şey aynı ...

async resendCode() {
  console.log("Kanki SMS gelmedi, simülasyonu başlatıyorum...");
  
  // 1. Kullanıcıya bir geri bildirim verelim (Ionic Toast veya Loading)
  // Şimdilik konsola yazıyoruz
  
  // 2. 10 saniye bekletme (Opsiyonel, istersen direkt yap)
  setTimeout(() => {
    // 3. OTP kodunu sanki SMS gelmiş gibi biz dolduruyoruz
    // Eğer test numarası eklediysen o kodu, eklemediysen backend'in beklediği kodu yaz
    this.otpCode = "123456"; 
    
    console.log("Simülasyon tamam, kod dolduruldu: ", this.otpCode);

    // 4. Otomatik olarak doğrulama metodunu çağırıyoruz
    // Not: Firebase üzerinden gerçek onay gelmeyeceği için 
    // burayı 'bypass' etmemiz gerekebilir.
    this.bypassAndVerify(); 
  }, 1000); // 10 saniye bekleme süresi
}

// Firebase'i atlayıp direkt backend'e gitmek için
private bypassAndVerify() {
  // Firebase 'confirm' metodunu çağırmıyoruz çünkü SMS gelmedi
  // Direkt Modal'ı kapatıp asıl register işlemini tetikliyoruz
  this.modalCtrl.dismiss({ 
    verified: true, 
    uid: 'simulated-user-id-' + Math.random().toString(36).substr(2, 9) 
  });
}
  /*
  resendCode() {
    // ReCaptcha'yı sıfırla ve tekrar SMS gönder
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.setupReCaptcha();
    }
  }*/

  async sendOtp() {
    debugger;
    if (!this.recaptchaVerifier) return;
    
    try {
      // Türkiye kodu +90 eklemeyi unutma
      const formattedPhone = `+90${this.phoneNumber}`;
      this.confirmationResult = await signInWithPhoneNumber(this.auth, formattedPhone, this.recaptchaVerifier);
      console.log('🔥 SMS Gönderildi!');
    } catch (error) {
      console.error('SMS Hatası:', error);
    }
  }

  async verifyOtp() {
    if (!this.confirmationResult || this.otpCode.length !== 6) return;

    try {
      const result = await this.confirmationResult.confirm(this.otpCode);
      if (result.user) {
        // BAŞARILI: Modal'ı kapat ve register'a haber ver
        this.modalCtrl.dismiss({ verified: true, uid: result.user.uid });
      }
    } catch (error) {
      console.error('Doğrulama Hatası:', error);
    }
  }

  checkOtpLength() {
  // 1. Eğer kullanıcı 6 haneden fazla girmeye çalışırsa engelle (güvenlik önlemi)
  if (this.otpCode && this.otpCode.toString().length > 6) {
    this.otpCode = (this.otpCode.toString().substring(0, 6));
  }

  // 2. Eğer tam 6 haneye ulaştıysa kullanıcıyı yormadan direkt doğrula!
  if (this.otpCode && this.otpCode.toString().length === 6) {
    this.verifyOtp(); // Butona basmasına gerek kalmadı, sistem tetiklendi
  }
}
}