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
        // Initialiser la date au format string pour le datepicker
        const today = new Date();
        this.bookingDateString = this.formatDateForInput(today);
        
        try {
            // Charger les données de référence d'abord
            await Promise.all([
                this.loadRooms(),
                this.loadPersons()
            ]);
            
            // Charger les réservations seulement après
            await this.loadBookings();
        } catch (error) {
            console.error("Erreur lors de l'initialisation:", error);
            // Éviter d'afficher une alerte au chargement initial
        }
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
            console.log("Salles chargées:", this.rooms.length);
        } catch (error) {
            console.error("Erreur lors de la récupération des salles:", error);
            // Ne pas afficher d'alerte au chargement initial
        }
    }

    private async loadPersons() {
        try {
            this.persons = await firstValueFrom(this.personService.list());
            console.log("Personnes chargées:", this.persons.length);
        } catch (error) {
            console.error("Erreur lors de la récupération des personnes:", error);
            // Ne pas afficher d'alerte au chargement initial
        }
    }

    private async loadBookings() {
        try {
            const bookingsData = await firstValueFrom(this.bookingService.list());
            
            // Vérifier si les données sont valides
            if (!Array.isArray(bookingsData)) {
                console.error("Format de données invalide:", bookingsData);
                this.bookings = [];
                return;
            }
            
            this.bookings = bookingsData;
            console.log("Réservations chargées:", this.bookings.length);
        } catch (error) {
            console.error("Erreur lors de la récupération des réservations:", error);
            // Ne pas afficher d'alerte au chargement initial
            this.bookings = [];
        }
    }

    async createBooking() {
        try {
            if (!this.validateBooking()) {
                return;
            }
            
            // Assurez-vous que la date est correctement formatée avant l'envoi
            this.newBooking.BookingDate = new Date(this.bookingDateString);
            
            this.clearMessages();
            
            console.log("Création de réservation:", this.newBooking);
            await firstValueFrom(this.bookingService.create({ ...this.newBooking }));
            
            // Ensuite seulement recharger les réservations
            await this.loadBookings();
            
            this.modalService.alert("Réservation créée avec succès.");
            
            // Réinitialiser le formulaire
            this.newBooking = this.initializeNewBooking();
            this.bookingDateString = this.formatDateForInput(new Date());
        } catch (error: any) {
            console.error("Erreur lors de la création de la réservation:", error);
            
            if (error.status === 409) {
                this.handleConflictError(error);
            } else {
                let errorMessage = "Erreur lors de la création de la réservation.";
                if (error.error && error.error.message) {
                    errorMessage = error.error.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                this.modalService.alert(errorMessage);
            }
        }
    }

    async deleteBooking(bookingId: number) {
        if (!bookingId || isNaN(bookingId)) {
            console.error("ID de réservation invalide:", bookingId);
            this.modalService.alert("ID de réservation invalide.");
            return;
        }
        
        try {
            if (confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) {
                console.log("Suppression de la réservation:", bookingId); // Pour le débogage
                await firstValueFrom(this.bookingService.delete(bookingId));
                
                // Recharger les réservations après la suppression
                await this.loadBookings();
                this.modalService.alert("Réservation supprimée avec succès.");
            }
        } catch (error: any) {
            console.error("Erreur lors de la suppression de la réservation:", error);
            let errorMessage = "Erreur lors de la suppression de la réservation.";
            if (error.error && error.error.message) {
                errorMessage = error.error.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            this.modalService.alert(errorMessage);
        }
    }

    // Méthode améliorée pour gérer les conflits
    private handleConflictError(error: any) {
        if (error && error.message) {
            this.conflictMessage = error.message;
        } else if (error.error && error.error.message) {
            this.conflictMessage = error.error.message;
        } else {
            this.conflictMessage = "Conflit de réservation. Veuillez choisir un autre créneau.";
        }
        
        // S'assurer que availableSlots est correctement extrait
        if (error.error && error.error.availableSlots && Array.isArray(error.error.availableSlots)) {
            this.availableSlots = error.error.availableSlots;
        } else if (error.availableSlots && Array.isArray(error.availableSlots)) {
            this.availableSlots = error.availableSlots;
        } else {
            this.availableSlots = [];
            console.error("Format des créneaux disponibles invalide:", error);
        }
        
        console.log("Créneaux disponibles:", this.availableSlots);
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
        // Convertir le créneau en format horaire plus lisible (ex: 1 -> "01h00", 13 -> "13h00")
        return `${slot.toString().padStart(2, '0')}h00`;
    }
    
    // Formater la date pour l'input HTML (YYYY-MM-DD)
    private formatDateForInput(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Trouver le nom de la salle à partir de son ID
    getRoomName(roomId: number): string {
        const room = this.rooms.find(r => r.Id === roomId);
        return room ? room.RoomName : 'Salle inconnue';
    }
    
    getPersonName(personId: number): string {
        const person = this.persons.find(p => p.id === personId);
        if (!person) {
            console.log("Personne non trouvée avec ID:", personId); // Pour le débogage
            return 'Personne inconnue';
        }
        return `${person.firstName} ${person.lastName}`;
    }

    // Formater la date pour l'affichage
    formatBookingDate(date: Date | string): string {
        // Vérifier si c'est une date valide
        let dateObj: Date;
        
        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === 'string') {
            dateObj = new Date(date);
        } else {
            return 'Date invalide';
        }
        
        if (isNaN(dateObj.getTime())) {
            return 'Date invalide';
        }
        
        return dateObj.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}