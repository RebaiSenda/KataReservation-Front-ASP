// responses/booking.response.ts
export interface BookingResponse {
    id: number;
    roomId: number;
    personId: number;
    bookingDate: string;
    startSlot: number;
    endSlot: number;
}

export interface BookingConflictResponse {
    message: string;
    roomId: number;
    bookingDate: string;
    availableSlots: number[];
}