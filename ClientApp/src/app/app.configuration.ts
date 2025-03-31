import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from "./app.routes";
import AppErrorHandler from "./app.error.handler";

export const appConfiguration: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        { provide: ErrorHandler, useClass: AppErrorHandler },
        provideRouter(routes),
        provideHttpClient(),
    ]
};
