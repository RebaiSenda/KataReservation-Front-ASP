import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user'; 
import { firstValueFrom } from 'rxjs';  

@Injectable({ providedIn: 'root' })
export class ManagementService {
    private apiUrl = "https://localhost:4200/bff/user"; 
    private user :User | undefined; // Cache the user data

    constructor(private http: HttpClient) {}

    async getUser(): Promise<User> {
        if (!this.user) {
            try {
                const response:any = await firstValueFrom(this.http.get(this.apiUrl,{headers: {
                    "X-CSRF": "1"
                }})); 
                if (!response) {
                    throw new Error('User data is undefined');
                }
                this.user ={
                    name: response[5].value,
                    logoutUrl: response[8].value
                }; // Cache the user data
                return this.user;
            } catch (error) {
                window.location.replace(`https://localhost:4200/bff/login?returnUrl=${window.location.pathname}`);
                throw error;// Return a default value or handle the error as needed
            }
        }
        else
        {return this.user; }// Return the cached user data
    }
}