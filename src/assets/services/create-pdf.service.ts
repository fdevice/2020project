import { Injectable } from '@angular/core';
import { base64Fonts } from '../base64/fonts';
import * as jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class CreatePdfService {

  constructor() { }

  leftMargin: number = 7;
  rightMargin: number = 7;
  deepMargin: number = 16;
  documentWidth: number = 210;
  documentHeight: number = 297;
  footerHeight: number = 16;
  headerFont: number = 14;

  position: string;
  location: string;
  availability: string;
  disposition: string;
  employment: string;
  salary: string;

  fullName: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  availabilityDate: string;
  totalExperienceLength: number;
  totalOccupationArrayLength: number[] = new Array();
  totalEducationLength: number;
  totalCoursesLength: number;
  totalLanguagesLength: number;
  startWork: any = new Array();
  finishWork: any = new Array();
  employer: any = new Array();
  trade: any = new Array();
  occupationArray: any = new Array();
  occupation: any = new Array();
  responsibilities: any = new Array();
  startEducation: any = new Array();
  finishEducation: any = new Array();
  schoolName: any = new Array();
  schoolProfile: any = new Array();
  startCourse: any = new Array();
  // finishCourse: any = new Array();
  courseName: any = new Array();
  courseSubject: any = new Array();
  languageName: any = new Array();
  languageLevel: any = new Array();
  languageDescription: any = new Array();
  advantages: any = new Array();
  requirements: any = new Array();
  answers: any = new Array();
  drivingLicence: string;
  computerPrograms: string;
  programmingLanguages: string;
  devices: string;
  permissions: string;
  regulations: string;
  otherSkills: string;
  hobbies: string;

  clause: string;

  userPhoto: any = '';
  calendarIcon: any = '';
  conditionsHeaderIcon: any = '';
  personalDataHeaderIcon: any = '';
  experienceHeaderIcon: any = '';
  educationHeaderIcon: any = '';
  coursesHeaderIcon: any = '';
  languagesHeaderIcon: any = '';
  skillsHeaderIcon: any = '';
  advantagesHeaderIcon: any = '';
  hobbiesHeaderIcon: any = '';
  requirementsHeaderIcon: any = '';

  fromTop: number;
  skillsFromTop: number;
  hobbiesFromTop: number;

  document = new jsPDF('p', 'mm', 'a4');

  public generatePDF() {

    const black: number = 50;
    const gray: number = 100;

    this.fromTop = 15;

    this.document.addFileToVFS("OpenSans-Regular.ttf", base64Fonts.openSansFont);
    this.document.addFont('OpenSans-Regular.ttf', 'openSans', 'normal');
    this.document.addFont('OpenSans-Regular.ttf', 'openSansBold', 'bold');
    this.document.addFont('OpenSans-Regular.ttf', 'openSansItalic', 'italic');
    this.document.setFont('openSans');
    this.document.setFontSize(this.headerFont);

  // WARUNKI ZATRUDNIENIA
    this.document.addImage(this.conditionsHeaderIcon, 'PNG', this.leftMargin, this.fromTop - 5, 7, 7);
    this.document.text(this.deepMargin, this.fromTop, 'WARUNKI ZATRUDNIENIA');
    this.fromTop += 10;

    this.document.setTextColor(black);
    this.document.setFontSize(9);
    this.document.text(this.deepMargin, this.fromTop, 'Stanowisko:');
    this.document.setTextColor(gray);
    this.document.setFontSize(8);
    this.document.text(35, this.fromTop, this.position);
    this.document.setTextColor(black);
    this.document.setFontSize(9);
    this.document.text(120, this.fromTop, 'Lokalizacja:')
    this.document.setTextColor(gray);
    this.document.setFontSize(8);
    this.document.text(139, this.fromTop, this.location);
    this.fromTop += 7;

    this.document.setTextColor(black);
    this.document.setFontSize(9);
    this.document.text(this.deepMargin, this.fromTop, 'Dostępność:')
    this.document.setTextColor(gray);
    this.document.setFontSize(8);
    this.document.text(35, this.fromTop + 0.15, this.availability);
    this.document.setTextColor(black);
    this.document.setFontSize(9);
    this.document.text(120, this.fromTop, 'Dyspozycyjność:')
    this.document.setTextColor(gray);
    this.document.setFontSize(8);
    this.document.text(145, this.fromTop, this.disposition);

    /* 4 scenariusze:
      - samo employment
      - employment + salary wypełnione
      - samo salary
      - employment + salary puste */

    if (this.employment != '' && this.salary === '') {
      this.fromTop += 7;
      this.document.setTextColor(black);
      this.document.setFontSize(9);
      this.document.text(this.deepMargin, this.fromTop, 'Preferowana forma zatrudnienia:');
      this.document.setTextColor(gray);
      this.document.setFontSize(8);
      this.document.text(66, this.fromTop, this.employment);
      this.fromTop += 7;
    }
    else if (this.employment != '' && this.salary != '' && this.salary != undefined) {
      let splitEmployment: any = this.document.splitTextToSize(this.employment, 55);
      this.fromTop += 7;
      this.document.setTextColor(black);
      this.document.setFontSize(9);
      this.document.text(this.deepMargin, this.fromTop, 'Preferowana forma zatrudnienia:');
      this.document.setTextColor(gray);
      this.document.setFontSize(8);
      this.document.text(66, this.fromTop, splitEmployment);
      // this.fromTop += 7;
      this.document.setTextColor(black);
      this.document.setFontSize(9);
      this.document.text(120, this.fromTop, 'Oczekiwania finansowe:')
      this.document.setTextColor(gray);
      this.document.setFontSize(8);
      this.document.text(157, this.fromTop, this.salary);
      this.fromTop += 7;
    }
    else if (this.employment === '' && this.salary != '' && this.salary != undefined) {
      this.fromTop += 7;
      this.document.setTextColor(black);
      this.document.setFontSize(9);
      this.document.text(this.deepMargin, this.fromTop, 'Oczekiwania finansowe:');
      this.document.setTextColor(gray);
      this.document.setFontSize(8);
      this.document.text(53, this.fromTop, this.salary);      
      this.fromTop += 7;
    } else {
      this.fromTop += 7;
    };

    // pozioma linia po Warunkach Zatrudnienia
    this.fromTop += 7;
    this.document.setDrawColor('#CFE6EF');
    this.document.setLineWidth(0.1);
    this.document.line(this.leftMargin, this.fromTop, this.documentWidth - this.rightMargin, this.fromTop);
    this.fromTop += 7;   


    // DANE OSOBOWE + ZDJĘCIE
    this.document.addImage(this.userPhoto, 'PNG', this.leftMargin - 5, this.fromTop - 5, 75, 50);    
    this.document.setTextColor(black);
    this.document.setFontSize(30);
    this.document.text(65, this.fromTop + 16, this.name);
    this.document.text(65, this.fromTop + 26, this.surname);
    this.document.setTextColor(gray);
    this.document.setFontSize(9);
    if (this.email.length > 35) {
      this.document.text(65, this.fromTop + 35, 'e-mail: ' + this.email);
      this.document.text(65, this.fromTop + 40, 'telefon: ' + this.phone);
    } else {
      this.document.text(65, this.fromTop + 35, 'e-mail: ' + this.email);
      this.document.text(140, this.fromTop + 35, 'telefon: ' + this.phone);
    };
    
    this.fromTop += 50;

    // pozioma linia po Danych Osobowych
    this.document.setDrawColor('#CFE6EF');
    this.document.setLineWidth(0.1);
    this.document.line(this.leftMargin, this.fromTop, this.documentWidth - this.rightMargin, this.fromTop);
    this.fromTop += 9;


    console.log(this.occupationArray);

    // DOŚWIADCZENIE ZAWODOWE
    if (this.employer[0]) {
      this.document.addImage(this.experienceHeaderIcon, 'PNG', this.leftMargin, this.fromTop - 5, 9, 9);
      this.document.setTextColor(black);
      this.document.setFontSize(this.headerFont + 3);
      this.document.text(this.deepMargin + 2, this.fromTop + 2, 'DOŚWIADCZENIE ZAWODOWE');
      this.fromTop += 10;

      for (let i = 0; i < this.totalExperienceLength; i++) {

        if (this.employer[i] != undefined) {

          this.document.setFontSize(14);
          this.document.setTextColor(black);
          this.document.circle(this.deepMargin, this.fromTop, 1, 'F');
          this.document.text(this.deepMargin + 5, this.fromTop + 1.5, this.employer[i] + '  /  ' + (this.trade[i]).toLowerCase());
          this.fromTop += 5;

          console.log("OccupationArray[" + i + "]: ");
          console.dir(this.occupationArray[i]);

          for (let o = 0; o < this.totalOccupationArrayLength[i]; o++) {

            console.log(this.occupationArray[i][o][0]);
            this.document.addImage(this.calendarIcon, 'PNG', this.deepMargin + 10, this.fromTop - 0.5, 3, 4);
            this.document.setFontSize(7);
            this.document.setTextColor(gray);
            this.document.text(this.deepMargin + 16, this.fromTop + 3, this.occupationArray[i][o][0].workStart + ' - ' + this.occupationArray[i][o][0].workFinish);
            this.document.setFontSize(9);
            this.document.setTextColor(black);
            this.document.text(this.deepMargin + 16, this.fromTop + 7, this.occupationArray[i][o][0].occupation);
            this.document.setFontSize(8);
            this.fromTop += 10;

            for (let j = 0; j < this.occupationArray[i][o][0].responsibilities.length; j++) {      
              if (this.occupationArray[i][o][0].responsibilities[j] !== '' && this.occupationArray[i][o][0].responsibilities[j] !== undefined) {
                    this.document.circle(this.deepMargin + 20, this.fromTop, 0.5, 'F');
                    this.document.text(this.deepMargin + 24, this.fromTop + 0.75, this.occupationArray[i][o][0].responsibilities[j]);
                    this.fromTop += 4;

                    this.shouldAddNewPage();
              }     
            
          };
            this.fromTop += 1;
      };

    //       this.document.addImage(this.calendarIcon, 'PNG', this.deepMargin + 2, this.fromTop - 0.5, 3, 4);
    //       this.document.setFontSize(8);
    //       this.document.setTextColor(gray);
    //       this.document.text(this.deepMargin + 8, this.fromTop + 3, this.startWork[i] + ' - ' + this.finishWork[i]);


    //       this.document.setFontSize(10);
    //       this.document.setTextColor(black);
    //       this.document.text(this.deepMargin + 8, this.fromTop + 8, this.employer[i] + '  /  ' + this.trade[i] + '  /  ' + this.occupation[i]);


    //       this.document.setFontSize(9);
    //       this.fromTop += 12;

    //       for (let j = 0; j < this.responsibilities[i].length; j++) {
    //         console.log(this.responsibilities[i][j]);
    //         this.document.circle(this.deepMargin + 9, this.fromTop, 0.5, 'F');
    //         this.document.text(this.deepMargin + 12, this.fromTop + 1, this.responsibilities[i][j]);
    //         this.fromTop += 4;

    //         this.shouldAddNewPage();
    //     };

          this.fromTop += 4;

          this.shouldAddNewPage();
        };
      };

      // pozioma linia po Doświadczeniu Zawodowym
      this.document.setDrawColor('#CFE6EF');
      this.document.setLineWidth(0.1);
      this.document.line(this.leftMargin, this.fromTop, this.documentWidth - this.rightMargin, this.fromTop);
      this.fromTop += 9;
    };


    // EDUKACJA
    this.shouldAddNewPage();
    this.document.addImage(this.educationHeaderIcon, 'PNG', this.leftMargin, this.fromTop - 5, 9, 9);
    this.document.setTextColor(black);
    this.document.setFontSize(this.headerFont + 3);
    this.document.text(this.deepMargin + 2, this.fromTop + 2, 'EDUKACJA');
    this.fromTop += 7;

    for (let e = 0; e < this.totalEducationLength; e++) {

      if (this.schoolName[e] != undefined) {

        this.document.addImage(this.calendarIcon, 'PNG', this.deepMargin + 2, this.fromTop - 0.5, 3, 4);
        this.document.setFontSize(8);
        this.document.setTextColor(gray);
        if (this.finishEducation[e] === 'obecnie') {
          this.document.text(this.deepMargin + 8, this.fromTop + 3, this.startEducation[e] + ' - ' + this.finishEducation[e]);
        } else {
          this.document.text(this.deepMargin + 8, this.fromTop + 3, this.startEducation[e] + ' - ' + this.finishEducation[e]);
        };        
        this.document.setFontSize(10);
        this.document.setTextColor(black);

        if (this.schoolProfile[e] === '') {
          this.document.text(this.deepMargin + 8, this.fromTop + 8, this.schoolName[e]);
        } else {
          this.document.text(this.deepMargin + 8, this.fromTop + 8, this.schoolName[e] + ' / ' + this.schoolProfile[e]);
        };

        this.fromTop += 12;

        this.shouldAddNewPage();
      };
    };

    // pozioma linia po Edukacji
    this.document.setDrawColor('#CFE6EF');
    this.document.setLineWidth(0.1);
    this.document.line(this.leftMargin, this.fromTop, this.documentWidth - this.rightMargin, this.fromTop);
    this.fromTop += 9;


    // KURSY
    if (this.courseName[0]) {
      this.shouldAddNewPage();
      this.document.addImage(this.coursesHeaderIcon, 'PNG', this.leftMargin, this.fromTop - 5, 9, 9);
      this.document.setTextColor(black);
      this.document.setFontSize(this.headerFont + 3);
      this.document.text(this.deepMargin + 2, this.fromTop + 2, 'KURSY');
      this.fromTop += 7;

      for (let c = 0; c < this.totalCoursesLength; c++) {

        if (this.courseName[c] != undefined) {

          this.document.addImage(this.calendarIcon, 'PNG', this.deepMargin + 2, this.fromTop - 0.5, 3, 4);
          this.document.setFontSize(8);
          this.document.setTextColor(gray);          
          this.document.text(this.deepMargin + 8, this.fromTop + 3, this.startCourse[c]);
          this.document.setFontSize(10);
          this.document.setTextColor(black);

          if (this.courseSubject === '') {
            this.document.text(this.deepMargin + 8, this.fromTop + 8, this.courseName[c]);
          } else {
            this.document.text(this.deepMargin + 8, this.fromTop + 8, this.courseName[c] + ' / ' + this.courseSubject[c]);
          };

          this.fromTop += 14;

          this.shouldAddNewPage();
        };
      };

      // pozioma linia po Kursach
      this.document.setDrawColor('#CFE6EF');
      this.document.setLineWidth(0.1);
      this.document.line(this.leftMargin, this.fromTop, this.documentWidth - this.rightMargin, this.fromTop);
      this.fromTop += 12;
    };


    // // JĘZYKI OBCE
    // if (this.languageName[0]) {
    //   this.shouldAddNewPage();
    //   this.document.addImage(this.languagesHeaderIcon, 'PNG', this.leftMargin, this.fromTop - 5, 9, 9);
    //   this.document.setTextColor(black);
    //   this.document.setFontSize(this.headerFont + 3);
    //   this.document.text(this.deepMargin + 2, this.fromTop + 2, 'JĘZYKI OBCE');
    //   this.fromTop += 7;

    //   // this.shouldAddNewPage();
    //   this.document.setFontSize(10);
    //   this.document.setTextColor(black);
    //   this.document.text(this.deepMargin, this.fromTop + 3, this.languageName[0] + ' ' + this.languageLevel[0]);
    //   this.document.setFontSize(7);
    //   this.document.setTextColor(gray);

    //   let splitDescription: any = this.document.splitTextToSize(this.languageDescription[0], 100);

    //   this.document.text(this.deepMargin, this.fromTop + 7, splitDescription);
    //   this.fromTop += 14;

    //   this.shouldAddNewPage();

    //   for (let l = 1; l < this.totalLanguagesLength; l++) {

    //     if (this.languageName[l] != undefined) {

    //       // this.shouldAddNewPage();
    //       this.document.setFontSize(10);
    //       this.document.setTextColor(black);
    //       this.document.text(this.deepMargin, this.fromTop + 3, this.languageName[l] + ' ' + this.languageLevel[l]);
    //       this.document.setFontSize(7);
    //       this.document.setTextColor(gray);

    //       let splitDescription: any = this.document.splitTextToSize(this.languageDescription[l], 100);

    //       this.document.text(this.deepMargin, this.fromTop + 7, splitDescription);
    //       this.fromTop += 14;

    //       this.shouldAddNewPage();
    //     };
    //   };

    //   // // pozioma linia po Językach Obcych
    //   // this.document.setDrawColor('#CFE6EF');
    //   // this.document.setLineWidth(0.1);
    //   // this.document.line(this.leftMargin, this.fromTop, this.documentWidth - this.rightMargin, this.fromTop);
    //   // this.fromTop += 9;
    // };

    // JĘZYKI OBCE + UMIEJĘTNOŚCI
    if (this.languageName[0] && this.languageName[0] != undefined) {
      this.shouldAddNewPage();
      this.document.addImage(this.languagesHeaderIcon, 'PNG', this.leftMargin, this.fromTop - 5, 9, 9);
      this.document.setTextColor(black);
      this.document.setFontSize(this.headerFont + 3);
      this.document.text(this.deepMargin + 2, this.fromTop + 2, 'JĘZYKI OBCE');

      if (this.drivingLicence || this.computerPrograms || this.programmingLanguages || this.devices || this.permissions || this.regulations || this.otherSkills) {
        this.document.addImage(this.skillsHeaderIcon, 'PNG', 110, this.fromTop - 5, 9, 9);
        this.document.setTextColor(black);
        this.document.setFontSize(this.headerFont + 3);      
        this.document.text(120, this.fromTop + 2, 'UMIEJĘTNOŚCI');
      };           

      this.fromTop += 7;
      this.skillsFromTop = this.fromTop;

      // this.shouldAddNewPage();
      this.document.setFontSize(10);
      this.document.setTextColor(black);
      this.document.text(this.deepMargin, this.fromTop + 3, this.languageName[0] + ' ' + this.languageLevel[0]);
      this.document.setFontSize(7);
      this.document.setTextColor(gray);

      let splitDescription: any = this.document.splitTextToSize(this.languageDescription[0], 80);

      this.document.text(this.deepMargin, this.fromTop + 7, splitDescription);
      this.fromTop += 14;

      this.shouldAddNewPage();

      for (let l = 1; l < this.totalLanguagesLength; l++) {

        if (this.languageName[l] != undefined) {

          // this.shouldAddNewPage();
          this.document.setFontSize(10);
          this.document.setTextColor(black);
          this.document.text(this.deepMargin, this.fromTop + 3, this.languageName[l] + ' ' + this.languageLevel[l]);
          this.document.setFontSize(7);
          this.document.setTextColor(gray);

          let splitDescription: any = this.document.splitTextToSize(this.languageDescription[l], 80);

          this.document.text(this.deepMargin, this.fromTop + 7, splitDescription);
          this.fromTop += 14;

          this.shouldAddNewPage();
        };
      };

      // // pozioma linia po Językach Obcych
      // this.document.setDrawColor('#CFE6EF');
      // this.document.setLineWidth(0.1);
      // this.document.line(this.leftMargin, this.fromTop, this.documentWidth - this.rightMargin, this.fromTop);
      // this.fromTop += 9;

      // UMIEJĘTNOŚCI
    if (this.drivingLicence || this.computerPrograms || this.programmingLanguages || this.devices || this.permissions || this.regulations || this.otherSkills) {
      // this.shouldAddNewPage();
      // // this.document.addImage(this.skillsHeaderIcon, 'PNG', this.leftMargin, this.fromTop - 5, 9, 9);
      // this.document.addImage(this.skillsHeaderIcon, 'PNG', 120, this.fromTop - 5, 9, 9);
      // this.document.setTextColor(black);
      // this.document.setFontSize(this.headerFont + 3);
      // // this.document.text(this.deepMargin + 2, this.fromTop + 2, 'UMIEJĘTNOŚCI');
      // this.document.text(124, this.fromTop + 2, 'UMIEJĘTNOŚCI');
      // this.fromTop += 7;

      // (wzór umiejętności)
      // if (this.drivingLicence != undefined) {
      //   let splitDescription: any = this.document.splitTextToSize('Prawo jazdy kategorii ' + this.drivingLicence, 80);
      //   this.document.setFontSize(10);
      //   this.document.setTextColor(black);
      //   this.document.text(this.deepMargin, this.fromTop + 3, splitDescription);
      //   this.fromTop += 5;
      //   this.shouldAddNewPage();
      // };
    
      
      if (this.drivingLicence != undefined) {
        let splitDescription: any = this.document.splitTextToSize('Prawo jazdy kategorii ' + this.drivingLicence, 80);
        this.document.setFontSize(9);
        this.document.setTextColor(black);
        this.document.text(120, this.skillsFromTop + 3, splitDescription);
        this.skillsFromTop += 6;
        this.shouldAddNewPage();
      };

      if (this.computerPrograms != undefined) {
        let splitDescription: any = this.document.splitTextToSize('Obsługiwane programy: ' + this.computerPrograms, 80);
        this.document.setFontSize(9);
        this.document.setTextColor(black);
        this.document.text(120, this.skillsFromTop + 3,  splitDescription);
        this.skillsFromTop += 6;
        this.shouldAddNewPage();
      };

      if (this.programmingLanguages != undefined) {
        let splitDescription: any = this.document.splitTextToSize('Języki programowania: ' + this.programmingLanguages, 80);
        this.document.setFontSize(9);
        this.document.setTextColor(black);
        this.document.text(120, this.skillsFromTop + 3,  splitDescription);
        this.skillsFromTop += 6;
        this.shouldAddNewPage();
      };

      if (this.devices != undefined) {
        let splitDescription: any = this.document.splitTextToSize('Obsługa urządzeń: ' + this.devices, 80);
        this.document.setFontSize(9);
        this.document.setTextColor(black);
        this.document.text(120, this.skillsFromTop + 3,  splitDescription);
        this.skillsFromTop += 6;
        this.shouldAddNewPage();
      };

      if (this.permissions != undefined) {
        let splitDescription: any = this.document.splitTextToSize('Specjalistyczne uprawnienia: ' + this.permissions, 90);
        this.document.setFontSize(9);
        this.document.setTextColor(black);
        this.document.text(120, this.skillsFromTop + 3,  splitDescription);
        this.skillsFromTop += 6;
        this.shouldAddNewPage();
      };

      if (this.regulations != undefined) {
        let splitDescription: any = this.document.splitTextToSize('Ustawy i przepisy: ' + this.regulations, 80);
        this.document.setFontSize(9);
        this.document.setTextColor(black);
        this.document.text(120, this.skillsFromTop + 3,  splitDescription);
        this.skillsFromTop += 6;
        this.shouldAddNewPage();
      };

      if (this.otherSkills != undefined) {
        let splitDescription: any = this.document.splitTextToSize('Inne istotne umiejętności: ' + this.otherSkills, 80);
        this.document.setFontSize(9);
        this.document.setTextColor(black);
        this.document.text(120, this.skillsFromTop + 3,  splitDescription);
        this.skillsFromTop += 6;
        this.shouldAddNewPage();
      };

      // this.fromTop += 5;

      // pozioma linia po Umiejętnościach
      // this.document.setDrawColor('#CFE6EF');
      // this.document.setLineWidth(0.1);
      // this.document.line(this.leftMargin, this.fromTop, this.documentWidth - this.rightMargin, this.fromTop);
      // this.fromTop += 9;
    };

    } else {

            // UMIEJĘTNOŚCI
        if (this.drivingLicence || this.computerPrograms || this.programmingLanguages || this.devices || this.permissions || this.regulations || this.otherSkills) {
          // this.shouldAddNewPage();
          this.document.addImage(this.skillsHeaderIcon, 'PNG', this.leftMargin, this.fromTop - 5, 9, 9);          
          this.document.setTextColor(black);
          this.document.setFontSize(this.headerFont + 3);
          this.document.text(this.deepMargin + 2, this.fromTop + 2, 'UMIEJĘTNOŚCI');          
          this.fromTop += 7;

          // (wzór umiejętności)
          // if (this.drivingLicence != undefined) {
          //   let splitDescription: any = this.document.splitTextToSize('Prawo jazdy kategorii ' + this.drivingLicence, 80);
          //   this.document.setFontSize(10);
          //   this.document.setTextColor(black);
          //   this.document.text(this.deepMargin, this.fromTop + 3, splitDescription);
          //   this.fromTop += 5;
          //   this.shouldAddNewPage();
          // };
        
          
          if (this.drivingLicence != undefined) {
            let splitDescription: any = this.document.splitTextToSize('Prawo jazdy kategorii ' + this.drivingLicence, 140);
            this.document.setFontSize(9);
            this.document.setTextColor(black);
            this.document.text(this.deepMargin, this.fromTop + 3, splitDescription);
            this.fromTop += 6;
            this.shouldAddNewPage();
          };

          if (this.computerPrograms != undefined) {
            let splitDescription: any = this.document.splitTextToSize('Obsługiwane programy: ' + this.computerPrograms, 140);
            this.document.setFontSize(9);
            this.document.setTextColor(black);
            this.document.text(this.deepMargin, this.fromTop + 3,  splitDescription);
            this.fromTop += 6;
            this.shouldAddNewPage();
          };

          if (this.programmingLanguages != undefined) {
            let splitDescription: any = this.document.splitTextToSize('Języki programowania: ' + this.programmingLanguages, 140);
            this.document.setFontSize(9);
            this.document.setTextColor(black);
            this.document.text(this.deepMargin, this.fromTop + 3,  splitDescription);
            this.fromTop += 6;
            this.shouldAddNewPage();
          };

          if (this.devices != undefined) {
            let splitDescription: any = this.document.splitTextToSize('Obsługa urządzeń: ' + this.devices, 140);
            this.document.setFontSize(9);
            this.document.setTextColor(black);
            this.document.text(this.deepMargin, this.fromTop + 3,  splitDescription);
            this.fromTop += 6;
            this.shouldAddNewPage();
          };

          if (this.permissions != undefined) {
            let splitDescription: any = this.document.splitTextToSize('Specjalistyczne uprawnienia: ' + this.permissions, 140);
            this.document.setFontSize(9);
            this.document.setTextColor(black);
            this.document.text(this.deepMargin, this.fromTop + 3,  splitDescription);
            this.fromTop += 6;
            this.shouldAddNewPage();
          };

          if (this.regulations != undefined) {
            let splitDescription: any = this.document.splitTextToSize('Ustawy i przepisy: ' + this.regulations, 140);
            this.document.setFontSize(9);
            this.document.setTextColor(black);
            this.document.text(this.deepMargin, this.fromTop + 3,  splitDescription);
            this.fromTop += 6;
            this.shouldAddNewPage();
          };

          if (this.otherSkills != undefined) {
            let splitDescription: any = this.document.splitTextToSize('Inne istotne umiejętności: ' + this.otherSkills, 80);
            this.document.setFontSize(9);
            this.document.setTextColor(black);
            this.document.text(this.deepMargin, this.fromTop + 3,  splitDescription);
            this.fromTop += 6;
            this.shouldAddNewPage();
          };

          // this.fromTop += 5;

          // pozioma linia po Umiejętnościach
          // this.document.setDrawColor('#CFE6EF');
          // this.document.setLineWidth(0.1);
          // this.document.line(this.leftMargin, this.fromTop, this.documentWidth - this.rightMargin, this.fromTop);
          // this.fromTop += 9;
        };

  };   


    // MOCNE STRONY
    // this.shouldAddNewPage();

    // if (this.fromTop >= (this.documentHeight - this.footerHeight - 40)) {
    //   this.document.addPage();
    //   this.fromTop = 15;

    //   // STOPKA
    //   this.document.setFontSize(8);
    //   this.document.setDrawColor('#CFE6EF');
    //   this.document.setLineWidth(0.1);
    //   this.document.line(this.leftMargin, this.documentHeight - this.footerHeight, this.documentWidth - this.rightMargin, this.documentHeight - this.footerHeight);

    //   let splitClause: any = this.document.splitTextToSize(this.clause, 270);
    //   this.document.setTextColor(gray);
    //   this.document.setFontSize(6);
    //   this.document.text(this.leftMargin, (this.documentHeight - this.footerHeight) + 7, splitClause);
    //   };

    if (this.skillsFromTop != undefined && this.skillsFromTop > this.fromTop) {     // jeśli odległość od górnej krawędzi strony w sekcji z umiejętnościami jest większa niż po stronie języków
      this.fromTop = this.skillsFromTop;
    }
    this.fromTop += 10;
    this.hobbiesFromTop = this.fromTop;

    if (this.advantages != undefined) {
    this.document.addImage(this.advantagesHeaderIcon, 'PNG', this.leftMargin, this.fromTop - 5, 9, 9);
    this.document.setTextColor(black);
    this.document.setFontSize(this.headerFont + 3);
    this.document.text(this.deepMargin + 2, this.fromTop + 2, 'MOCNE STRONY');
    this.fromTop += 7;
    
      for (let a = 0; a < this.advantages.length; a++) {
        this.document.setFontSize(10);
        this.document.setTextColor(black);
        this.document.text(this.deepMargin, this.fromTop + 3,  this.advantages[a]);
        this.fromTop += 5;
        // this.shouldAddNewPage();
      };
    };
    this.fromTop += 5;

    // ZAINTERESOWANIA    
    this.document.addImage(this.hobbiesHeaderIcon, 'PNG', 110, this.hobbiesFromTop - 5, 9, 9);
    this.document.setTextColor(black);
    this.document.setFontSize(this.headerFont + 3);
    this.document.text(120, this.hobbiesFromTop + 2, 'ZAINTERESOWANIA');
    this.hobbiesFromTop += 7;

    let splitHobbies: any = this.document.splitTextToSize(this.hobbies, 120);
    this.document.setFontSize(10);
    this.document.setTextColor(black);
    this.document.text(120, this.hobbiesFromTop + 3,  splitHobbies);
    // this.fromTop += 12;
    // this.shouldAddNewPage();


    // pozioma linia po Mocnych Stronach
    this.document.setDrawColor('#CFE6EF');
    this.document.setLineWidth(0.1);
    this.document.line(this.leftMargin, this.fromTop, this.documentWidth - this.rightMargin, this.fromTop);
    this.fromTop += 9;


    // // ZAINTERESOWANIA
    // this.shouldAddNewPage();
    // this.document.addImage(this.hobbiesHeaderIcon, 'PNG', this.leftMargin, this.fromTop - 5, 9, 9);
    // this.document.setTextColor(black);
    // this.document.setFontSize(this.headerFont + 3);
    // this.document.text(this.deepMargin + 2, this.fromTop + 2, 'ZAINTERESOWANIA');
    // this.fromTop += 7;

    // let splitHobbies: any = this.document.splitTextToSize(this.hobbies, 260);
    // this.document.setFontSize(10);
    // this.document.setTextColor(black);
    // this.document.text(this.deepMargin, this.fromTop + 3,  splitHobbies);
    // this.fromTop += 12;
    // this.shouldAddNewPage();

    // // pozioma linia po Zainteresowaniach
    // this.document.setDrawColor('#CFE6EF');
    // this.document.setLineWidth(0.1);
    // this.document.line(this.leftMargin, this.fromTop, this.documentWidth - this.rightMargin, this.fromTop);
    // this.fromTop += 9;


    // WYMAGANIA REKRUTACYJNE    
    if (this.requirements[0]) {
      let splitRequirements: any;           
      let splitAnswers: any;
      const reqLineLength = 150;
      this.shouldAddNewPage();
      this.document.setDrawColor('#696969');
      this.document.setLineWidth(0.75);
      this.document.line(this.leftMargin, this.fromTop, this.documentWidth - this.rightMargin, this.fromTop);
      this.fromTop += 11;
      this.document.addImage(this.requirementsHeaderIcon, 'PNG', this.leftMargin, this.fromTop - 5, 9, 9);
      this.document.setTextColor(black);
      this.document.setFontSize(this.headerFont + 3);
      this.document.text(this.deepMargin + 2, this.fromTop + 2, 'WYMAGANIA REKRUTACYJNE Z OFERTY');
      this.fromTop += 8;
      this.document.setFontSize(10);

      for (let r = 0; r < this.requirements.length; r++) {
        if (this.requirements[r] != undefined) {          
          splitRequirements = this.document.splitTextToSize(this.requirements[r], reqLineLength);
          splitAnswers = this.document.splitTextToSize(this.answers[r], reqLineLength);                      
          this.document.setTextColor(black);
          this.document.text(this.deepMargin, this.fromTop + 1, 'Wymaganie: ');
          this.document.text(this.deepMargin + 23, this.fromTop + 1, splitRequirements);
          this.fromTop += 8;
          this.shouldAddNewPage();
          this.document.setTextColor(gray);
          this.document.text(this.deepMargin, this.fromTop + 1, 'Odpowiedź: ');
          this.document.text(this.deepMargin + 23, this.fromTop + 1, splitAnswers);  
          splitRequirements = [];
          splitAnswers = [];       

          this.fromTop += 10;

          this.shouldAddNewPage();
        };      
      };      
    };    

    // STOPKA
      if (this.clause != '' && this.clause != undefined) {
        this.fromTop += 10;
        this.document.setFontSize(6);        
        this.document.setDrawColor('#696969');
        this.document.setLineWidth(0.1);        
        this.document.setTextColor(black);
        this.document.line(this.leftMargin,  this.documentHeight - this.footerHeight, this.documentWidth - this.rightMargin, this.documentHeight - this.footerHeight);

        let splitClause: any = this.document.splitTextToSize(this.clause, 200);                   
        this.document.text(this.leftMargin, this.documentHeight - this.footerHeight + 5, splitClause);
      };      

    this.document.setFontSize(8);    

    // window.open(this.document.output('bloburl'), '_blank');

    this.document.save(this.name + '_' + this.surname + '_CV' + '.pdf');
    this.document = new jsPDF('p', 'mm', 'a4');

  }

  public shouldAddNewPage() {    
    if (this.fromTop >= (this.documentHeight - this.footerHeight - 10)) {
      this.document.addPage();
      this.fromTop = 15;      
    };
  }

}
