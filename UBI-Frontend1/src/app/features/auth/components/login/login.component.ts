import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../../../environments/environment';
import { RoleType } from '../../../../../models/role.model';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    loading = false;
    errorMessage = '';
    showPassword = false;
    readonly environment = environment;
    @ViewChild('errorAlert') errorAlert?: ElementRef<HTMLDivElement>;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        if (this.authService.isAuthenticated()) {
            this.redirectByRole(this.authService.getUserRole());
        }
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }
        this.loading = true;
        this.errorMessage = '';

        this.authService.login(this.loginForm.value).subscribe({
            next: (res) => {
                this.loading = false;
                this.redirectByRole(res.role);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.error?.message || 'Invalid email or password. Please try again.';
                this.focusErrorMessage();
            }
        });
    }

    private focusErrorMessage(): void {
        setTimeout(() => this.errorAlert?.nativeElement?.focus());
    }

    private redirectByRole(role: string | null): void {
        const routes: Record<RoleType, string> = {
            'ADMIN': '/admin/dashboard',
            'CUSTOMER': '/customer/dashboard',
            'CLAIMS_OFFICER': '/claims/dashboard',
            'UNDERWRITER': '/underwriter/dashboard'
        };
        this.router.navigate([routes[role as RoleType] || '/']);
    }

    get email() { return this.loginForm.get('email'); }
    get password() { return this.loginForm.get('password'); }
}
