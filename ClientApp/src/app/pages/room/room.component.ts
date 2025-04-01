import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importer FormsModule
import { firstValueFrom } from 'rxjs';
import Room from '../../models/room';
import RoomService from '../../services/room.service';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule] // Assurez-vous que FormsModule est ici
})
export default class RoomComponent implements OnInit {
    rooms: Room[] = [];
    newRoomName: string = ''; // État pour le nom de la nouvelle salle

    constructor(private roomService: RoomService) {}

    async ngOnInit() {
        await this.loadRooms(); // Charger les salles au démarrage
    }

    private async loadRooms() {
        try {
            const response = await firstValueFrom(this.roomService.list());
            console.log('Response from API:', response);
            this.rooms = response || [];
        } catch (error) {
            console.error("Erreur lors de la récupération des salles:", error);
            this.rooms = [];
        }
    }

    async createRoom() {
        if (this.newRoomName) {
            const newRoom: Room = { 
                Id: 0, // Valeur par défaut pour l'identifiant
                RoomName: this.newRoomName, 
                Bookings: [] // Initialiser avec un tableau vide
            };
            
            try {
                await firstValueFrom(this.roomService.add(newRoom)); // Appel à la méthode pour créer la salle
                this.newRoomName = ''; // Réinitialiser le champ de saisie
                await this.loadRooms(); // Recharger les salles après création
            } catch (error) {
                console.error("Erreur lors de la création de la salle:", error);
            }
        }
    }
}