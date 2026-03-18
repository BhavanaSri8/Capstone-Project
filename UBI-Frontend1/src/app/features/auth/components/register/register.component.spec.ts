import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ElementRef } from '@angular/core';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register', 'logout']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('should require minimum length for password', () => {
    component.registerForm.patchValue({ password: '123' });
    expect(component.password?.errors?.['minlength']).toBeTruthy();
  });

  it('should set success message and redirect after successful registration', fakeAsync(() => {
    component.registerForm.setValue({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    });
    
    const mockResponse = { message: 'Registration successful', email: 'test@test.com', userId: 1, user: {} };
    authServiceSpy.register.and.returnValue(of(mockResponse));

    component.onSubmit();
    
    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(component.successMessage).toBe('Registration successful');
    expect(authServiceSpy.logout).toHaveBeenCalled();
    
    tick(1500); // 1.5s delay
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should handle registration error', fakeAsync(() => {
    component.registerForm.setValue({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    });
    
    authServiceSpy.register.and.returnValue(throwError(() => ({ error: { message: 'Email already exists' } })));
    
    component.errorAlert = new ElementRef(document.createElement('div'));
    spyOn(component.errorAlert.nativeElement, 'focus');

    component.onSubmit();
    tick();

    expect(component.errorMessage).toBe('Email already exists');
    expect(component.loading).toBe(false);
    expect(component.errorAlert.nativeElement.focus).toHaveBeenCalled();
  }));
});
