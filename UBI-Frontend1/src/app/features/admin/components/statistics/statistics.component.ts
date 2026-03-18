import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { StatisticsService } from '../../services/statistics.service';
import { StatisticsData } from '../../../../core/models/models';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, NavbarComponent, SidebarComponent],
  templateUrl: './statistics.component.html'
})
export class StatisticsComponent implements OnInit {
  stats: StatisticsData | null = null;
  loading = true;
  error = '';

  // Charts
  policyChartOptions: ChartConfiguration['options'] = { responsive: true, plugins: { legend: { position: 'bottom' } } };
  policyChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  policyChartType: ChartType = 'pie';

  claimsChartOptions: ChartConfiguration['options'] = { responsive: true, plugins: { legend: { position: 'bottom' } } };
  claimsChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  claimsChartType: ChartType = 'bar';

  revenueChartOptions: ChartConfiguration['options'] = { responsive: true, plugins: { legend: { position: 'bottom' } } };
  revenueChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  revenueChartType: ChartType = 'line';

  telemetryChartOptions: ChartConfiguration['options'] = { responsive: true, plugins: { legend: { position: 'bottom' } }, indexAxis: 'y' };
  telemetryChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  telemetryChartType: ChartType = 'bar';

  constructor(private statisticsService: StatisticsService) { }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.statisticsService.getDashboardStatistics().subscribe({
      next: (data) => {
        this.stats = data;
        this.setupCharts(data);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load statistics data.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  setupCharts(data: StatisticsData): void {
    // Policy Distribution (Pie)
    if (data.policyDistribution) {
      this.policyChartData = {
        labels: Object.keys(data.policyDistribution),
        datasets: [{
          data: Object.values(data.policyDistribution),
          backgroundColor: ['#FE3082', '#75013F', '#F9A8D4', '#F472B6']
        }]
      };
    }

    // Claims Overview (Bar)
    if (data.claimsOverview) {
      this.claimsChartData = {
        labels: Object.keys(data.claimsOverview),
        datasets: [{
          label: 'Claims count',
          data: Object.values(data.claimsOverview),
          backgroundColor: '#75013F'
        }]
      };
    }

    // Monthly Premium Revenue (Line)
    if (data.monthlyRevenue) {
       this.revenueChartData = {
         labels: Object.keys(data.monthlyRevenue),
         datasets: [{
           label: 'Revenue (₹)',
           data: Object.values(data.monthlyRevenue),
           borderColor: '#FE3082',
           backgroundColor: 'rgba(254, 48, 130, 0.2)',
           fill: true,
           tension: 0.4
         }]
       };
    }

    // Telemetry Averages
    this.telemetryChartData = {
      labels: ['Avg Distance (Km)', 'Avg Night Driving (Hrs)'],
      datasets: [{
        label: 'Behavior Metrics',
        data: [data.avgDistanceTravelled, data.avgNightDrivingHours],
        backgroundColor: ['#FE3082', '#75013F']
      }]
    };
  }
}
