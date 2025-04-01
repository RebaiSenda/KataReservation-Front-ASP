import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from '../../environments/environment';
import { Observable } from "rxjs";
import Person from "../models/person";
import { PersonRequest } from "../requests/person.request";
import { PersonResponse } from "../responses/person.response";

@Injectable({ providedIn: "root" })
export default class AppPersonService {
    private apiUrl = environment.apiUrl; // Utiliser l'URL de l'environnement

    constructor(private readonly http: HttpClient) {}

    // Méthode pour ajouter une nouvelle personne
    add(user: PersonRequest): Observable<PersonResponse> {
        return this.http.post<PersonResponse>(`${this.apiUrl}/persons`, user);
    }

    // Méthode pour supprimer une personne par ID
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/persons/${id}`);
    }

    // Méthode pour obtenir une personne par ID
    get(id: number): Observable<PersonResponse> {
        return this.http.get<PersonResponse>(`${this.apiUrl}/persons/${id}`);
    }

    // Méthode pour lister toutes les personnes
    list(): Observable<PersonResponse[]> {
        return this.http.get<PersonResponse[]>(`${this.apiUrl}/persons`);
    }

    // Méthode pour mettre à jour une personne
    update(p: Person): Observable<PersonResponse> {
        return this.http.put<PersonResponse>(`${this.apiUrl}/persons/${p.id}`, p);
    }
}