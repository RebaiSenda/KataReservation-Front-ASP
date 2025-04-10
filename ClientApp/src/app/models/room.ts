import Booking from "./booking";

export default interface Room {
    Id: number;
    RoomName: string;
    Bookings: Booking[];
}
