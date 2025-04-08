import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import Room from '../models/room';
import { CreateRoomRequest, UpdateRoomRequest } from '../requests/room.request';
import { RoomResponse, RoomsResponse } from '../responses/room.response';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export default class RoomService {
    constructor(private apiService: ApiService) {}

    // Liste toutes les salles
    list(): Observable<Room[]> {
        return this.apiService.get<RoomsResponse>('/rooms').pipe(
            map(response => {
                if (response && response.rooms) {
                    return response.rooms.map(room => this.mapToRoom(room));
                }
                return [];
            })
        );
    }

    // Obtenir une salle par ID
    get(id: number): Observable<Room> {
        return this.apiService.get<RoomResponse>(`/rooms/${id}`).pipe(
            map(response => this.mapToRoom(response))
        );
    }

    // Créer une nouvelle salle
    add(room: Room): Observable<Room> {
        const request: CreateRoomRequest = {
            roomName: room.RoomName
        };
        return this.apiService.post<RoomResponse>('/rooms', request).pipe(
            map(response => this.mapToRoom(response))
        );
    }

    // Mettre à jour une salle
    update(id: number, room: Room): Observable<Room> {
        const request: UpdateRoomRequest = {
            roomName: room.RoomName
        };
        return this.apiService.put<RoomResponse>(`/rooms/${id}`, request).pipe(
            map(response => this.mapToRoom(response))
        );
    }

    // Supprimer une salle
    delete(id: number): Observable<void> {
        return this.apiService.delete<void>(`/rooms/${id}`);
    }

    // Méthode utilitaire pour convertir la réponse de l'API en modèle Room
    private mapToRoom(response: RoomResponse): Room {
        return {
            Id: response.id,
            RoomName: response.roomName,
            Bookings: response.bookings || []
        };
    }
}