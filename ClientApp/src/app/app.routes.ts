import { Routes } from "@angular/router";
import AppLayoutNavComponent from "./layouts/layout-nav/layout-nav.component";
import  BookingComponent  from "./pages/booking/booking.component"; 
import RoomComponent from "./pages/room/room.component";
import {PersonComponent} from "./pages/person/person.component";
        // Importation nommée

export const routes: Routes = [
    {
        path: "",
        component: AppLayoutNavComponent,
        children: [
            { path: "", component: BookingComponent },
            { path: "booking", component: BookingComponent },
            { path: "room", component: RoomComponent },
            { path: "person", component: PersonComponent }
        ]
    },
    {
        path: "**",
        redirectTo: ""
    }
];