import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import Room from '../models/room';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export default class RoomService {
    private apiUrl = `${environment.apiUrl}/rooms`;

    constructor(private http: HttpClient) {}

    // Liste toutes les salles
    list(): Observable<Room[]> {
        return this.http.get<Room[]>(this.apiUrl);
    }

    // Obtenir une salle par ID
    get(id: number): Observable<Room> {
        return this.http.get<Room>(`${this.apiUrl}/${id}`);
    }

    // Créer une nouvelle salle
    add(room: Room): Observable<Room> {
        return this.http.post<Room>(this.apiUrl, { roomName: room.RoomName });
    }

    // Mettre à jour une salle
    update(id: number, room: Room): Observable<Room> {
        return this.http.put<Room>(`${this.apiUrl}/${id}`, { roomName: room.RoomName });
    }

    // Supprimer une salle
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}