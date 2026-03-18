import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { VehicleService } from '../../../../features/customer/services/vehicle.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { VehicleResponse } from '../../../../core/models/models';

@Component({
    selector: 'app-admin-vehicles',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent, SidebarComponent, SkeletonLoaderComponent],
    templateUrl: './admin-vehicles.component.html',
})
export class AdminVehiclesComponent implements OnInit {
    vehicles: VehicleResponse[] = [];
    loading = false;
    page = 0;
    totalPages = 0;
    search = '';
    status = '';

    constructor(private vehicleService: VehicleService) { }

    ngOnInit(): void { this.loadVehicles(); }

    loadVehicles(): void {
        this.loading = true;
        this.vehicleService.getVehicles(this.page, 10, this.search, this.status || undefined).subscribe({
            next: (res) => { this.vehicles = res.content; this.totalPages = res.totalPages; this.loading = false; },
            error: () => this.loading = false
        });
    }

    onSearch(): void {
        this.page = 0;
        this.loadVehicles();
    }

    onStatusChange(event: any): void {
        this.status = event.target.value;
        this.page = 0;
        this.loadVehicles();
    }

    clearFilters(): void {
        this.search = '';
        this.status = '';
        this.page = 0;
        this.loadVehicles();
    }

    prevPage(): void { if (this.page > 0) { this.page--; this.loadVehicles(); } }
    nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadVehicles(); } }
}
