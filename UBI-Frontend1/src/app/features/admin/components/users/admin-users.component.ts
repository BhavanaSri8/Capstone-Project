import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../../auth/services/auth.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { User } from '../../../../core/models/models';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent, SidebarComponent, SkeletonLoaderComponent],
    templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
    users: User[] = [];
    loading = false;
    page = 0;
    totalPages = 0;
    toast: { type: 'success' | 'error'; message: string } | null = null;
    @ViewChild('toastAlert') toastAlert?: ElementRef<HTMLDivElement>;
    currentUserId: number;
    showCreateModal = false;
    creating = false;
    userForm!: FormGroup;

    search = '';
    role = '';
    private searchSubject = new Subject<string>();

    constructor(
        private adminService: AdminService,
        private authService: AuthService,
        private fb: FormBuilder
    ) {
        this.currentUserId = this.authService.getUserId() ?? 0;
        this.initForm();
        
        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(() => {
            this.page = 0;
            this.loadUsers();
        });
    }

    private initForm(): void {
        this.userForm = this.fb.group({
            fullName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            roleName: ['UNDERWRITER', [Validators.required]]
        });
    }

    ngOnInit(): void { this.loadUsers(); }

    loadUsers(): void {
        this.loading = true;
        this.adminService.getAllUsers(this.page, 10, this.search, this.role).subscribe({
            next: (res) => { this.users = res.content; this.totalPages = res.totalPages; this.loading = false; },
            error: () => this.loading = false
        });
    }

    onSearch(): void {
        this.searchSubject.next(this.search);
    }

    onFilter(): void {
        this.page = 0;
        this.loadUsers();
    }

    clearFilters(): void {
        this.search = '';
        this.role = '';
        this.page = 0;
        this.loadUsers();
    }

    openCreateModal(): void {
        this.showCreateModal = true;
        this.userForm.reset({ roleName: 'UNDERWRITER' });
    }

    closeCreateModal(): void {
        this.showCreateModal = false;
    }

    onCreateUser(): void {
        if (this.userForm.invalid) return;
        this.creating = true;
        this.adminService.createInternalUser(this.userForm.value).subscribe({
            next: () => {
                this.creating = false;
                this.showCreateModal = false;
                this.showToast('success', 'Internal user created successfully.');
                this.loadUsers();
            },
            error: (err) => {
                this.creating = false;
                this.showToast('error', err.error?.message || 'Failed to create user.');
            }
        });
    }

    deactivate(user: User): void {
        if (!confirm(`Deactivate ${user.fullName}?`)) return;
        this.adminService.deactivateUser(user.userId).subscribe({
            next: () => { this.showToast('success', 'User deactivated.'); this.loadUsers(); },
            error: () => this.showToast('error', 'Failed to deactivate user.')
        });
    }

    showToast(type: 'success' | 'error', message: string): void {
        this.toast = { type, message };
        setTimeout(() => this.toastAlert?.nativeElement?.focus());
        setTimeout(() => this.toast = null, 3000);
    }

    prevPage(): void { if (this.page > 0) { this.page--; this.loadUsers(); } }
    nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadUsers(); } }
}
