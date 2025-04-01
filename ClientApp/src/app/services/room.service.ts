import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import Room from '../models/room';
import { environment } from '../../environments/environment';
import { CreateRoomRequest, UpdateRoomRequest } from '../requests/room.request';
import { RoomResponse, RoomsResponse } from '../responses/room.response';

@Injectable({ providedIn: 'root' })
export default class RoomService {
    private apiUrl = environment.apiUrl; // Utiliser uniquement l'URL de base

    constructor(private http: HttpClient) {}

    // Liste toutes les salles
    list(): Observable<Room[]> {
        return this.http.get<RoomsResponse>(`${this.apiUrl}/rooms`).pipe(
            map(response => {
                if (response && response.rooms) {
                    // Convertir le format de l'API en format local
                    return response.rooms.map(room => ({
                        Id: room.id,
                        RoomName: room.roomName,
                        Bookings: room.bookings || []
                    }));
                }
                return [];
            })
        );
    }

    // Obtenir une salle par ID
    get(id: number): Observable<Room> {
        return this.http.get<RoomResponse>(`${this.apiUrl}/rooms/${id}`).pipe(
            map(room => ({
                Id: room.id,
                RoomName: room.roomName,
                Bookings: room.bookings || []
            }))
        );
    }

    // Créer une nouvelle salle
    add(room: Room): Observable<Room> {
        const request: CreateRoomRequest = {
            roomName: room.RoomName
        };
        return this.http.post<RoomResponse>(`${this.apiUrl}/rooms`, request).pipe(
            map(response => ({
                Id: response.id,
                RoomName: response.roomName,
                Bookings: response.bookings || []
            }))
        );
    }

    // Mettre à jour une salle
    update(id: number, room: Room): Observable<Room> {
        const request: UpdateRoomRequest = {
            roomName: room.RoomName
        };
        return this.http.put<RoomResponse>(`${this.apiUrl}/rooms/${id}`, request).pipe(
            map(response => ({
                Id: response.id,
                RoomName: response.roomName,
                Bookings: response.bookings || []
            }))
        );
    }

    // Supprimer une salle
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/rooms/${id}`);
    }
}