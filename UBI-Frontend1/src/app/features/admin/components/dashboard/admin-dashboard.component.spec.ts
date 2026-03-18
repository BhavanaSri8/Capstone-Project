import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let adminSpy: jasmine.SpyObj<AdminService>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    adminSpy = jasmine.createSpyObj('AdminService', ['getDashboardSummary', 'getRiskDistribution', 'getMonthlyRevenue', 'getActiveSubscriptions']);
    authSpy = jasmine.createSpyObj('AuthService', ['getUserRole', 'isAuthenticated', 'getCurrentUser', 'getUserId']);

    authSpy.getUserRole.and.returnValue('ADMIN');
    authSpy.isAuthenticated.and.returnValue(true);
    authSpy.getCurrentUser.and.returnValue({ email: 'admin@test.com', role: 'ADMIN' } as any);
    authSpy.getUserId.and.returnValue(1);

    adminSpy.getDashboardSummary.and.returnValue(of({ totalUsers: 100, totalPolicies: 50, totalSubscriptions: 40, totalClaims: 10, pendingOrders: 5, monthlyRevenue: 10000, activeSubscriptions: 35 }));
    adminSpy.getRiskDistribution.and.returnValue(of({ low: 50, medium: 30, high: 20 }));
    adminSpy.getMonthlyRevenue.and.returnValue(of([{ month: 'Jan', revenue: 1000 }]));

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        { provide: AdminService, useValue: adminSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    expect(adminSpy.getDashboardSummary).toHaveBeenCalled();
    expect(adminSpy.getRiskDistribution).toHaveBeenCalled();
    expect(adminSpy.getMonthlyRevenue).toHaveBeenCalled();
    
    expect(component.summary?.totalUsers).toBe(100);
    expect(component.riskDist?.low).toBe(50);
    expect(component.monthlyRevenue.length).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('should correctly calculate risk percentages', () => {
    component.riskDist = { low: 50, medium: 30, high: 20 };
    const percentages = component.riskPercentage;
    expect(percentages.low).toBe(50);
    expect(percentages.med).toBe(30);
    expect(percentages.high).toBe(20);
  });

  it('should set mock data on error', () => {
    adminSpy.getDashboardSummary.and.returnValue(throwError(() => new Error('API Error')));
    
    component.loadDashboard();
    
    expect(component.summary?.totalUsers).toBe(0);
    expect(component.loading).toBe(false);
  });
});
