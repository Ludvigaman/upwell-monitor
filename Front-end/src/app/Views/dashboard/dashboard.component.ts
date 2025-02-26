import { Component, OnInit } from '@angular/core';
import { ESIServiceService } from '../../Services/esiservice.service';
import { StructureItem } from '../../Models/StructureItem';
import { AuthorizedCharacterData } from '../../Models/AuthorizedCharacterData';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit{

  lastUpdateTime: Date;
  structureData: StructureItem[];
  characterData: AuthorizedCharacterData;
  dateString = "N/A";
  name = "";
  view = 0;
  maxFuel: string = "90";
  maxFuelNumber: number = 90;
  whitelisted: boolean;

  totalFuelBlocksPerDay = 0;

  private intervalId: any;

  constructor(private esiService: ESIServiceService){

  }
  
  async ngOnInit(){

    this.whitelisted = await this.esiService.checkWhitelist();

    if(this.whitelisted){
      console.log("Checking data age...")

      this.checkDataAge();
      this.intervalId = setInterval(() => {
        console.log("Checking data age...")
        this.checkDataAge();
      }, 60000);
      
      this.loadData();

    } else {
      var charData = this.esiService.loadLocalAuthData();
      if(charData != null){
        this.characterData = charData;
        this.name = charData.characterName;
      }
      this.view = 4;
    }
  }

  createServiceString(structure: StructureItem){
    if(structure.services == null || structure.services == undefined){
      return "-"
    }
    return structure.services.join(", ");
  }

  onFuelChange(event: MatSelectChange): void {
    const selectedValue = event.value;
    this.maxFuelNumber = parseInt(selectedValue, 10);
    this.esiService.saveFuelBayDays(this.maxFuelNumber);
  }

  loadTotalConsumption() {    
    this.totalFuelBlocksPerDay = 0;
    this.structureData.forEach(s => {
      this.totalFuelBlocksPerDay = this.totalFuelBlocksPerDay + s.fuelBlocksPerDay;
    })
  }

  openStatistics(){
    this.view = 2;
    this.loadTotalConsumption();
  }

  loadData(){
    this.structureData = [];
    this.structureData = this.esiService.loadStructureListFromStorage();

    var fuelBayAmount = this.esiService.loadFuelBayDays();
    this.maxFuel = fuelBayAmount.toString();
    this.maxFuelNumber = fuelBayAmount;

    this.structureData.sort((a, b) => {
      const dateA = new Date(a.fuelExpires).getTime();
      const dateB = new Date(b.fuelExpires).getTime();
      return dateA - dateB; // Ascending order (earliest dates first)
    });
    var charData = this.esiService.loadLocalAuthData();
    if(charData != null){
      this.characterData = charData;
      this.name = charData.characterName;
    }

    this.loadTotalConsumption();

    if(this.structureData.length > 0){
      this.view = 1;
    }
  }

  checkDataAge(){
    var d = this.esiService.getLastUpdateTime();

    if(d != null){
      var now = new Date();
      this.lastUpdateTime = d;
      this.dateString = this.getTimeDifference(this.lastUpdateTime, now)
      if(this.dateString != "Up to date"){
        this.refreshData();
      } else {
        console.log("Data still up to date...")
      }
    } else {
      this.refreshData();
    }
  }

  async refreshData(){
    if(!localStorage.getItem("error")){
      console.log("Refreshing data...")
      this.esiService.checkTokenExpiry();
      this.esiService.getStructureList();
    } else {
      this.view = 5;
      this.whitelisted = false;
    }
  }

  logOut(){
    this.esiService.logOff();
    location.reload();
  }

  nextShipment(structure: StructureItem){
    var desiredAmount = (this.maxFuelNumber * structure.fuelBlocksPerDay) - structure.fuelBlocksInFuelBay;
    if(desiredAmount < 0){
      return 0;
    } else {
      return desiredAmount;
    }
  }

  getTextColor(daysLeft: number): string {
    if (daysLeft <= 7) {
      return 'red'; // Critical: 1 day or less
    } else if (daysLeft <= 14) {
      return 'orange'; // Warning: 2-3 days
    } else if (daysLeft <= 30) {
      return 'yellow'; // Warning: 2-3 days
    } else {
      return 'green'; // Safe: More than 3 days
    }
  }

  daysUntil(date: Date | string): number {
    const targetDate = new Date(date); // Ensure it's a Date object
    const now = new Date(); // Get the current date
    const timeDiff = targetDate.getTime() - now.getTime(); // Difference in milliseconds
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return daysLeft;
  }

  progressBarValue(days: number){
    return (days / this.maxFuelNumber) * 100;
  }

  getStructureImagePath(type: number){
    switch(type){
      case 35832:
        return "/assets/items/Astrahus.jpg";
      case 35833:
        return "/assets/items/Fortizar.jpg";
      case 35834:
        return "/assets/items/Keepstar.jpg";
      case 35835:
        return "/assets/items/Athanor.jpg";
      case 35836:
        return "/assets/items/Tatara.jpg";
      case 35825:
        return "/assets/items/Raitaru.jpg";
      case 35826:
        return "/assets/items/Azbel.jpg";
      case 35827:
        return "/assets/items/Sotiyo.jpg";
      default:
        return "";
    }
  }

  getStructureIconPath(type: number){
    switch(type){
      case 35832:
        return "/assets/items/citadelMedium.png";
      case 35833:
        return "/assets/items/citadelLarge.png";
      case 35834:
        return "/assets/items/citadelExtraLarge.png";
      case 35835:
        return "/assets/items/refineryMedium.png";
      case 35836:
        return "/assets/items/refineryLarge.png";
      case 35825:
        return "/assets/items/engineeringComplexMedium.png";
      case 35826:
        return "/assets/items/engineeringComplexLarge.png";
      case 35827:
        return "/assets/items/engineeringComplexExtraLarge.png";
      default:
        return "";
    }
  }

  getStructureTypeName(type: number){
    switch(type){
      case 35832:
        return "Astrahus";
      case 35833:
        return "Fortizar";
      case 35834:
        return "Keepstar";
      case 35835:
        return "Athanor";
      case 35836:
        return "Tatara";
      case 35825:
        return "Raitaru";
      case 35826:
        return "Azbel";
      case 35827:
        return "Sotiyo";
      default:
        return "";
    }
  }
  

  getTimeDifference(lastUpdateTime: Date, dateNow: Date): string {
    const msDifference = dateNow.getTime() - lastUpdateTime.getTime();

    const seconds = Math.floor(msDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let result = '';

    if (days > 0) {
        result += `${days} Day${days > 1 ? 's' : ''}`;
    }

    if (hours % 24 > 0) {
        if (result) result += ' and ';
        result += `${hours % 24} Hour${hours % 24 > 1 ? 's' : ''}`;
    }

    if (!result) {
        result = 'Up to date';
    }

    return result;
  }
}
