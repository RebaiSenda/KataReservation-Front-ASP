import { Component } from "@angular/core";
import { User } from '../../models/user'; 
import { ManagementService } from '../../services/management.service';

@Component({
    selector: "app-header",
    templateUrl: "./header.component.html"
})


export default class AppHeaderComponent { 
    user: User | undefined;

    constructor(private managementService: ManagementService) {}

    async ngOnInit() {
            this.user = await this.managementService.getUser();
            // Proceed with your application logic
    }
}
