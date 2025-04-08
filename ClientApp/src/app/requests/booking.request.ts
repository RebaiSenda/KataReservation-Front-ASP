// requests/booking.request.ts
export interface CreateBookingRequest {
    roomId: number;
    personId: number;
    bookingDate: string; // Format ISO 8601: YYYY-MM-DD
    startSlot: number;
    endSlot: number;
}

export interface UpdateBookingRequest {
    roomId: number;
    personId: number;
    bookingDate: string; // Format ISO 8601: YYYY-MM-DD
    startSlot: number;
    endSlot: number;
}