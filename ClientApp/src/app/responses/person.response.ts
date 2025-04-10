// responses/person.response.ts
import { BookingResponse } from './booking.response';

export interface PersonResponse {
  id: number;
  firstName: string;
  lastName: string;
  bookings?: BookingResponse[];
}

export interface PersonsResponse {
  persons: PersonResponse[];
}