import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UserDataService } from '../../services/userData.service';

@Component({
  selector: 'gorilla-hq',
  templateUrl: './hq.component.html',
  styleUrls: ['./hq.component.scss']
})
export class HqComponent implements OnInit {

  loggedUser: string;
  hasBaseCV: boolean;

  constructor(
    private userDataService: UserDataService
  ) { }

  ngOnInit() {
    this.loggedUser = this.userDataService.getLoggedAs();      
    this.userDataService.retrieveCV(this.loggedUser);
    this.userDataService.hasBaseCVUpdate.subscribe((result) => {
      this.hasBaseCV = result;
      // localStorage.setItem("baseCV", this.hasBaseCV.toString());
    });
  }   
}
