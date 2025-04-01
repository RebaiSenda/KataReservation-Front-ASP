// responses/room.response.ts
import Booking from '../models/booking';

export interface RoomResponse {
    id: number;
    roomName: string;
    bookings: Booking[];
}

export interface RoomsResponse {
    rooms: RoomResponse[];
}