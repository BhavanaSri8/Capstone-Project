import { Component, OnInit } from '@angular/core';
import { CoverageService } from '../../../../shared/services/coverage.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html'
})
export class HeroComponent implements OnInit {
  totalPlansDisplay = '0';
  avgPremiumDisplay = '0';
  activePlansRateDisplay = '0%';

  constructor(
    private coverageService: CoverageService
  ) { }

  ngOnInit(): void {
    this.loadHeroStats();
  }

  private loadHeroStats(): void {
    this.coverageService.getCoveragePlans().subscribe({
      next: (policies) => {
        const total = policies.length;
        const activeCount = policies.filter((policy) => policy.isActive).length;

        const avgPremium = policies.length > 0
          ? Math.round(policies.reduce((sum, policy) => sum + policy.basePremium, 0) / policies.length)
          : 0;

        const activeRate = total > 0
          ? Math.round((activeCount / total) * 100)
          : 0;

        this.totalPlansDisplay = total.toLocaleString('en-IN');
        this.avgPremiumDisplay = avgPremium.toLocaleString('en-IN');
        this.activePlansRateDisplay = `${activeRate}%`;
      },
      error: () => {
        this.totalPlansDisplay = '0';
        this.avgPremiumDisplay = '0';
        this.activePlansRateDisplay = '0%';
      }
    });
  }

  scrollToCoverage(): void {
    const element = document.getElementById('coverage');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToServices(): void {
    const element = document.getElementById('services');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }
}
