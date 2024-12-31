import { Component, OnInit } from '@angular/core';
import { ESIServiceService } from './Services/esiservice.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'Upwell Monitor';
  isLoggedIn: boolean = false;

  constructor(private esiService: ESIServiceService){
  }

  ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('code') && urlParams.has('state')) {
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        if (!code || !state) {
          console.error("Missing required query parameters.");
        } else {
          this.esiService.setLocalAuthData(code, state);
        }
    }

    this.isLoggedIn = this.esiService.checkTokenExpiry();
    
  }

  onLoginClick() {
    this.esiService.getAuthenticationUrl().subscribe(r => {
        // Assuming the backend sends an object with 'url' property
        const authenticationUrl = r.url;
        
        // Log the URL to the console (or use it in the application)
        console.log("Authentication URL:", authenticationUrl);
  
        // Redirect the user to the authentication URL
        window.location.href = authenticationUrl;
      }, (error) => {
        console.error("Error fetching authentication URL:", error);
      }
    );
  }
}
