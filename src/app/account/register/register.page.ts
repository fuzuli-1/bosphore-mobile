import { Component, inject, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import {IonicModule} from '@ionic/angular';
import { TranslatePipe } from 'src/app/services/TranslatePipe';
import { AccountService } from 'src/app/core/auth/account.service';
import { Account } from 'src/app/core/auth/account.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
         CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe]
})
export class RegisterPage implements OnInit {
   registerForm: FormGroup;

  private accountService = inject(AccountService);
  
    account: Signal<Account | null> =
    this.accountService.trackCurrentAccount();
    public account_=new Account(true,[],'','','','','','',null);
    
  constructor(private fb: FormBuilder) { 

    this.registerForm = this.fb.group({
      phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$')
      ]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.email],
      kvkk: [false, Validators.requiredTrue],
      campaign: [false]
    });
  }

  ngOnInit() {
  }

   submit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    console.log(this.registerForm.value);
  }

}
