import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import Room from '../../models/room';
import RoomService from '../../services/room.service';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export default class RoomComponent implements OnInit {
    rooms: Room[] = [];
    newRoomName: string = '';
    editingRoom: Room | null = null;

    constructor(private roomService: RoomService) {}

    async ngOnInit() {
        await this.loadRooms();
    }

    private async loadRooms() {
        try {
            const response = await firstValueFrom(this.roomService.list());
            console.log('Response from API:', response);
            
            // Vérifier si la réponse est un tableau ou un objet avec une propriété 'rooms'
            if (Array.isArray(response)) {
                this.rooms = response;
            } else if (response && typeof response === 'object') {
                // Si c'est un objet, essayer de trouver une propriété qui contient un tableau
                const possibleRoomsProperty = Object.keys(response).find(key => 
                    Array.isArray(response[key])
                );
                
                if (possibleRoomsProperty) {
                    this.rooms = response[possibleRoomsProperty];
                } else {
                    this.rooms = [];
                }
            } else {
                this.rooms = [];
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des salles:", error);
            this.rooms = [];
        }
    }

    async createRoom() {
        if (this.newRoomName) {
            const newRoom: Room = { 
                Id: 0,
                RoomName: this.newRoomName, 
                Bookings: []
            };
            
            try {
                await firstValueFrom(this.roomService.add(newRoom));
                this.newRoomName = '';
                await this.loadRooms();
            } catch (error) {
                console.error("Erreur lors de la création de la salle:", error);
            }
        }
    }

    async deleteRoom(id: number) {
        try {
            await firstValueFrom(this.roomService.delete(id));
            await this.loadRooms();
        } catch (error) {
            console.error("Erreur lors de la suppression de la salle:", error);
        }
    }

    editRoom(room: Room) {
        this.editingRoom = { ...room };
    }

    async updateRoom() {
        if (this.editingRoom) {
            try {
                await firstValueFrom(this.roomService.update(this.editingRoom.Id, this.editingRoom));
                this.editingRoom = null;
                await this.loadRooms();
            } catch (error) {
                console.error("Erreur lors de la mise à jour de la salle:", error);
            }
        }
    }

    cancelEdit() {
        this.editingRoom = null;
    }

    viewRoomDetails(id: number) {
        // Cette méthode pourrait être utilisée pour naviguer vers une page de détails
        console.log(`Afficher les détails de la salle avec l'ID: ${id}`);
    }
}