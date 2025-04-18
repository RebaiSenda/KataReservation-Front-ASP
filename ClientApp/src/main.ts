// src/main.ts
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "src/app/app.component"; // Use named import
import { appConfiguration } from "src/app/app.configuration";

bootstrapApplication(AppComponent, appConfiguration).catch((error) => console.error(error));