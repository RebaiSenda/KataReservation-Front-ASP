import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import Person from '../models/person';
import Booking from '../models/booking';
import { ApiService } from './api.service';
import { CreatePersonRequest, UpdatePersonRequest } from '../requests/person.request';
import { PersonResponse, PersonsResponse } from '../responses/person.response';
import { BookingResponse } from '../responses/booking.response';

@Injectable({
  providedIn: 'root'
})
export default class PersonService {
  constructor(private apiService: ApiService) {}

  list(): Observable<Person[]> {
    return this.apiService.get<PersonsResponse>('/persons').pipe(
      map(response => {
        if (response && response.persons) {
          return response.persons.map(person => this.mapToPerson(person));
        }
        return [];
      })
    );
  }

  get(id: number): Observable<Person> {
    return this.apiService.get<PersonResponse>(`/persons/${id}`).pipe(
      map(response => this.mapToPerson(response))
    );
  }

  add(personRequest: CreatePersonRequest): Observable<Person> {
    return this.apiService.post<PersonResponse>('/persons', personRequest).pipe(
      map(response => this.mapToPerson(response))
    );
  }

  update(id: number, personRequest: UpdatePersonRequest): Observable<Person> {
    return this.apiService.put<PersonResponse>(`/persons/${id}`, personRequest).pipe(
      map(response => this.mapToPerson(response))
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/persons/${id}`);
  }

  private mapToPerson(response: PersonResponse): Person {
    return {
      id: response.id,
      firstName: response.firstName,
      lastName: response.lastName,
      bookings: this.mapToBookings(response.bookings || [])
    };
  }

  private mapToBookings(bookingResponses: BookingResponse[]): Booking[] {
    return bookingResponses.map((booking, index) => ({
      Id: booking.id || index, // Utiliser l'ID de la réponse ou l'index si ID n'existe pas
      RoomId: booking.roomId,
      PersonId: booking.personId,
      BookingDate: new Date(booking.bookingDate),
      StartSlot: booking.startSlot,
      EndSlot: booking.endSlot
    }));
  }
}