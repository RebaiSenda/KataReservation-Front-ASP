// services/booking.service.ts
import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import Booking from '../models/booking';
import { ApiService } from './api.service';

// Interface améliorée pour correspondre exactement à la réponse API
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

    // Liste toutes les réservations avec meilleure gestion des erreurs
    list(): Observable<Booking[]> {
        console.log("Demande de liste des réservations");
        return this.apiService.get<BookingResponse[]>('/bookings').pipe(
            map(response => {
                console.log("Réponse brute de l'API (liste):", response);
                
                // Vérification supplémentaire du format de la réponse
                if (!response) {
                    console.error('Response is null or undefined:', response);
                    return [];
                }
                
                if (!Array.isArray(response)) {
                    // Si la réponse n'est pas un tableau mais un objet qui contient peut-être le tableau
                    if (response && typeof response === 'object' && 'items' in response) {
                        // @ts-ignore - Certaines APIs renvoient les items dans une propriété `items`
                        const items = response.items;
                        if (Array.isArray(items)) {
                            return items.map(booking => this.mapToBooking(booking));
                        }
                    }
                    console.error('Response is not an array and does not contain items:', response);
                    return [];
                }
                
                // Mapper chaque élément et filtrer les réservations invalides
                return response
                    .map(booking => {
                        try {
                            return this.mapToBooking(booking);
                        } catch (err) {
                            console.error('Error mapping booking:', booking, err);
                            return null;
                        }
                    })
                    .filter(booking => booking !== null) as Booking[];
            }),
            catchError(error => {
                console.error('Error listing bookings:', error);
                return throwError(() => error);
            })
        );
    }

    // Supprimer une réservation avec meilleure gestion des erreurs
    delete(id: number): Observable<void> {
        console.log("Demande de suppression de réservation:", id);
        return this.apiService.delete<void>(`/bookings/${id}`).pipe(
            map(response => {
                console.log("Réponse de suppression:", response);
                return response;
            }),
            catchError(error => {
                // Vérifier si l'erreur est en fait un succès
                if (error.status === 204) {
                    // C'est normal de recevoir un 204 No Content après suppression
                    console.log("Suppression réussie (status 204)");
                    return new Observable<void>(subscriber => {
                        subscriber.next();
                        subscriber.complete();
                    });
                }
                
                console.error('Error deleting booking:', error);
                return throwError(() => error);
            })
        );
    }

    // Méthode utilitaire améliorée pour convertir la réponse de l'API en modèle Booking
    private mapToBooking(response: BookingResponse): Booking {
        console.log("Mapping d'une réservation:", response);
        
        if (!response) {
            throw new Error('Cannot map null or undefined response');
        }
        
        // Assurer que toutes les propriétés nécessaires sont présentes
        const id = response.id ?? 0; // Utiliser la casse de l'API
        const roomId = response.roomId ?? 0;
        const personId = response.personId ?? 0;
        
        // Conversion robuste de la date
        let bookingDate: Date;
        try {
            bookingDate = new Date(response.bookingDate);
            if (isNaN(bookingDate.getTime())) {
                console.warn("Date conversion failed, using current date");
                bookingDate = new Date();
            }
        } catch (err) {
            console.warn("Error converting date:", err);
            bookingDate = new Date();
        }
        
        return {
            Id: id,
            RoomId: roomId,
            PersonId: personId,
            BookingDate: bookingDate,
            StartSlot: response.startSlot ?? 1,
            EndSlot: response.endSlot ?? 2
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