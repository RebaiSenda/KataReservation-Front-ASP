import Person from "./person";
import Room from "./room";

export default interface Booking {
    Id: number;
    RoomId: number;
    PersonId: number;
    BookingDate: Date;
    StartSlot: number;
    EndSlot: number;
    Person: Person 
    Room: Room;
}
