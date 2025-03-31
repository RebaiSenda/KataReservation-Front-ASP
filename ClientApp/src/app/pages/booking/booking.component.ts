import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import Booking from "src/app/models/booking";

@Component({
    selector: "app-booking",
    templateUrl: "./booking.component.html",
    imports: [
        CommonModule,
        FormsModule
    ]
})
export default class AppFilesComponent {
    public bookings: Booking[] = [];

    constructor() { }

    public async getBookings() {
        
    }
}
