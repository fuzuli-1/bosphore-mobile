import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';

import { RegisterService } from './register-service';
import { TranslatePipe } from '../../services/TranslatePipe';
import {
  IonContent,
  IonInput,
  IonButton,
  IonCheckbox,
  IonLabel,
  IonIcon,
  IonItem,
  IonSpinner,
  NavController,
  ToastController,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslationService } from 'src/app/services/translation-service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonInput, IonButton, IonCheckbox,
    IonLabel, IonIcon, IonItem, IonSpinner,
    CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe,
  ],
})
export class RegisterPage implements OnInit {
  showPassword = false;
  isLoading = false;
  registerForm!: FormGroup;

  private fb = inject(FormBuilder);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);
  private registerService = inject(RegisterService);
  private modalCtrl = inject(ModalController);
  private ts = inject(TranslationService);

  constructor() {
    this.initForm();
  }

  ngOnInit() {}

  initForm() {
    this.registerForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^0[67][0-9]{8}$/)]],
      firstName:   ['', [Validators.required, Validators.minLength(2)]],
      lastName:    ['', [Validators.required, Validators.minLength(2)]],
      // ✅ email opsiyonel — Validators.email sadece dolu ise çalışır
      email:       ['', [Validators.email]],
      password:    ['', [Validators.required, Validators.minLength(4)]],
      kvkkCheck:   [false, [Validators.requiredTrue]],
      marketingCheck: [false],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      Object.values(this.registerForm.controls).forEach(c => c.markAsTouched());
      await this.showToast(this.ts.instant('REQUIRED_FIELDS'), 'danger');
      return;
    }

    this.isLoading = true;
    const raw = this.registerForm.value;

    const userData = {
      phoneNumber:     raw.phoneNumber,
      firstName:       raw.firstName.trim(),
      lastName:        raw.lastName.trim(),
      // ✅ Boş string → null gönder, backend @Size(min=5) patlamasın
      email:           raw.email?.trim() || null,
      password:        raw.password,
      kvkkCheck:       raw.kvkkCheck,
      marketingCheck:  raw.marketingCheck,
    };

    this.registerService.save(userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.showToast(this.ts.instant('REGISTER_SUCCESS'), 'success');
        this.navCtrl.navigateRoot('/login');
        this.modalCtrl.dismiss();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.detail ?? this.ts.instant('REGISTER_ERROR');
        this.showToast(msg, 'danger');
      },
    });
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  getErrorMessage(controlName: string, labelKey: string): string {
    const control = this.registerForm.get(controlName);
    if (!control?.errors) return '';

    const label = this.ts.instant(labelKey);

    if (control.errors['required'])   return `${label} ${this.ts.instant('IS_REQUIRED')}`;
    if (control.errors['minlength'])  return `${label} ${this.ts.instant('AT_LEAST')} ${control.errors['minlength'].requiredLength} ${this.ts.instant('CHARACTER')}`;
    if (control.errors['email'])      return this.ts.instant('ENTER_VALID_EMAIL_ADDRESS');
    if (control.errors['pattern'])    return `${label} ${this.ts.instant('FORMAT_INVALID')}`;

    return '';
  }

  goToLogin() {
    this.modalCtrl.dismiss();
    this.navCtrl.navigateRoot('/login');
  }
}