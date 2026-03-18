import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { FormsModule } from '@angular/forms';
import { UnderwriterService, UnderwriterApplication } from '../../services/underwriter.service';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-underwriter-policies',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SidebarComponent, SkeletonLoaderComponent, FormsModule],
  templateUrl: './underwriter-policies.component.html',
})
export class UnderwriterPoliciesComponent implements OnInit {
  approvedApplications: UnderwriterApplication[] = [];
  loading = true;
  page = 0;
  totalPages = 0;
  search = '';
  private searchSubject = new Subject<string>();

  constructor(private underwriterService: UnderwriterService) {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.page = 0;
      this.loadApprovedPolicies();
    });
  }

  ngOnInit(): void {
    this.loadApprovedPolicies();
  }

  loadApprovedPolicies(): void {
    this.loading = true;
    this.underwriterService.getAllApplications(this.page, 10, this.search, 'APPROVED').subscribe({
      next: (res) => {
        this.approvedApplications = res.content;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.search);
  }

  prevPage(): void { if (this.page > 0) { this.page--; this.loadApprovedPolicies(); } }
  nextPage(): void { if (this.page < this.totalPages - 1) { this.page++; this.loadApprovedPolicies(); } }
}
