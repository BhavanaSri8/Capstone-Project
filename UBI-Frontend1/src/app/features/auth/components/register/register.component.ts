import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoleType } from '../../../../../models/role.model';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
    registerForm!: FormGroup;
    loading = false;
    errorMessage = '';
    successMessage = '';
    showPassword = false;
    readonly redirectDelayMs = 1500;
    @ViewChild('errorAlert') errorAlert?: ElementRef<HTMLDivElement>;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.registerForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60), Validators.pattern(/^[A-Za-z][A-Za-z\s'.-]*$/)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
            age: [null, [Validators.required, Validators.min(18), Validators.max(100)]]
        });
    }

    onSubmit(): void {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }
        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const payload = {
            ...this.registerForm.value,
            fullName: this.registerForm.value.fullName?.trim(),
            email: this.registerForm.value.email?.trim(),
            phone: this.registerForm.value.phone?.trim()
        };

        this.authService.register(payload).subscribe({
            next: (res) => {
                this.loading = false;
                this.successMessage = res.message || 'Registration successful. Please login.';
                this.authService.logout();
                this.registerForm.reset();
                setTimeout(() => this.router.navigate(['/login']), this.redirectDelayMs);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
                this.focusErrorMessage();
            }
        });
    }

    private focusErrorMessage(): void {
        setTimeout(() => this.errorAlert?.nativeElement?.focus());
    }

    get fullName() { return this.registerForm.get('fullName'); }
    get email() { return this.registerForm.get('email'); }
    get password() { return this.registerForm.get('password'); }
    get phone() { return this.registerForm.get('phone'); }
    get age() { return this.registerForm.get('age'); }
}
