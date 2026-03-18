import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerDashboardComponent } from './customer-dashboard.component';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { SubscriptionService } from '../../../../shared/services/subscription.service';
import { PremiumService } from '../../../../shared/services/premium.service';
import { UsageService } from '../../services/usage.service';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('CustomerDashboardComponent', () => {
  let component: CustomerDashboardComponent;
  let fixture: ComponentFixture<CustomerDashboardComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let subSpy: jasmine.SpyObj<SubscriptionService>;
  let premiumSpy: jasmine.SpyObj<PremiumService>;
  let usageSpy: jasmine.SpyObj<UsageService>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'getUserId', 'getUserRole', 'isAuthenticated']);
    subSpy = jasmine.createSpyObj('SubscriptionService', ['getUserSubscriptions']);
    premiumSpy = jasmine.createSpyObj('PremiumService', ['getPremiumHistory']);
    usageSpy = jasmine.createSpyObj('UsageService', ['getUsageData']);

    authSpy.getCurrentUser.and.returnValue({ email: 'test@example.com' } as any);
    authSpy.getUserId.and.returnValue(1);
    authSpy.getUserRole.and.returnValue('CUSTOMER');
    authSpy.isAuthenticated.and.returnValue(true);
    subSpy.getUserSubscriptions.and.returnValue(of([{ subscriptionId: 10, subscriptionStatus: 'ACTIVE' }] as any));
    premiumSpy.getPremiumHistory.and.returnValue(of([{ finalPremium: 150 }] as any));
    usageSpy.getUsageData.and.returnValue(of([{ usageId: 1, totalDistanceKm: 500, nightDrivingHours: 5, riskCategory: 'LOW' }] as any));

    await TestBed.configureTestingModule({
      imports: [CustomerDashboardComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: SubscriptionService, useValue: subSpy },
        { provide: PremiumService, useValue: premiumSpy },
        { provide: UsageService, useValue: usageSpy },
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load data', () => {
    expect(component).toBeTruthy();
    expect(component.userName).toBe('test');
    expect(subSpy.getUserSubscriptions).toHaveBeenCalledWith(1);
    expect(component.activeSubs.length).toBe(1);
    expect(premiumSpy.getPremiumHistory).toHaveBeenCalledWith(10);
    expect(usageSpy.getUsageData).toHaveBeenCalledWith(10);
    
    expect(component.nextPremium?.finalPremium).toBe(150);
    expect(component.loading).toBe(false);
    expect(component.safetyScore).toBeGreaterThan(0);
  });

  it('should display correct safety message when no usage history', () => {
    usageSpy.getUsageData.and.returnValue(of([]));
    component.loadDashboardMetrics(10);

    expect(component.safetyScore).toBe(0);
    expect(component.safetyMessage).toBe('No telemetry submitted yet');
  });

  it('should handle missing active subscriptions gracefully', () => {
    subSpy.getUserSubscriptions.and.returnValue(of([{ subscriptionId: 11, subscriptionStatus: 'INACTIVE' }] as any));
    component.loadData();

    expect(component.activeSubs.length).toBe(0);
    expect(component.loading).toBe(false);
  });
});
