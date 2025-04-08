// services/booking.service.ts
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import Booking from '../models/booking';
import { ApiService } from './api.service';
import { CreateBookingRequest, UpdateBookingRequest } from '../requests/booking.request';
import { BookingResponse } from '../responses/booking.response';

@Injectable({ providedIn: 'root' })
export default class BookingService {
    constructor(private apiService: ApiService) {}

    // Créer une nouvelle réservation
    create(booking: Booking): Observable<Booking> {
        const request: CreateBookingRequest = {
            roomId: booking.RoomId,
            personId: booking.PersonId,
            bookingDate: this.formatDate(booking.BookingDate),
            startSlot: booking.StartSlot,
            endSlot: booking.EndSlot
        };

        return this.apiService.post<BookingResponse>('/bookings', request).pipe(
            map(response => this.mapToBooking(response))
        );
    }

    // Obtenir une réservation par ID
    get(id: number): Observable<Booking> {
        return this.apiService.get<BookingResponse>(`/bookings/${id}`).pipe(
            map(response => this.mapToBooking(response))
        );
    }

    // Liste toutes les réservations
    list(): Observable<Booking[]> {
        return this.apiService.get<BookingResponse[]>('/bookings').pipe(
            map(response => response.map(booking => this.mapToBooking(booking)))
        );
    }

    // Mettre à jour une réservation
    update(id: number, booking: Booking): Observable<Booking> {
        const request: UpdateBookingRequest = {
            roomId: booking.RoomId,
            personId: booking.PersonId,
            bookingDate: this.formatDate(booking.BookingDate),
            startSlot: booking.StartSlot,
            endSlot: booking.EndSlot
        };

        return this.apiService.put<BookingResponse>(`/bookings/${id}`, request).pipe(
            map(response => this.mapToBooking(response))
        );
    }

    // Supprimer une réservation
    delete(id: number): Observable<void> {
        return this.apiService.delete<void>(`/bookings/${id}`);
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
        try {
            if (!date) {
                throw new Error("Date invalide");
            }
            
            // Vérifier si c'est réellement un objet Date
            if (!(date instanceof Date) || isNaN(date.getTime())) {
                throw new Error("Date invalide");
            }
            
            // Format manuel YYYY-MM-DD sans utiliser toISOString
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            
            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error("Erreur de formatage de date:", error);
            throw new Error("Impossible de formater la date correctement");
        }
    }
}