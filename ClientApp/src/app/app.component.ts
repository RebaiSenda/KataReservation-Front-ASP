// src/app/app.component.ts
import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ManagementService } from './services/management.service';
import { User } from './models/user';

@Component({
    selector: "app",
    standalone: true, // Mark as a standalone component
    imports: [RouterOutlet],
    template: "<router-outlet />"
})
export class AppComponent implements OnInit {
    user: User | undefined;

    constructor(private managementService: ManagementService) {}

    async ngOnInit() {
        try {
            this.user = await this.managementService.getUser();
            // Proceed with your application logic
        } catch (error) {
            // Handle any further errors if necessary
            console.error(error); // Optionally log the error
        }
    }
}