import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { UserData } from "../models/userData.model";
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl;

@Injectable({ providedIn: "root" })
export class UserDataService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  // private userId: string;
  private loggedAs: string;
  private hasBaseCV: boolean;
  private authStatusListener = new Subject<boolean>();

  private receivedCVStatus = new Subject<any>();
  public hasBaseCVUpdate = this.receivedCVStatus.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  getLoggedAs() {
    this.loggedAs = localStorage.getItem("loggedAsEmail");
    return this.loggedAs;
  } 

  retrieveCV(email: string) {
    this.http.get<{ hasBaseCV: boolean }>(BACKEND_URL + "/user/" + email)
      .subscribe(result => {
        this.hasBaseCV = result.hasBaseCV;
        console.log("Czy ma base CV? " + this.hasBaseCV); 
        this.receivedCVStatus.next(this.hasBaseCV);       
      });      
  }  

//   getToken() {
//     return this.token;
//   }

//   getIsAuth() {
//     return this.isAuthenticated;
//   }

  // getUserId() {
  //   return this.userId;
  // }

   

//   login(email: string, password: string) {
//     const authData: AuthData = { email: email, password: password };
//     this.http
//       .post<{ token: string; expiresIn: number; userId: string }>(
//         "http://localhost:3000/api/user/login",
//         authData
//       )
//       .subscribe(response => {
//         const token = response.token;
//         this.token = token;
//         if (token) {
//           const expiresInDuration = response.expiresIn;
//           this.setAuthTimer(expiresInDuration);
//           this.isAuthenticated = true;
//           // this.userId = response.userId;
//           this.loggedAs = authData.email;
//           this.authStatusListener.next(true);
//           const now = new Date();
//           const expirationDate = new Date(
//             now.getTime() + expiresInDuration * 1000
//           );
//           console.log(expirationDate);
//           this.saveAuthData(token, expirationDate);        //this.userId w tej chwili wykomentowane
//           this.router.navigate(["/"]);
//         }
//       }, error => {
//         this.authStatusListener.next(false);
//       });
//   }    
  
}
