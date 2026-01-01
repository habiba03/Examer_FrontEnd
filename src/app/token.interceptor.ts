import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import Swal from 'sweetalert2';
import {secureLocalStorage} from "./secureLocalStorage/secure-storage-util";

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const _AuthService = inject(AuthService);
  const token = secureLocalStorage.getItem('token');

  // URLs to exclude from token injection
  const excludedUrls = ['/api/v1/login','/api/v1/forgotPassword','/api/v1/resetPasswordCheckOtp','/api/v1/resetPasswordUpdate','/api/v1/contact','/api/v1/logoutAdmin']; // Add your excluded endpoints here

  // Check if the current request URL matches any excluded URL
  const isExcluded = excludedUrls.some((url) => req.url.includes(url));

  const authReq = isExcluded
    ? req // Do not add token if URL is excluded
    : token
      ? req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      })
      : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 408) {
        handleTokenExpiration(_AuthService);
      }
      return throwError(() => error);
    })
  );
};

function handleTokenExpiration(authService: AuthService) {
  Swal.fire({
    title: 'Session Expired',
    text: 'Your session has expired. Please log in again.',
    icon: 'warning',
    confirmButtonText: 'Ok',
  });
  authService.logout();
}
