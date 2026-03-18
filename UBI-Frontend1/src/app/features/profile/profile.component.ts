import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, SidebarComponent],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  editMode = false;
  loading = true;
  saving = false;
  successMessage = '';
  errorMessage = '';

  editForm = {
    fullName: '',
    phone: '',
    address: ''
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (user: User) => {
        this.user = user;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load profile. Please try again.';
        this.loading = false;
      }
    });
  }

  startEdit(): void {
    if (!this.user) return;
    this.editForm = {
      fullName: this.user.fullName,
      phone: this.user.phone || '',
      address: this.user.address || ''
    };
    this.editMode = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.editMode = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveProfile(): void {
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.userService.updateProfile(this.editForm).subscribe({
      next: (updated: User) => {
        this.user = updated;
        this.editMode = false;
        this.saving = false;
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: () => {
        this.saving = false;
        this.errorMessage = 'Failed to save changes. Please try again.';
      }
    });
  }

  getInitial(): string {
    return this.user?.email?.[0]?.toUpperCase() ?? '?';
  }

  getRoleBadgeClass(): string {
    const role = (this.user as any)?.role?.roleName || '';
    const map: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-800',
      UNDERWRITER: 'bg-purple-100 text-purple-800',
      CLAIMS_OFFICER: 'bg-yellow-100 text-yellow-800',
      CUSTOMER: 'bg-blue-100 text-blue-800'
    };
    return map[role] || 'bg-slate-100 text-slate-700';
  }

  getRoleLabel(): string {
    const role = (this.user as any)?.role?.roleName || '';
    const map: Record<string, string> = {
      ADMIN: 'Administrator',
      UNDERWRITER: 'Underwriter',
      CLAIMS_OFFICER: 'Claims Officer',
      CUSTOMER: 'Customer'
    };
    return map[role] || role;
  }
}
