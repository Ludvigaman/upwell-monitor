import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { SsoToken } from '../Models/SsoToken';
import { AuthorizedCharacterData } from '../Models/AuthorizedCharacterData';
import { API_URL } from '../Constants/Constants';

@Injectable({
  providedIn: 'root'
})
export class ESIServiceService {

  baseUrl = API_URL;

  constructor(private http: HttpClient) { }

  setLocalAuthData(code: string, state: string){
    const storedChallengeCode = localStorage.getItem("challengeCode");

    if(storedChallengeCode == null){
      console.error("ChallengeCode is missing from localStorage...")
      return;
    }

    if (!state.includes("authentication")) {
        console.error("State validation failed...");
        return;
    }

    console.log("Authenticating to ESI and storing character data...")
    const _url = this.baseUrl + `/api/ESI/createTokenAndGetData?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&challengeCode=${encodeURIComponent(storedChallengeCode)}`;

    this.http.get<AuthorizedCharacterData>(_url).pipe(catchError(async (err) => new AuthorizedCharacterData())).subscribe(r => {
      localStorage.setItem("authData", JSON.stringify(r));
      console.log("Character data loaded...")
      window.history.replaceState({}, '', window.location.pathname);
    }, err => {
      console.error("Failed to authenticate...")
    });
  }

  getAuthenticationUrl() {
    var challengeCode = this.createChallengeCode();
    localStorage.setItem("challengeCode", challengeCode);
    var _url = this.baseUrl + `/api/ESI/createAuthenticationUrl?challengeCode=${encodeURIComponent(challengeCode)}`;
  
    // Expect the response to be an object with a 'url' property of type string
    return this.http.get<{ url: string }>(_url);
  }
  

  loadLocalAuthData() {
    var data: AuthorizedCharacterData = new AuthorizedCharacterData();
    var jsonData = localStorage.getItem("authData");
    if(jsonData != null){
      data = JSON.parse(jsonData);
      return data
    } else {
      return null;
    }
  }

  createChallengeCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }
    return result;
  }
 
}
