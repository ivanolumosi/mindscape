import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isLoginMode = true; // Default to login

  // Motivational Quotes
  loginQuote = "Success is not the key to happiness. Happiness is the key to success.";
  registerQuote = "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle.";

  get currentQuote() {
    return this.isLoginMode ? this.loginQuote : this.registerQuote;
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }
}