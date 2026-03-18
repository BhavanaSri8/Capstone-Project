import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ClaimsDashboardComponent } from './claims-dashboard.component';
import { ClaimsOfficerService } from '../../services/claims-officer.service';
import { SubscriptionService } from '../../../../shared/services/subscription.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('ClaimsDashboardComponent', () => {
  let component: ClaimsDashboardComponent;
  let fixture: ComponentFixture<ClaimsDashboardComponent>;
  let claimsSpy: jasmine.SpyObj<ClaimsOfficerService>;
  let subSpy: jasmine.SpyObj<SubscriptionService>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    claimsSpy = jasmine.createSpyObj('ClaimsOfficerService', ['getAllClaims', 'approveClaim', 'rejectClaim']);
    subSpy = jasmine.createSpyObj('SubscriptionService', ['getSubscriptionById']);
    authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'getUserRole', 'isAuthenticated']);

    authSpy.getCurrentUser.and.returnValue({ email: 'officer@test.com' } as any);
    authSpy.getUserRole.and.returnValue('CLAIMS_OFFICER');
    authSpy.isAuthenticated.and.returnValue(true);

    const mockClaims = [
      { claimId: 1, claimStatus: 'PENDING', subscriptionId: 10, submittedDate: new Date().toISOString() },
      { claimId: 2, claimStatus: 'APPROVED', claimAmount: 1000, subscriptionId: 20, submittedDate: new Date().toISOString() }
    ];
    claimsSpy.getAllClaims.and.returnValue(of(mockClaims as any[]));
    subSpy.getSubscriptionById.and.returnValue(of({ order: { user: { fullName: 'Test Name' } } } as any));

    await TestBed.configureTestingModule({
      imports: [ClaimsDashboardComponent],
      providers: [
        { provide: ClaimsOfficerService, useValue: claimsSpy },
        { provide: SubscriptionService, useValue: subSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load claims', fakeAsync(() => {
    expect(component).toBeTruthy();
    tick(); // allow forkJoin to complete
    
    expect(claimsSpy.getAllClaims).toHaveBeenCalled();
    expect(component.pendingClaims.length).toBe(1);
    expect(component.processedClaims.length).toBe(1);
    expect(component.processedToday).toBe(1);
    expect(component.totalSettled).toBe(1000);
    expect(component.loading).toBe(false);
  }));

  it('should handle approve claim', fakeAsync(() => {
    claimsSpy.approveClaim.and.returnValue(of({} as any));

    component.approve({ claimId: 1 } as any);
    tick();

    expect(claimsSpy.approveClaim).toHaveBeenCalledWith(1);
    expect(component.submittingId).toBeNull();
  }));

  it('should handle reject claim', fakeAsync(() => {
    claimsSpy.rejectClaim.and.returnValue(of({} as any));

    component.reject({ claimId: 1 } as any);
    tick();

    expect(claimsSpy.rejectClaim).toHaveBeenCalledWith(1);
    expect(component.submittingId).toBeNull();
  }));
});
