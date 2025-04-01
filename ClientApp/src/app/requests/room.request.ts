// requests/room.request.ts
export interface CreateRoomRequest {
    roomName: string;
}

export interface UpdateRoomRequest {
    roomName: string;
}

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