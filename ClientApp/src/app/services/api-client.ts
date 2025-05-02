// src/app/services/api-client.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiClient {
  constructor(private http: HttpClient) {}

  get(url: string) {
    return this.http.get(url);
  }

  post<T>(url: string, body: any) {
    return this.http.post<T>(url, body);
  }

  // Ajoutez d'autres méthodes HTTP selon vos besoins
}