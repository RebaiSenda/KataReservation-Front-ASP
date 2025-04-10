import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import Room from '../../models/room';
import RoomService from '../../services/room.service';
import AppModalService from '../../services/modal.service';

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

    constructor(
        private roomService: RoomService, 
        private modalService: AppModalService
    ) {}

    async ngOnInit() {
        await this.loadRooms();
    }

    private async loadRooms() {
        try {
            this.rooms = await firstValueFrom(this.roomService.list());
        } catch (error) {
            console.error("Erreur lors de la récupération des salles:", error);
            this.modalService.alert("Impossible de charger la liste des salles.");
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
                this.modalService.alert("La salle a été créée avec succès.");
            } catch (error) {
                console.error("Erreur lors de la création de la salle:", error);
                this.modalService.alert("Erreur lors de la création de la salle.");
            }
        }
    }

    async deleteRoom(id: number) {
        try {
            await firstValueFrom(this.roomService.delete(id));
            await this.loadRooms();
            this.modalService.alert("La salle a été supprimée avec succès.");
        } catch (error) {
            console.error("Erreur lors de la suppression de la salle:", error);
            this.modalService.alert("Erreur lors de la suppression de la salle.");
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
                this.modalService.alert("La salle a été mise à jour avec succès.");
            } catch (error) {
                console.error("Erreur lors de la mise à jour de la salle:", error);
                this.modalService.alert("Erreur lors de la mise à jour de la salle.");
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