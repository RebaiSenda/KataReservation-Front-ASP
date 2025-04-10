import Booking from "./booking";

export default interface Person {
    id: number;
    firstName: string;
    lastName: string;
    bookings: Booking[];
}
