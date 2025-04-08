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
import AppModalService from '../../services/modal.service';

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
    availableSlots: number[] = [];
    conflictMessage: string = '';
    
    // Pour la liaison avec le datepicker HTML
    bookingDateString: string = '';
    
    constructor(
        private bookingService: BookingService,
        private roomService: RoomService,
        private personService: PersonService,
        private modalService: AppModalService
    ) {}

    async ngOnInit() {
        await Promise.all([
            this.loadRooms(),
            this.loadPersons()
        ]);
        
        // Initialiser la date au format string pour le datepicker
        const today = new Date();
        this.bookingDateString = this.formatDateForInput(today);
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
            this.modalService.alert("Erreur lors de la récupération des salles.");
        }
    }

    private async loadPersons() {
        try {
            this.persons = await firstValueFrom(this.personService.list());
        } catch (error) {
            console.error("Erreur lors de la récupération des personnes:", error);
            this.modalService.alert("Erreur lors de la récupération des personnes.");
        }
    }

    async createBooking() {
        // Conversion de la date string en objet Date avant l'envoi
        try {
            // Utiliser la valeur du champ date string pour créer un objet Date valide
            this.newBooking.BookingDate = new Date(this.bookingDateString);
            
            if (!this.validateBooking()) {
                return;
            }
            
            this.clearMessages();
            
            await firstValueFrom(this.bookingService.create({ ...this.newBooking }));
            this.modalService.alert("Réservation créée avec succès.");
            this.newBooking = this.initializeNewBooking();
            this.bookingDateString = this.formatDateForInput(new Date());
        } catch (error: any) {
            console.error("Erreur lors de la création de la réservation:", error);
            
            // Gérer les différents types d'erreurs
            if (error.status === 409) { // Conflit
                this.handleConflictError(error.error);
            } else if (error.status === 400) { // Erreur de validation
                this.modalService.alert(error.error || "Données de réservation invalides.");
            } else {
                this.modalService.alert("Erreur lors de la création de la réservation: " + (error.message || 'Erreur inconnue'));
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
            this.modalService.alert("Conflit de réservation. Veuillez choisir un autre créneau.");
        }
    }

    validateBooking(): boolean {
        if (!this.newBooking.RoomId) {
            this.modalService.alert("Veuillez sélectionner une salle.");
            return false;
        }
        if (!this.newBooking.PersonId) {
            this.modalService.alert("Veuillez sélectionner une personne.");
            return false;
        }
        if (!this.bookingDateString) {
            this.modalService.alert("Veuillez sélectionner une date.");
            return false;
        }
        if (this.newBooking.StartSlot >= this.newBooking.EndSlot) {
            this.modalService.alert("L'heure de début doit être antérieure à l'heure de fin.");
            return false;
        }
        if (this.newBooking.StartSlot < 1 || this.newBooking.EndSlot > 24) {
            this.modalService.alert("Les créneaux doivent être compris entre 1 et 24.");
            return false;
        }
        
        return true;
    }

    clearMessages() {
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
    
    // Formater la date pour l'input HTML (YYYY-MM-DD)
    private formatDateForInput(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}