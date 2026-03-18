import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ElementRef } from '@angular/core';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'isAuthenticated', 'getUserRole']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    authServiceSpy.isAuthenticated.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect if already authenticated on init', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getUserRole.and.returnValue('CUSTOMER');
    
    component.ngOnInit();
    
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/customer/dashboard']);
  });

  it('should have an invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should map roles to correct dashboard routes on success', () => {
    component.loginForm.setValue({ email: 'test@example.com', password: 'password123' });
    authServiceSpy.login.and.returnValue(of({ token: '123', email: 'test@example.com', fullName: 'Test user', role: 'ADMIN', roleId: 1, userId: 1, phone: '1234567890', status: 'ACTIVE', createdAt: '' }));

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith(component.loginForm.value);
    expect(component.loading).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  });

  it('should log an error message on API failure', fakeAsync(() => {
    component.loginForm.setValue({ email: 'test@example.com', password: 'password123' });
    authServiceSpy.login.and.returnValue(throwError(() => ({ error: { message: 'Bad credentials' } })));
    
    component.errorAlert = new ElementRef(document.createElement('div'));
    spyOn(component.errorAlert.nativeElement, 'focus');

    component.onSubmit();
    tick();

    expect(component.loading).toBe(false);
    expect(component.errorMessage).toBe('Bad credentials');
    expect(component.errorAlert.nativeElement.focus).toHaveBeenCalled();
  }));

  it('should not call login API if form is invalid', () => {
    component.loginForm.setValue({ email: 'invalid-email', password: '123' });
    
    component.onSubmit();
    
    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.loginForm.get('email')?.touched).toBe(true);
  });
});
