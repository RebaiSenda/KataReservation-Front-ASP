// services/booking.service.ts
import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import Booking from '../models/booking';
import { ApiService } from './api.service';

interface BookingResponse {
    id: number;
    roomId: number;
    personId: number;
    bookingDate: string;
    startSlot: number;
    endSlot: number;
}

@Injectable({ providedIn: 'root' })
export default class BookingService {
    constructor(private apiService: ApiService) {}

    // Créer une nouvelle réservation
    create(booking: Booking): Observable<Booking> {
        const request = {
            roomId: booking.RoomId,
            personId: booking.PersonId,
            bookingDate: this.formatDate(booking.BookingDate),
            startSlot: booking.StartSlot,
            endSlot: booking.EndSlot
        };

        console.log("Envoi de la demande de réservation:", request);

        return this.apiService.post<BookingResponse>('/bookings', request).pipe(
            map(response => {
                console.log("Réponse de création:", response);
                return this.mapToBooking(response);
            }),
            catchError(error => {
                console.error("Erreur de création:", error);
                // Vérifier correctement la structure de l'erreur
                if (error.status === 409) {
                    // S'assurer que nous retransmettons l'erreur avec toutes les informations nécessaires
                    return throwError(() => ({
                        status: error.status,
                        message: error.error?.message || "Conflit de réservation",
                        error: error.error,
                        availableSlots: error.error?.availableSlots
                    }));
                }
                return throwError(() => error);
            })
        );
    }

    // Liste toutes les réservations
    list(): Observable<Booking[]> {
        console.log("Demande de liste des réservations");
        return this.apiService.get<BookingResponse[]>('/bookings').pipe(
            map(response => {
                console.log("Réponse de liste:", response);
                if (!Array.isArray(response)) {
                    console.error('Response is not an array:', response);
                    return [];
                }
                return response.map(booking => this.mapToBooking(booking));
            }),
            catchError(error => {
                console.error('Error listing bookings:', error);
                return throwError(() => error);
            })
        );
    }

    // Supprimer une réservation
    delete(id: number): Observable<void> {
        console.log("Demande de suppression de réservation:", id);
        return this.apiService.delete<void>(`/bookings/${id}`).pipe(
            catchError(error => {
                console.error('Error deleting booking:', error);
                return throwError(() => error);
            })
        );
    }

    // Méthode utilitaire pour convertir la réponse de l'API en modèle Booking
    private mapToBooking(response: BookingResponse): Booking {
        return {
            Id: response.id,
            RoomId: response.roomId,
            PersonId: response.personId,
            BookingDate: new Date(response.bookingDate),
            StartSlot: response.startSlot,
            EndSlot: response.endSlot
        };
    }

    // Formater une date pour l'API (YYYY-MM-DD)
    private formatDate(date: Date): string {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            // Utiliser la date actuelle si la date est invalide
            date = new Date();
            console.warn("Date invalide, utilisation de la date actuelle");
        }
        
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
}