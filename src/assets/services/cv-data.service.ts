import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CVData } from '../models/cvData.model';
import { BaseCV } from 'src/assets/models/baseCV.model';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl;

@Injectable({ providedIn: "root" })
export class CVDataService {

    baseCVData: CVData = {};    

    name: string;
    surname: string;
    email: string;
    phone: string;
    position: string;
    location: string;
    availability: string;
    disposition: string;
    employment: string[] = new Array();  
    salary: string;  
    totalExperienceLength: number;
    totalEducationLength: number;
    totalCoursesLength: number;
    totalLanguagesLength: number;
    startWork: any = new Array();
    finishWork: any = new Array();
    employer: any = new Array();
    trade: any = new Array();
    occupation: any = new Array();
    responsibilities: any = new Array();
    startEducation: any = new Array();
    finishEducation: any = new Array();
    schoolName: any = new Array();
    schoolProfile: any = new Array();
    startCourse: any = new Array();
    finishCourse: any = new Array();
    courseName: any = new Array();
    courseSubject: any = new Array();
    languageName: any = new Array();
    languageLevel: any = new Array();
    languageDescription: any = new Array();
    advantages: any = new Array();    
    answers: any = new Array();
    drivingLicence: string;
    computerPrograms: string;
    programmingLanguages: string;
    devices: string;
    permissions: string;
    regulations: string;
    otherSkills: string;
    hobbies: string;

    constructor(private http: HttpClient, private router: Router) {}

    sendBaseCVData() {
        
        let loggedUserEmail = localStorage.getItem("loggedAsEmail");  // E-mail zalogowanego użytkownika

        console.log(loggedUserEmail);

        this.baseCVData.name = this.name;
        this.baseCVData.surname = this.surname;
        this.baseCVData.contactEmail = this.email;
        this.baseCVData.phone = this.phone;
        this.baseCVData.position = this.position;
        this.baseCVData.disposition = this.disposition;
        this.baseCVData.location = this.location;
        this.baseCVData.availability = this.availability;
        this.baseCVData.employment = this.employment;
        this.baseCVData.salary = this.salary;

        console.log(this.baseCVData);
        console.log(this.employment);

        const baseCV: BaseCV = { loggedUserEmail: loggedUserEmail, cvData: this.baseCVData };

        console.log(baseCV);

        this.http
            .put(BACKEND_URL + "/user/cv", baseCV)
            .subscribe(()=>{

            }, error => {

            });
    }

}