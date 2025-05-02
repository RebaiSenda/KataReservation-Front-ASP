// src/app/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoggingService } from '../services/logging.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const loggingService = inject(LoggingService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Ne pas logger les erreurs vers l'endpoint de log lui-même pour éviter les boucles infinies
      if (!req.url.includes('/log')) {
        loggingService.log(new Error(`${error.status} ${error.statusText}: ${error.message}`)).subscribe();
      }
      return throwError(() => error);
    })
  );
};