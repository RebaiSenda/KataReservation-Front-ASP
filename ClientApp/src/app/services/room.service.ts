// File: src/app/services/room.service.ts

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import Room from "../models/room";
import { environment } from '../../environments/environment'; 

@Injectable({ providedIn: "root" })
export default class AppRoomService {
    private apiUrl = `${environment.apiUrl}/remote/rooms`; 

    constructor(private readonly http: HttpClient) { }

    // Create a new room
    add = (room: Room) => this.http.post<Room>(this.apiUrl, { roomName: room.RoomName });

    // Delete a room by ID
    delete = (id: number) => this.http.delete(`${this.apiUrl}/${id}`);

    // Get a room by ID
    get = (id: number) => this.http.get<Room>(`${this.apiUrl}/${id}`);

    // Inactivate a room (if this is a specific action you need)
    inactivate = (id: number) => this.http.patch(`${this.apiUrl}/${id}/inactivate`, {});

    // List all rooms
    list = () => this.http.get<Room[]>(this.apiUrl);

    // Update a room by ID
    update = (id: number, room: Room) => this.http.put<Room>(`${this.apiUrl}/${id}`, { roomName: room.RoomName });
}