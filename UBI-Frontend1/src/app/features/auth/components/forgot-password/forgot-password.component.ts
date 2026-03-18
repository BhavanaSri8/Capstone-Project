import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false;
  message: string = '';
  isError: boolean = false;

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (!this.email) return;
    
    this.isLoading = true;
    this.message = '';
    
    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.message = res.message || 'If an account exists with this email, you will receive a reset link shortly.';
        this.isError = false;
        this.isLoading = false;
      },
      error: (err) => {
        this.message = err.error?.message || 'An error occurred. Please try again.';
        this.isError = true;
        this.isLoading = false;
      }
    });
  }
}
