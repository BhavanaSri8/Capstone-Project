import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoverageService, CoveragePlan } from '../../../../shared/services/coverage.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-coverage-options',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './coverage-options.component.html'
})
export class CoverageOptionsComponent implements OnInit {
  plans: CoveragePlan[] = [];
  loading = true;
  error: string | null = null;

  constructor(private coverageService: CoverageService) { }

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loading = true;
    this.error = null;
    this.coverageService.getCoveragePlans().subscribe({
      next: (data) => {
        this.plans = data.slice(0, 3);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading coverage plans:', err);
        this.error = 'Failed to load policies. Please try again later.';
        this.loading = false;
      }
    });
  }
}
