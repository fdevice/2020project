import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../services/userData.service';

@Component({
  selector: 'gorilla-hq',
  templateUrl: './hq.component.html',
  styleUrls: ['./hq.component.scss']
})
export class HqComponent implements OnInit {

  loggedUser: string;
  savedCV: boolean;

  constructor(
    private userDataService: UserDataService
  ) { }

  ngOnInit() {
    this.loggedUser = this.userDataService.getLoggedAs();      
    this.savedCV = this.userDataService.retrieveCV(this.loggedUser);
  }

}
