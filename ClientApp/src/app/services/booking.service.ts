import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import Booking from "../models/booking";

@Injectable({ providedIn: "root" })
export default class AppBookingService {
    constructor(private readonly http: HttpClient) { }

    add = (b: Booking) => this.http.post<number>("api/bookings", b);

    delete = (id: number) => this.http.delete(`api/bookings/${id}`);

    get = (id: number) => this.http.get<Booking>(`api/bookings/${id}`);

    inactivate = (id: number) => this.http.patch(`api/bookings/${id}/inactivate`, {});

    list = () => this.http.get<Booking[]>("api/bookings");

    update = (r: Booking) => this.http.put(`api/bookings/${r.Id}`, r);
}
