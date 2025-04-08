// services/booking.service.ts
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import Booking from '../models/booking';
import { ApiService } from './api.service';
import { CreateBookingRequest } from '../requests/booking.request';
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

    // Supprimer une réservation
    delete(id: number): Observable<void> {
        return this.apiService.delete<void>(`/bookings/${id}`);
    }

    // Méthode utilitaire pour convertir la réponse de l'API en modèle Booking
    private mapToBooking(response: BookingResponse): Booking {
        return {
            Id: 0, // L'ID n'est pas retourné dans la réponse d'après l'API
            RoomId: response.roomId,
            PersonId: response.personId,
            BookingDate: new Date(response.bookingDate),
            StartSlot: response.startSlot,
            EndSlot: response.endSlot
        };
    }

    // Formater une date pour l'API (YYYY-MM-DD)
    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }
}