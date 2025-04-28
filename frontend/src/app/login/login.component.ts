import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  animations: [
    trigger('formState', [
      state('login', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      state('register', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition('login => register', [
        style({ opacity: 1, transform: 'translateX(0)' }),
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-100%)' })),
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition('register => login', [
        style({ opacity: 1, transform: 'translateX(0)' }),
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(100%)' })),
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  currentState = 'login';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
    
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), 
                       Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
      role: ['seeker', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole(this.authService.getUserRole());
    }
  }

  // Toggle between login and register forms
  toggleForm(): void {
    this.currentState = this.currentState === 'login' ? 'register' : 'login';
    this.clearMessages();
  }

  // Handle login form submission
  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.clearMessages();
      
      const credentials = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };
      
      this.authService.login(credentials).subscribe(
        response => {
          this.isLoading = false;
          this.successMessage = 'Login successful! Redirecting...';
          
          // Clear form after successful login
          this.loginForm.reset();
          
          // Redirect based on user role
          const userRole = response.user.role;
          
          // Delay navigation to show success message
          setTimeout(() => {
            this.redirectBasedOnRole(userRole);
          }, 1500);
        },
        error => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        }
      );
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  // Redirect users based on their role
  redirectBasedOnRole(role: string): void {
    switch (role) {
      case 'counselor':
        this.router.navigate(['/counsellor-sessions']);
        break;
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'seeker':
      default:
        this.router.navigate(['/userdash']);
        break;
    }
  }

  // Handle register form submission
  onRegister(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.clearMessages();
      
      const userData = {
        name: this.registerForm.get('name')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value,
        role: this.registerForm.get('role')?.value
      };
      
      this.authService.register(userData).subscribe(
        response => {
          this.isLoading = false;
          this.successMessage = 'Registration successful! Redirecting to profile setup...';
          
          // Clear the registration form
          this.registerForm.reset({
            role: 'seeker'
          });
          
          // After registration, redirect to profile page with firstLogin flag
          setTimeout(() => {
            // Store user data from registration response if provided
            if (response && response.user) {
              localStorage.setItem('user', JSON.stringify(response.user));
              localStorage.setItem('currentUser', JSON.stringify(response.user));
              // Update the ProfileService with the new user data
              this.profileService.updateUser(response.user);
            }
            
            // Navigate to profile with firstLogin parameter
            this.router.navigate(['/profile'], { 
              queryParams: { 
                firstLogin: 'true',
                userId: response.user?.userId || response.userId
              } 
            });
          }, 1500);
        },
        error => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      );
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  // Password match validator
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  // Clear notification messages
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Mark all controls in a form group as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Form validation helper
  hasError(form: FormGroup, controlName: string, errorName: string): boolean {
    return form.get(controlName)?.touched && form.get(controlName)?.hasError(errorName) || false;
  }

  // Get password strength text
  getPasswordStrengthText(): string {
    const password = this.registerForm.get('password')?.value;
    if (!password) return '';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    switch (strength) {
      case 0:
      case 1: return 'Weak';
      case 2:
      case 3: return 'Medium';
      case 4:
      case 5: return 'Strong';
      default: return '';
    }
  }

  // Get password strength class
  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrengthText();
    switch (strength) {
      case 'Weak': return 'text-danger';
      case 'Medium': return 'text-warning';
      case 'Strong': return 'text-success';
      default: return '';
    }
  }
}