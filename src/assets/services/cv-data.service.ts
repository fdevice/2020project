import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CVData } from '../models/cvData.model';
import { BaseCV } from 'src/assets/models/baseCV.model';
import { environment } from 'src/environments/environment';

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
    schoolMode: any = new Array();
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
    knownPrograms: string;
    programmingLanguages: string;
    devices: string;
    permissions: string;
    regulations: string;
    otherSkills: string;
    hobbies: string;

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
            hobby: ''
        };         

        console.dir(baseCVData);               
        
        let loggedUserEmail = localStorage.getItem("loggedAsEmail");  // E-mail zalogowanego użytkownika        

        // const bCVData = new FormData();

        console.log(loggedUserEmail);    
        console.log(this.drivingLicence);
        console.log(this.otherSkills);    

        // WARUNKI ZATRUDNIENIA
        // this.baseCVData.position = this.position;
        // this.baseCVData.disposition = this.disposition;
        // this.baseCVData.location = this.location;
        // this.baseCVData.availability = this.availability;
        // this.baseCVData.employment = this.employment;
        // this.baseCVData.salary = this.salary;

        // bCVData.append("position", this.position);
        // bCVData.append("disposition", this.disposition);
        // bCVData.append("location", this.location);
        // bCVData.append("availability", this.availability);
        // // employment array
        // bCVData.append("salary", this.salary);

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
        if (this.drivingLicence != undefined || this.drivingLicence !== '') {
            baseCVData.drivingLicenceChecked = true;
            baseCVData.drivingLicenceDescription = this.drivingLicence;
        };
        if (this.knownPrograms != undefined || this.knownPrograms !== '') {
            baseCVData.knownProgramsChecked = true;
            baseCVData.knownProgramsDescription = this.knownPrograms;
        };
        if (this.programmingLanguages != undefined || this.programmingLanguages !== '') {
            baseCVData.programmingSkillsChecked = true;
            baseCVData.programmingSkillsDescription = this.programmingLanguages;
        };
        if (this.devices != undefined || this.devices !== '') {
            baseCVData.devicesUsageChecked = true;
            baseCVData.devicesUsageDescription = this.devices;
        };
        if (this.permissions != undefined || this.permissions !== '') {
            baseCVData.permissionsChecked = true;
            baseCVData.permissionsDescription = this.permissions;
        };
        if (this.regulations != undefined || this.regulations !== '') {
            baseCVData.knownRegulationsChecked = true;
            baseCVData.knownRegulationsDescription = this.regulations;
        };
        if (this.otherSkills != undefined || this.otherSkills !== '') {
            baseCVData.otherSkillsChecked = true;
            baseCVData.otherSkillsDescription = this.otherSkills;
        };

        // MOCNE STRONY
        baseCVData.advantages = this.advantages;

        //HOBBY
        baseCVData.hobby = this.hobbies;

        // console.log(this.baseCVData);       

        // const baseCV: BaseCV = { loggedUserEmail: loggedUserEmail, cvData: this.baseCVData };

        // console.log(baseCV);

        // this.http
        //     .put(BACKEND_URL + "/user/cv", baseCV)
        //     .subscribe(()=>{

        //     }, error => {

        //     });
    }

}