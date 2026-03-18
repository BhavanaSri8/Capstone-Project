
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
        return next(req).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('driveiq_user');
                    router.navigate(['/login']);
                }
                return throwError(() => error);
            })
        );
    }

    const token = localStorage.getItem('token');

    let cloned = req;
    if (token) {
        cloned = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    return next(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('driveiq_user');
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};
