import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient,withInterceptors  } from '@angular/common/http';
import { routes } from "./app.routes";
import AppErrorHandler from "./app.error.handler";
import { LoggingService } from './services/logging.service';
import { errorInterceptor } from './interceptors/error.interceptor';


export const appConfiguration: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        { provide: ErrorHandler, useClass: AppErrorHandler },
        provideRouter(routes),
        provideHttpClient(
            withInterceptors([errorInterceptor])
          ),
          LoggingService
        ]
      }
