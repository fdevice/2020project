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
    photoClass: string;
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
    // startWork: any = new Array();
    // finishWork: any = new Array();
    employer: any = new Array();
    trade: any = new Array();
    occupationData: any = new Array();
    // responsibilities: any = new Array();
    startEducation: any = new Array();
    finishEducation: any = new Array();
    schoolName: any = new Array();
    schoolProfile: any = new Array();
    schoolType: any = new Array();
    schoolTypeIndex: any = new Array();
    schoolMode: any = new Array();
    startCourse: any = new Array();
    // finishCourse: any = new Array();
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

    sendBaseCVData(image: File) {        

        let baseCVData: CVData = {
            name: '',
            surname: '',
            contactEmail: '',
            phone: '',      
            photoPath: '',
            photoClass: '',
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
        baseCVData.photoClass = this.photoClass;

        console.log("Obiekt baseCVData z niektórymi wartościami: " + baseCVData.name);    

        console.log("Total experience lenght: " + this.totalExperienceLength);
        
        // DOŚWIADCZENIE ZAWODOWE
        for (let i = 0; i < this.totalExperienceLength; i++) {     
            
            console.log("Total experience lenght: " + this.totalExperienceLength);

            if (this.employer[i] != undefined) {          
                
                console.log("Employer: " + this.employer[i]);

                let experienceData: any[] = [
                  {                
                   employerName: this.employer[i],
                   trade: this.trade[i],
                   occupationData: this.occupationData[i]                
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
                    // courseFinish: this.finishCourse[c],
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

        const baseCV: BaseCV = { loggedUserEmail: loggedUserEmail, cvData: baseCVData, hasBaseCV: true };

        console.log(baseCV);

        this.http                                       // Przesyłanie na serwer bazowego CV bez zdjęcia
            .post(BACKEND_URL + "/user/cv", baseCV)
            .subscribe((result)=>{
                console.log(result);
            }, error => {
                console.log(error);                
            });

        const imageData = new FormData();

        if (image != null && image != undefined) {      // Przesyłanie zdjęcia na serwer
            console.log(typeof image);            
            if (typeof(image) === 'object') {
            imageData.append("loggedUserEmail", loggedUserEmail);
            imageData.append("image", image, (this.name + " " + this.surname));            
            console.log("Obiekt imageData:");
            console.dir(imageData);
            this.http
                .post(BACKEND_URL + "/user/cv/photo", imageData)
                .subscribe((result) => {
                    console.log(result);
                }, error => {
                    console.log(error);
                });
            } else {                
                let imageStringData = {
                    "loggedUserEmail": loggedUserEmail,
                    "imagePath": image                   
                };
                this.http
                .post(BACKEND_URL + "/user/cv/photo", imageStringData)
                .subscribe((result) => {
                    console.log(result);
                }, error => {
                    console.log(error);
                });
            };
            
        } else {
            console.log("Brak lub niewłaściwy format zdjęcia!");
        };
    };

    updateBaseCVData(image: File) {        

        let baseCVData: CVData = {
            name: '',
            surname: '',
            contactEmail: '',
            phone: '',      
            photoPath: '',
            photoClass: '',
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
        baseCVData.photoClass = this.photoClass;

        console.log("Obiekt baseCVData z niektórymi wartościami: " + baseCVData.name);    

        console.log("Total experience lenght: " + this.totalExperienceLength);
        
        // DOŚWIADCZENIE ZAWODOWE
        for (let i = 0; i < this.totalExperienceLength; i++) {     
            
            console.log("Total experience lenght: " + this.totalExperienceLength);

            if (this.employer[i] != undefined) {          
                
                console.log("Employer: " + this.employer[i]);

                let experienceData: any[] = [
                  {                
                   employerName: this.employer[i],
                   trade: this.trade[i],
                   occupationData: this.occupationData[i]                
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
                    // courseFinish: this.finishCourse[c],
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

        const baseCV: BaseCV = { loggedUserEmail: loggedUserEmail, cvData: baseCVData, hasBaseCV: true };

        console.log(baseCV);

        this.http                                       // Przesyłanie na serwer bazowego CV bez zdjęcia
            .put(BACKEND_URL + "/user/cv", baseCV)
            .subscribe((result)=>{
                console.log(result);
            }, error => {
                console.log(error);                
            });

        const imageData = new FormData();

        if (image != null && image != undefined) {      // Przesyłanie zdjęcia na serwer
            console.log(typeof image);            
            if (typeof(image) === 'object') {
            imageData.append("loggedUserEmail", loggedUserEmail);
            imageData.append("image", image, (this.name + " " + this.surname));            
            console.log("Obiekt imageData:");
            console.dir(imageData);
            this.http
                .post(BACKEND_URL + "/user/cv/photo", imageData)
                .subscribe((result) => {
                    console.log(result);
                }, error => {
                    console.log(error);
                });
            } else {                
                let imageStringData = {
                    "loggedUserEmail": loggedUserEmail,
                    "imagePath": image                   
                };
                this.http
                .post(BACKEND_URL + "/user/cv/photo", imageStringData)
                .subscribe((result) => {
                    console.log(result);
                }, error => {
                    console.log(error);
                });
            };
            
        } else {
            console.log("Brak lub niewłaściwy format zdjęcia!");
        };
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