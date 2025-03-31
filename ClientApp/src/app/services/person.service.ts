import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import Person from "../models/person";

@Injectable({ providedIn: "root" })
export default class AppPersonService {
    constructor(private readonly http: HttpClient) { }

    add = (user: Person) => this.http.post<number>("api/persons", user);

    delete = (id: number) => this.http.delete(`api/persons/${id}`);

    get = (id: number) => this.http.get<Person>(`api/persons/${id}`);

    list = () => this.http.get<Person[]>("api/persons");

    update = (p: Person) => this.http.put(`api/persons/${p.id}`, p);
}
