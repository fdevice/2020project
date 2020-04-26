import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CVData } from '../models/cvData.model';
import { BaseCV } from 'src/assets/models/baseCV.model';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

const BACKEND_URL = environment.apiUrl;

@Injectable({ providedIn: "root" })
export class CVDataService {      
            
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
    schoolType: any = new Array();
    schoolTypeIndex: any = new Array();
    schoolMode: any = new Array();
    startCourse: any = new Array();
    finishCourse: any = new Array();
    courseName: any = new Array();
    courseSubject: any = new Array();
    languageName: any = new Array();
    languageLevel: any = new Array();
    languageDescription: any = new Array();
    advantages: any = new Array(); 
    selectedAdvantagesIndex: any = new Array();   
    answers: any = new Array();
    drivingLicence: string;
    knownPrograms: string;
    programmingLanguages: string;
    devices: string;
    permissions: string;
    regulations: string;
    otherSkills: string;
    hobbies: string; 
    
    private receivedCVData = new Subject<any>();
    public receivedFormData = this.receivedCVData.asObservable();   // Zmienna pomocnicza przechowująca dane bazowego CV pobrane z bazy

    constructor(private http: HttpClient, private router: Router) {}

    sendBaseCVData() {        

        let baseCVData: CVData = {
            name: '',
            surname: '',
            contactEmail: '',
            phone: '',      
            photoPath: '',
            experience: [],
            education: [],
            courses: [],
            languages: [],
            drivingLicenceChecked: false,
            drivingLicenceDescription: '',
            knownProgramsChecked: false,
            knownProgramsDescription: '',
            programmingSkillsChecked: false,
            programmingSkillsDescription: '',
            devicesUsageChecked: false,
            devicesUsageDescription: '',
            permissionsChecked: false,
            permissionsDescription: '',
            knownRegulationsChecked: false,
            knownRegulationsDescription: '',
            otherSkillsChecked: false,
            otherSkillsDescription: '',
            advantages: [],
            selectedAdvantagesIndex: [],
            hobby: '',
            creationTime: null
        };         

        console.dir(baseCVData);               
        
        let loggedUserEmail = localStorage.getItem("loggedAsEmail");  // E-mail zalogowanego użytkownika       
        
        console.log(loggedUserEmail);    
        console.log(this.drivingLicence);
        console.log(this.otherSkills);    

        // WARUNKI ZATRUDNIENIA
        baseCVData.position = this.position;
        baseCVData.disposition = this.disposition;
        baseCVData.location = this.location;
        baseCVData.availability = this.availability;
        baseCVData.employment = this.employment;
        baseCVData.salary = this.salary;        

        // DANE OSOBOWE + ZDJĘCIE
        baseCVData.name = this.name;
        baseCVData.surname = this.surname;
        baseCVData.contactEmail = this.email;
        baseCVData.phone = this.phone;

        console.log("Obiekt baseCVData z niektórymi wartościami: " + baseCVData.name);    
        
        // DOŚWIADCZENIE ZAWODOWE
        for (let i = 0; i < this.totalExperienceLength; i++) {            

            if (this.employer[i] != undefined) {                

                // for (let j = 0; j < this.responsibilities[i].length; j++) {                    
                //     console.log(this.responsibilities[i]);                    
                // };     
                
                // console.log(this.responsibilities[i]);

                let experienceData: any[] = [
                {
                   workStart: this.startWork[i],
                   workFinish: this.finishWork[i],
                   employerName: this.employer[i],
                   trade: this.trade[i],
                   occupation: this.occupation[i],
                   responsibilities: this.responsibilities[i]
                }
                ];

                baseCVData.experience.push(experienceData);                                                                                                              
              
            } 
            else {
                console.log("Doświadczenie zawodowe puste!")
            }
        };


        // EDUKACJA   
        for (let e = 0; e < this.totalEducationLength; e++) {

            if (this.schoolName[e] != undefined) {      
                
                let educationData: any[] = [
                {
                    educationStart: this.startEducation[e],
                    educationFinish: this.finishEducation[e],
                    schoolName: this.schoolName[e],
                    schoolProfile: this.schoolProfile[e],
                    schoolType: this.schoolType[e],
                    schoolTypeIndex: this.schoolTypeIndex[e],
                    schoolMode: this.schoolMode[e]
                }
                ];
                
                baseCVData.education.push(educationData);
        
            } else {
                console.log("Edukacja pusta!")
            };
        };


        // KURSY  
        for (let c = 0; c < this.totalCoursesLength; c++) {

            if (this.courseName[c] != undefined) {      
                
                let coursesData: any[] = [
                {
                    courseStart: this.startCourse[c],
                    courseFinish: this.finishCourse[c],
                    courseName: this.courseName[c],
                    courseSubject: this.courseSubject[c]                    
                }
                ];
                
                baseCVData.courses.push(coursesData);
        
            } else {
                console.log("Kursy puste!")
            };
        };

        // JĘZYKI
        for (let l = 0; l < this.totalLanguagesLength; l++) {

            if (this.languageName[l] != undefined) {      
                
                let languagesData: any[] = [
                {
                    languageName: this.languageName[l],
                    languageLevel: this.languageLevel[l],
                    languageDescription: this.languageDescription[l]                                       
                }
                ];
                
                baseCVData.languages.push(languagesData);
        
            } else {
                console.log("Języki puste!")
            };
        };


        // UMIEJĘTNOŚCI
        if (this.drivingLicence != undefined && this.drivingLicence !== '') {
            baseCVData.drivingLicenceChecked = true;
            baseCVData.drivingLicenceDescription = this.drivingLicence;
        };
        if (this.knownPrograms != undefined && this.knownPrograms !== '') {
            baseCVData.knownProgramsChecked = true;
            baseCVData.knownProgramsDescription = this.knownPrograms;
        };
        if (this.programmingLanguages != undefined && this.programmingLanguages !== '') {
            baseCVData.programmingSkillsChecked = true;
            baseCVData.programmingSkillsDescription = this.programmingLanguages;
        };
        if (this.devices != undefined && this.devices !== '') {
            baseCVData.devicesUsageChecked = true;
            baseCVData.devicesUsageDescription = this.devices;
        };
        if (this.permissions != undefined && this.permissions !== '') {
            baseCVData.permissionsChecked = true;
            baseCVData.permissionsDescription = this.permissions;
        };
        if (this.regulations != undefined && this.regulations !== '') {
            baseCVData.knownRegulationsChecked = true;
            baseCVData.knownRegulationsDescription = this.regulations;
        };
        if (this.otherSkills != undefined && this.otherSkills !== '') {
            baseCVData.otherSkillsChecked = true;
            baseCVData.otherSkillsDescription = this.otherSkills;
        };

        // MOCNE STRONY
        if (this.advantages.length > 0) {
            console.log(this.advantages.length);
            baseCVData.advantages = this.advantages;
            baseCVData.selectedAdvantagesIndex = this.selectedAdvantagesIndex;
        };        
        
        // baseCVData.selectedAdvantagesIndex = this.selectedAdvantagesIndex;

        // HOBBY
        baseCVData.hobby = this.hobbies;

        // DATA UTWORZENIA
        baseCVData.creationTime = new Date();

        console.dir(baseCVData);       

        const baseCV: BaseCV = { loggedUserEmail: loggedUserEmail, cvData: baseCVData };

        console.log(baseCV);

        this.http
            .put(BACKEND_URL + "/user/cv", baseCV)
            .subscribe((result)=>{
                console.log(result);
            }, error => {
                console.log(error);                
            });
    };

    getBaseCVData() {
        let email = localStorage.getItem("loggedAsEmail");  // E-mail zalogowanego użytkownika 
        
        this.http
            .get(BACKEND_URL + "/user/cv/" + email)
            .subscribe((result) => {                
                this.receivedCVData.next(result);               
            }, error => {
                console.log(error);
            });                  
    };

}