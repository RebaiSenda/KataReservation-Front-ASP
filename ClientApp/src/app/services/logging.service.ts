// src/app/services/logging.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client';

// Ces valeurs doivent correspondre aux valeurs de Microsoft.Extensions.Logging.LogLevel
export enum LogLevel {
  Trace = 0,
  Debug = 1,
  Information = 2,
  Warning = 3,
  Error = 4,
  Critical = 5,
  None = 6
}


@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  constructor(private apiClient: ApiClient) {}

  log(error: Error): Observable<void> {
    return this.apiClient.post<void>('/log', {
      logLevel: LogLevel.Error,
      message: error.toString()
    });
  }

  info(message: string): Observable<void> {
    return this.apiClient.post<void>('/log', {
      logLevel: LogLevel.Information,
      message
    });
  }

  warn(message: string): Observable<void> {
    return this.apiClient.post<void>('/log', {
      logLevel: LogLevel.Warning,
      message
    });
  }

  debug(message: string): Observable<void> {
    return this.apiClient.post<void>('/log', {
      logLevel: LogLevel.Debug,
      message
    });
  }
}