import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AdminCredentials } from '../../../models/admin.model';
import { AuthService } from '../../../core/authentication/auth.service';

@Component({
  selector: 'cc-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]]
    });
  }

  ngOnInit(): void {}

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
    const hasUpperCase = /[A-Z]+/.test(value);
    const hasLowerCase = /[a-z]+/.test(value);
    const hasNumeric = /[0-9]+/.test(value);
  
    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric;
  
    return !passwordValid ? { passwordStrength: true } : null;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const credentials: AdminCredentials = {
        email: email.toLowerCase(),
        password: password
      }
      this.authService.login(credentials).subscribe({
        next: () => {
          this.router.navigate(['/admin']);
        },
        error: (err) => this.errorMessage = 'Invalid email or password'
      });
    }
  }
}