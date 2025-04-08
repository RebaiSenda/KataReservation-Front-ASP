// components/booking/booking.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import Booking from '../../models/booking';
import BookingService from '../../services/booking.service';
import RoomService from '../../services/room.service';
import PersonService from '../../services/person.service';
import Room from '../../models/room';
import Person from '../../models/person';


@Component({
    selector: 'app-booking',
    templateUrl: './booking.component.html',
    styleUrls: ['./booking.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export default class BookingComponent implements OnInit {
    bookings: Booking[] = [];
    rooms: Room[] = [];
    persons: Person[] = [];
    
    newBooking: Booking = this.initializeNewBooking();
    errorMessage: string = '';
    successMessage: string = '';
    availableSlots: number[] = [];
    conflictMessage: string = '';
    
    constructor(
        private bookingService: BookingService,
        private roomService: RoomService,
        private personService: PersonService
    ) {}

    async ngOnInit() {
        await Promise.all([
            this.loadRooms(),
            this.loadPersons()
        ]);
    }

    private initializeNewBooking(): Booking {
        return {
            Id: 0,
            RoomId: 0,
            PersonId: 0,
            BookingDate: new Date(),
            StartSlot: 1,
            EndSlot: 2
        };
    }

    private async loadRooms() {
        try {
            this.rooms = await firstValueFrom(this.roomService.list());
        } catch (error) {
            console.error("Erreur lors de la récupération des salles:", error);
            this.errorMessage = "Erreur lors de la récupération des salles.";
        }
    }

    private async loadPersons() {
        try {
            this.persons = await firstValueFrom(this.personService.list());
        } catch (error) {
            console.error("Erreur lors de la récupération des personnes:", error);
            this.errorMessage = "Erreur lors de la récupération des personnes.";
        }
    }

    async createBooking() {
        if (!this.validateBooking()) {
            return;
        }

        this.clearMessages();
        
        try {
            await firstValueFrom(this.bookingService.create(this.newBooking));
            this.successMessage = "Réservation créée avec succès.";
            this.newBooking = this.initializeNewBooking();
        } catch (error: any) {
            console.error("Erreur lors de la création de la réservation:", error);
            
            // Gérer les différents types d'erreurs
            if (error.status === 409) { // Conflit
                this.handleConflictError(error.error);
            } else if (error.status === 400) { // Erreur de validation
                this.errorMessage = error.error || "Données de réservation invalides.";
            } else {
                this.errorMessage = "Erreur lors de la création de la réservation.";
            }
        }
    }

    private handleConflictError(error: any) {
        if (error && error.message) {
            this.conflictMessage = error.message;
            if (error.availableSlots) {
                this.availableSlots = error.availableSlots;
            }
        } else {
            this.errorMessage = "Conflit de réservation. Veuillez choisir un autre créneau.";
        }
    }

    validateBooking(): boolean {
        if (!this.newBooking.RoomId) {
            this.errorMessage = "Veuillez sélectionner une salle.";
            return false;
        }
        if (!this.newBooking.PersonId) {
            this.errorMessage = "Veuillez sélectionner une personne.";
            return false;
        }
        if (!this.newBooking.BookingDate) {
            this.errorMessage = "Veuillez sélectionner une date.";
            return false;
        }
        if (this.newBooking.StartSlot >= this.newBooking.EndSlot) {
            this.errorMessage = "L'heure de début doit être antérieure à l'heure de fin.";
            return false;
        }
        if (this.newBooking.StartSlot < 1 || this.newBooking.EndSlot > 24) {
            this.errorMessage = "Les créneaux doivent être compris entre 1 et 24.";
            return false;
        }
        
        return true;
    }

    clearMessages() {
        this.errorMessage = '';
        this.successMessage = '';
        this.conflictMessage = '';
        this.availableSlots = [];
    }

    useAvailableSlot(startSlot: number) {
        this.newBooking.StartSlot = startSlot;
        this.newBooking.EndSlot = startSlot + 1;
        this.clearMessages();
    }

    formatTime(slot: number): string {
        // Convertir le créneau en format horaire (ex: 1 -> "01:00", 13 -> "13:00")
        return `${slot.toString().padStart(2, '0')}:00`;
    }
    
}