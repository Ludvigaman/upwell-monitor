import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
import { AuthorizedCharacterData } from '../Models/AuthorizedCharacterData';
import { API_URL, WHITELIST } from '../Constants/Constants';
import { StructureItem } from '../Models/StructureItem';

@Injectable({
  providedIn: 'root'
})
export class ESIServiceService {

  baseUrl = API_URL;

  constructor(private http: HttpClient) { }

  getStructureList() {
    var validationData = this.loadLocalAuthData();
    if(validationData != null){
      const _url = `${this.baseUrl}/api/ESI/getStructureList`;
  
      this.http.post<StructureItem[]>(_url, validationData).subscribe(r => {
        console.log(r);
        localStorage.setItem("lastFetch", new Date().toISOString());
        localStorage.setItem("structures", JSON.stringify(r));
        location.reload();
      });
    } else {
      console.log("Error in getStructureList")
    }
  }  

  loadStructureListFromStorage(): StructureItem[]{
    var structureList: StructureItem[];
    var jsonData = localStorage.getItem("structures");
    if(jsonData != null){
      structureList = JSON.parse(jsonData);
    } else {
      structureList = [];
    }

    return structureList;
  }

  checkWhitelist(){
    var data = this.loadLocalAuthData();
    if(data != null){
      if(WHITELIST.includes(data?.corporationID.toString())){
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /* ------------- Authentication methods --------------------- */

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
      localStorage.removeItem("challengeCode");
      console.log("Character data loaded...");
      window.history.replaceState({}, '', window.location.pathname);
      location.reload();
    }, err => {
      console.error("Failed to authenticate...")
    });
  }

  refreshLocalAuthData(){
    var data = this.loadLocalAuthData();
    if(data != null && JSON.stringify(data) != '{}'){
      var refreshToken = data!.refreshToken;

      const _url = this.baseUrl + `/api/ESI/refreshTokenAndGetData?refreshToken=${encodeURIComponent(refreshToken)}`;
      this.http.get<AuthorizedCharacterData>(_url).pipe(catchError(async (err) => new AuthorizedCharacterData())).subscribe(r => {
        localStorage.setItem("authData", JSON.stringify(r));
        console.log("Character data refreshed...");
        window.history.replaceState({}, '', window.location.pathname);
      }, err => {
        console.error("Failed to refresh...")
      });
    } else {
      this.clearLocalAuthData();
    }
  }

  getAuthenticationUrl() {
    var challengeCode = this.createChallengeCode();
    localStorage.setItem("challengeCode", challengeCode);
    var _url = this.baseUrl + `/api/ESI/createAuthenticationUrl?challengeCode=${encodeURIComponent(challengeCode)}`;

    return this.http.get<{ url: string }>(_url);
  }

  loadLocalAuthData(): AuthorizedCharacterData | null {
    var data: AuthorizedCharacterData = new AuthorizedCharacterData();
    var jsonData = localStorage.getItem("authData");
    if(jsonData != null){
      data = JSON.parse(jsonData) as AuthorizedCharacterData;
      return data
    } else {
      return null;
    }
  }

  getLastUpdateTime(){
    var dateString = localStorage.getItem("lastFetch");
    if(dateString != null){
      var date = new Date(dateString);
      return date;
    }
    return null;
  }

  clearLocalAuthData(){
    localStorage.removeItem("authData");
  }

  logOff(){
    localStorage.clear();
  }

  checkTokenExpiry(): boolean{
    var data = this.loadLocalAuthData();

    if(data){
      var expiryDate = new Date(data!.expiresOn);
      var currentDate = new Date();
      if (currentDate < expiryDate) {
        console.log('SSO token still valid...');
        return true;
        // Add your action here
      } else {
        console.log('SSO token expired, refreshing...');
        this.refreshLocalAuthData();
        return true;
        // Add your alternative action here
      }
    } else {
      this.clearLocalAuthData();
      return false;
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
