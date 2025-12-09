import { Component, ApplicationConfig } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { routes } from './app/app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};

@Component({
  selector: 'app-root',
  template: `<router-outlet />`,
  imports: [RouterOutlet],
})
export class App {}

bootstrapApplication(App, appConfig);
