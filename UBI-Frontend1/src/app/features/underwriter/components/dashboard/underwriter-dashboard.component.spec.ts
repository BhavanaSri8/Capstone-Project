import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnderwriterDashboardComponent } from './underwriter-dashboard.component';
import { UnderwriterService } from '../../services/underwriter.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('UnderwriterDashboardComponent', () => {
  let component: UnderwriterDashboardComponent;
  let fixture: ComponentFixture<UnderwriterDashboardComponent>;
  let underwriterSpy: jasmine.SpyObj<UnderwriterService>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    underwriterSpy = jasmine.createSpyObj('UnderwriterService', [
      'getDashboard', 'getPendingApplications', 'approvePolicy', 'rejectPolicy', 'requestDocuments'
    ]);
    authSpy = jasmine.createSpyObj('AuthService', ['getUserRole', 'isAuthenticated', 'getCurrentUser', 'getUserId']);
    authSpy.getUserRole.and.returnValue('UNDERWRITER');
    authSpy.isAuthenticated.and.returnValue(true);
    authSpy.getCurrentUser.and.returnValue({ email: 'underwriter@test.com', role: 'UNDERWRITER' } as any);
    authSpy.getUserId.and.returnValue(1);

    underwriterSpy.getDashboard.and.returnValue(of({ pendingApplications: 2 } as any));
    underwriterSpy.getPendingApplications.and.returnValue(of([{ orderId: 100 }] as any));

    await TestBed.configureTestingModule({
      imports: [UnderwriterDashboardComponent],
      providers: [
        { provide: UnderwriterService, useValue: underwriterSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnderwriterDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load data', () => {
    expect(component).toBeTruthy();
    expect(underwriterSpy.getDashboard).toHaveBeenCalled();
    expect(underwriterSpy.getPendingApplications).toHaveBeenCalled();
    expect(component.stats?.pendingApplications).toBe(2);
    expect(component.pendingApplications.length).toBe(1);
    expect(component.loading).toBe(false);
  });

  it('should approve application', () => {
    spyOn(window, 'prompt').and.returnValue('OK');
    underwriterSpy.approvePolicy.and.returnValue(of({} as any));

    component.approve({ orderId: 100 } as any);

    expect(underwriterSpy.approvePolicy).toHaveBeenCalledWith(100, 'OK');
    expect(component.toast?.type).toBe('success');
  });

  it('should reject application', () => {
    spyOn(window, 'prompt').and.returnValue('Failed checks');
    underwriterSpy.rejectPolicy.and.returnValue(of({} as any));

    component.reject({ orderId: 100 } as any);

    expect(underwriterSpy.rejectPolicy).toHaveBeenCalledWith(100, 'Failed checks');
    expect(component.toast?.type).toBe('success');
  });

  it('should request documents', () => {
    spyOn(window, 'prompt').and.returnValue('Need DL');
    underwriterSpy.requestDocuments.and.returnValue(of({} as any));

    component.requestDocs({ orderId: 100 } as any);

    expect(underwriterSpy.requestDocuments).toHaveBeenCalledWith(100, 'Need DL');
    expect(component.toast?.type).toBe('success');
  });
});
