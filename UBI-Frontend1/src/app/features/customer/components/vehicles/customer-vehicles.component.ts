import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { VehicleResponse } from '../../../../core/models/models';

@Component({
  selector: 'app-customer-vehicles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent, SidebarComponent, ModalComponent, SkeletonLoaderComponent],
  templateUrl: './customer-vehicles.component.html'
})
export class CustomerVehiclesComponent implements OnInit {
  vehicles: VehicleResponse[] = [];
  loading = false;
  showModal = false;
  submitting = false;
  vehicleForm!: FormGroup;
  toast: { type: 'success' | 'error'; message: string } | null = null;
  @ViewChild('toastAlert') toastAlert?: ElementRef<HTMLDivElement>;

  page = 0;
  totalPages = 0;
  search = '';

  constructor(private vehicleService: VehicleService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.vehicleForm = this.fb.group({
      vehicleNumber: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]{6,15}$/)]],
      vehicleType: ['CAR', Validators.required],
      vehicleAge: [0, [Validators.required, Validators.min(0), Validators.max(50)]]
    });
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading = true;
    this.vehicleService.getVehicles(this.page, 6, this.search).subscribe({
      next: (res) => { 
        this.vehicles = res.content; 
        this.totalPages = res.totalPages;
        this.loading = false; 
      },
      error: () => this.loading = false
    });
  }

  onSearch(): void {
    this.page = 0;
    this.loadVehicles();
  }

  clearFilters(): void {
    this.search = '';
    this.page = 0;
    this.loadVehicles();
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadVehicles(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadVehicles(); } }

  openAdd(): void {
    this.vehicleForm.reset({ vehicleType: 'CAR', vehicleAge: 0 });
    this.showModal = true;
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const payload = {
      ...this.vehicleForm.value,
      vehicleNumber: this.vehicleForm.value.vehicleNumber?.toUpperCase().trim()
    };
    this.vehicleService.createVehicle(payload).subscribe({
      next: () => {
        this.submitting = false; this.showModal = false;
        this.showToast('success', 'Vehicle added to garage');
        this.loadVehicles();
      },
      error: (err: any) => {
        this.submitting = false;
        this.showToast('error', err.error?.message || 'Failed to add vehicle');
      }
    });
  }

  getVehicleEmoji(type: string): string {
    const emojis: Record<string, string> = { 'CAR': '🚗', 'BIKE': '🏍️', 'SUV': '🚙', 'TRUCK': '🚚' };
    return emojis[type] || '🚘';
  }

  showToast(type: 'success' | 'error', message: string): void {
    this.toast = { type, message };
    setTimeout(() => this.toastAlert?.nativeElement?.focus());
    setTimeout(() => this.toast = null, 3000);
  }
}
