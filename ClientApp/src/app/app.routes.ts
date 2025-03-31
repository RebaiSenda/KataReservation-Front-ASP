import { Routes } from "@angular/router";
import AppLayoutNavComponent from "./layouts/layout-nav/layout-nav.component";

export const routes: Routes = [
    {
        path: "",
        component: AppLayoutNavComponent,
        children: [
            { path: "", loadComponent: () => import("./pages/booking/booking.component") },
            { path: "booking", loadComponent: () => import("./pages/booking/booking.component") },
            { path: "room", loadComponent: () => import("./pages/room/room.component") },
            { path: "person", loadComponent: () => import("./pages/person/person.component") }
        ]
    },
    {
        path: "**",
        redirectTo: ""
    }
];
