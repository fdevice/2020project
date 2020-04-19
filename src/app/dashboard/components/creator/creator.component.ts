import { Component, OnInit, ElementRef, HostListener, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CreatePdfService } from '../../../../assets/services/create-pdf.service';
import { FormGroup, Validators, FormArray, FormBuilder } from '@angular/forms';
import { BsLocaleService, BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';
import { plLocale } from 'ngx-bootstrap/locale';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { HintMessageService } from '../../../../assets/services/hint-message.service';
import { fadeInTop } from '../../../../assets/animations/animations';
import { ListsViewerService } from '../../../../assets/services/list-viewer.service';
import domtoimage from 'dom-to-image';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { WarningDialogComponent } from '../../../../assets/components/warning-dialog/warning-dialog.component';
import { DialogService } from '../../../../assets/services/dialog.service';
import { CVDataService } from 'src/assets/services/cv-data.service';

defineLocale('pl', plLocale);

export interface DialogData {
  errors: string[];
}

@Component({
  selector: 'gorilla-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.scss'],
  animations: [fadeInTop()]
})

export class CreatorComponent implements OnInit, AfterViewInit {

  @HostListener('window:resize', ['$event'])   // nasłuchuje zmian wielkości ekranu i reaguje na nie
  onResize(event) {
    this.screenInnerWidth = window.innerWidth;    
  };
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event) {
    event.returnValue = 'Czy na pewno chcesz opuścić stronę? Wprowadzone zmiany zostaną odrzucone.';
    // Przeglądarki i tak narzucają własne komunikaty podczas opuszczania strony
  }; 

  @ViewChild('bannerContainer', {static: false}) bannerContainer: ElementRef;
  @ViewChild('creatorContainer', {static: false}) creatorContainer: ElementRef;
  @ViewChild('warunkiZatrudnienia', {static: false}) warunkiZatrudnienia: HTMLElement;
  @ViewChild('photoContainer', {static: false}) photoContainer: HTMLElement;

  DatePickerConfig: Partial<BsDatepickerConfig>;  //Partial nie ma obowiązku dziedziczyć wszystkich atrybutów obiektu
  DatePickerWithoutDays: Partial<BsDatepickerConfig>;

  uploadedImage: any;
  cvForm: FormGroup;
  employment: string[];
  availability: string[];
  languagesList: any[];
  languageLevels: any[];
  advantagesList: string[];
  studiesMode: string[];
  selectAvailability: boolean = false;
  schoolTypeSelected: number[] = [];
  languageNameSelectedIndex: any[] = [];
  otherLanguageSelected: boolean[] = [];
  selectedAdvantagesValues: string[];
  selectedAdvantagesValuesToPrint: string;
  selectedLanguageDegree: any[];
  advantagesError: boolean;
  schoolTypePlaceholder: string = "Wybierz rodzaj szkoły...";
  currentHint: string;
  currentTopHint: string;
  sideHintTrigger: string | number;
  hintOnFocus: boolean;
  hoverMessages: any;
  currentHintPosition: number;
  minMode: BsDatepickerViewMode = 'month';
  workPeriodEndDateIssue: boolean[];
  workPeriodEndDateIssueMessage: string[];
  workPeriodCurrentDateIssue: boolean[];
  workPeriodCurrentDateIssueMessage: string[];
  educationEndDateIssue: boolean[];
  educationEndDateIssueMessage: string[];
  educationCurrentDateIssue: boolean[];
  educationCurrentDateIssueMessage: string[];
  coursesEndDateIssue: boolean[];
  coursesEndDateIssueMessage: string[];
  coursesCurrentDateIssue: boolean[];
  coursesCurrentDateIssueMessage: string[];

  screenInnerWidth: any;  

  advantagesLeft: number;
  polishAdvantageSuffix: string;
  focusOnResp: boolean;
  experienceCompleted: boolean[];
  experienceEditMode: boolean[] = new Array(30);
  educationCompleted: boolean[];
  educationEditMode: boolean[] = new Array(30);
  coursesCompleted: boolean[];
  coursesEditMode: boolean[] = new Array(30);
  defaultClause: string;
  errorHandler: boolean = false;
  experienceCompletionError: boolean = false;
  educationCompletionError: boolean = false;
  coursesCompletionError: boolean = false;
  hideNextExpButton: boolean = false;
  hideNextEduButton: boolean = false;
  hideNextCourseButton: boolean = false;
  isLoading: boolean = false;

  formValid: boolean = false;
  employmentSectionValid: boolean = false;
  personalDataSectionValid: boolean = false;
  educationSectionValid: boolean = false;
  advantagesSectionValid: boolean = false;
  hobbySectionValid: boolean = false;
  uploadedImageValid: boolean = false;
  clauseValid: boolean = false;
  baseURL: boolean;
  formErrors: string[] = new Array();

  requirementsListLength: number;
  experienceArrayLength: number;
  // requirementsArray: string[] = new Array();
  // answersArray: string[] = new Array();
 
  get experienceArray() {
    return <FormArray>this.cvForm.get('experience');
  }

  get educationArray() {
    return <FormArray>this.cvForm.get('education');
  }

  get coursesArray() {
    return <FormArray>this.cvForm.get('courses');
  }

  get languagesArray() {
    return <FormArray>this.cvForm.get('languages');
  }

  get advantagesArray() {
    return <FormArray>this.cvForm.get('advantages');
  }

  get requirementsArray() {
    return <FormArray>this.cvForm.get('requirements');
  }



  constructor(
    private PDF: CreatePdfService,
    private baseCV: CVDataService,
    private localeService: BsLocaleService,
    private fb: FormBuilder,
    private sharedLists: ListsViewerService,
    private hoverHints: HintMessageService,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    public dialogService: DialogService
    ) {
      this.DatePickerConfig = Object.assign({}, {containerClass: 'theme-dark-blue', dateInputFormat: 'DD - MM - YYYY' }); //tworzymy zmienną z wybraną konfiguracją obiektu DatePicker
      this.DatePickerWithoutDays = Object.assign({}, {containerClass: 'theme-dark-blue', minMode: this.minMode, dateInputFormat: 'MMMM YYYY'});
    }

  ngOnInit() {

    this.screenInnerWidth = window.innerWidth;  //początkowa szerokość ekranu po załadowaniu strony    

    this.languagesList = this.sharedLists.getLanguageList();
    this.advantagesList = this.sharedLists.getAdvantagesList();
    this.hoverMessages = this.hoverHints.setHintMessage();

    this.localeService.use('pl');
    this.defaultClause = "Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu tej oraz przyszłych rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. U. z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO)."

    this.currentHint = '';        //treść "podpowiadałki"
    this.currentTopHint = '';
    this.sideHintTrigger = 0;
    this.currentHintPosition = 0;  //aktualna pozycja "podpowiadałki"
    this.hintOnFocus = false;
    this.focusOnResp = false;

    this.advantagesLeft = 7;
    this.advantagesError = false;
    this.polishAdvantageSuffix = '';
    // this.requirementsListLength = (<FormArray>this.cvForm.get('requirements')).length;

    this.workPeriodEndDateIssue = [];
    this.workPeriodEndDateIssueMessage = [];
    this.workPeriodCurrentDateIssue = [];
    this.workPeriodCurrentDateIssueMessage = [];
    this.educationEndDateIssue = [];
    this.educationEndDateIssueMessage = [];
    this.educationCurrentDateIssue = [];
    this.educationCurrentDateIssueMessage = [];
    this.coursesEndDateIssue = [];
    this.coursesEndDateIssueMessage = [];
    this.coursesCurrentDateIssue = [];
    this.coursesCurrentDateIssueMessage = [];

    this.experienceCompleted = [];
    this.educationCompleted = [];
    this.coursesCompleted = [];
    // this.experienceEditMode.fill(false, 0, 0);

    this.employment = this.sharedLists.getEmploymentList();
    this.availability = this.sharedLists.getAvailabilityList();
    this.studiesMode = this.sharedLists.getStudiesModes();
    this.languageLevels = this.sharedLists.getLanguageLevels();
    this.selectedLanguageDegree = [];

    this.cvForm = this.fb.group({                             // reaktywne tworzenie obiektu formularza cvForm
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      phone: ['', Validators.required],
      position: ['', Validators.required],
      salary: [''],
      employment: [''],
      location: ['', Validators.required],
      disposition: ['', Validators.required],
      availability: ['Od zaraz', Validators.required],
      availabilityDate: [''],
      drivingLicence: [''],
      drivingLicenceDescription: [{value: '', disabled: true}],
      knownPrograms: [''],
      knownProgramsDescription: [{value: '', disabled: true}],
      programmingSkills: [''],
      programmingSkillsDescription: [{value: '', disabled: true}],
      devicesUsage: [''],
      devicesUsageDescription: [{value: '', disabled: true}],
      permissions: [''],
      permissionsDescription: [{value: '', disabled: true}],
      knownRegulations: [''],
      knownRegulationsDescription: [{value: '', disabled: true}],
      otherSkills: [''],
      otherSkillsDescription: [{value: '', disabled: true}],
      experience: this.fb.array([
        this.addExperienceFormGroup()
      ]),
      education: this.fb.array([
        this.addEducationFormGroup()
      ]),
      courses: this.fb.array([
        this.addCoursesFormGroup()
      ]),
      languages: this.fb.array([
        this.addLanguagesFormGroup()
      ]),
      advantages: this.addAdvantagesControls(),
      hobbies: ['', Validators.required],
      requirements: this.fb.array([
        this.addRequirementsFormGroup()
      ]),
      clause: [this.defaultClause, Validators.required]
    });

  };

  ngAfterViewInit() {
    for (let i = 1; i < 5; i++) {
      this.addNewRequirement();
    }
    this.requirementsListLength = (<FormArray>this.cvForm.get('requirements')).length;
    this.experienceArrayLength = (<FormArray>this.cvForm.get('experience')).length;
  };

        // Na potrzeby obsługi błędu ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked() {
    let errorHandler = ((<FormArray>this.cvForm.get('requirements')).length > 1);
    if (errorHandler != this.errorHandler) { // check if it change, tell CD update view
      this.errorHandler = errorHandler;
      this.cdRef.detectChanges();
    }
  }

  public addExperienceFormGroup(): FormGroup {
    return this.fb.group({
            workPeriodStart: ['', Validators.required],
            workPeriodEnd: [''],
            workPeriodNow: [''],
            employerName: ['', Validators.required],
            trade: ['', Validators.required],
            occupation: ['', Validators.required],
            experienceTillNow: [''],
            responsibilities: this.fb.array([
              this.addResponsibilitiesFormArray()
            ])
    });
  };

  public addEducationFormGroup(): FormGroup {
      return this.fb.group({
        schoolType: ['', Validators.required],
        educationPeriodStart: ['', Validators.required],
        educationPeriodEnd: [''],
        educationPeriodNow: [''],
        schoolName: ['', Validators.required],
        educationMode: [''],
        specialization: [''],
        classProfile: [''],
        educationTillNow: ['']
});
  };

  public addCoursesFormGroup(): FormGroup {
    return this.fb.group({
      courseName: ['', Validators.required],
      courseSubject: [''],
      coursePeriodStart: ['', Validators.required],
      coursePeriodEnd: [''],
      coursePeriodNow: [''],
      courseTillNow: ['']
    })
  };

  public addLanguagesFormGroup(): FormGroup {
    return this.fb.group({
      languageName: [''],
      level: [{value: '', disabled: true}],
      otherLanguage: ['']
    })
  };

  public addAdvantagesFormGroup(): FormGroup {
    return this.fb.group({
      advantage: ['']
    });
  };

  public addResponsibilitiesFormArray(): FormGroup {
    return this.fb.group({
      responsibility: ['', Validators.required]
    });
  }

  public addRequirementsFormGroup(): FormGroup {
    return this.fb.group({
      requirement: [''],
      answer: ['']
    });
  }

  public addNewRequirement(): void {
    let newRequirement = (<FormArray>this.cvForm.get('requirements'));
    newRequirement.push(this.addRequirementsFormGroup());
    this.requirementsListLength = (<FormArray>this.cvForm.get('requirements')).length;
  }

  public removeRequirement(r: number): void {
    let newRequirement = (<FormArray>this.cvForm.get('requirements'));
    newRequirement.removeAt(r);
    this.requirementsListLength = (<FormArray>this.cvForm.get('requirements')).length;
  }

  public addNewResponsibility(i: number): void {
    let newResponsibility = (<FormArray>this.cvForm.get('experience')).controls[i].get('responsibilities') as FormArray;
    newResponsibility.push(this.addResponsibilitiesFormArray());
    this.focusOnResp = true;    
  }

  public removeResponsibility(i: number): void {
    let newResponsibility = (<FormArray>this.cvForm.get('experience')).controls[i].get('responsibilities') as FormArray;
    newResponsibility.removeAt(newResponsibility.length - 1);
    this.focusOnResp = true;    
  }

  public addAdvantagesControls(): FormArray {
    const advArr = this.advantagesList.map((element) => {
      return this.fb.control(false);
    });
    console.log(advArr);
    return this.fb.array(advArr);
  }  

  public calcPosition(event: Event) {   //oblicza odległość elementu od górnej krawędzi ekranu z uwzględnieniem wysokości banneru
    // let bannerHeight = this.bannerContainer.nativeElement.offsetHeight;  //oblicza wysokość banneru
    let scrollDistance = Math.abs(this.creatorContainer.nativeElement.getBoundingClientRect().top - 64);        
    let totalScrollDistance = scrollDistance == 0 ? ((event.target as HTMLElement).getBoundingClientRect().top + Math.abs(this.creatorContainer.nativeElement.getBoundingClientRect().top) - 128) : (event.target as HTMLElement).getBoundingClientRect().top + Math.abs(this.creatorContainer.nativeElement.getBoundingClientRect().top);
    this.currentHintPosition = totalScrollDistance;  //rzutowanie even.target na HTML i obliczanie odległości od górnej krawędzi ekranu 
    // console.log((event.target as HTMLElement).getBoundingClientRect().top);
    // console.log(Math.abs(this.creatorContainer.nativeElement.getBoundingClientRect().top - 64));
    // console.log(scrollDistance);
    // console.log(totalScrollDistance);    
  }  

  public clearHints() {
    this.currentHint = '';
    this.currentTopHint = '';
    this.sideHintTrigger = 0;
  }

  public setHints(hint: string) {
    this.currentHint = hint;
    this.currentTopHint = hint;    
    this.calcPosition(event);
  }

  public addExperienceButtonClick(i: number): void {
    let finishWork = (<FormArray>this.cvForm.get('experience')).controls[i].get('workPeriodEnd');
    let nowWork = (<FormArray>this.cvForm.get('experience')).controls[i].get('workPeriodNow');

    if ((!finishWork.value && !nowWork.value)) {
      (<FormArray>this.cvForm.get('experience')).controls[i].setErrors({'incorrect': true});
    };

    if ((<FormArray>this.cvForm.get('experience')).controls[i].invalid) {
      this.experienceCompletionError = true;
    } else {
      (<FormArray>this.cvForm.get('experience')).controls[i].setErrors(null);
      this.experienceCompletionError = false;
      this.experienceCompleted[i] = true;
      (<FormArray>this.cvForm.get('experience')).push(this.addExperienceFormGroup());
    };    
  }

  public toggleExperienceEdit(i: number) {
    this.experienceCompleted[i] = false;
    this.experienceEditMode[i] = true;
    this.hideNextExpButton = true;
  }

  public finishExperienceEdition(i: number) {
    this.experienceCompleted[i] = true;
    this.experienceEditMode[i] = false;
    this.hideNextExpButton = false;
  }

  public removeChosenExperience(i: number) {
    (<FormArray>this.cvForm.get('experience')).removeAt(i);
    this.experienceCompleted.splice(i, 1);
    console.log('Tablica experienceCompleted: ' + this.experienceCompleted);
    console.log('Długość tablicy experience: ' + (<FormArray>this.cvForm.get('experience')).length);
  }

  public addEducationButtonClick(e: number): void {
    // (<FormArray>this.cvForm.get('education')).push(this.addEducationFormGroup());

    console.log((<FormArray>this.cvForm.get('education')).controls[e].get('educationTillNow').value);

    let finishEducation = (<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodEnd');
    let nowEducation = (<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodNow');

    if ((!finishEducation.value && !nowEducation.value)) {
      (<FormArray>this.cvForm.get('education')).controls[e].setErrors({'incorrect': true});
    };

    if ((<FormArray>this.cvForm.get('education')).controls[e].invalid) {
      this.educationCompletionError = true;
    } else {
      (<FormArray>this.cvForm.get('education')).controls[e].setErrors(null);
      this.educationCompletionError = false;
      this.educationCompleted[e] = true;
      (<FormArray>this.cvForm.get('education')).push(this.addEducationFormGroup());
    };   
    
  }

  public toggleEducationEdit(e: number) {
    this.educationCompleted[e] = false;
    this.educationEditMode[e] = true;
    this.hideNextEduButton = true;
  }

  public finishEducationEdition(e: number) {
    this.educationCompleted[e] = true;
    this.educationEditMode[e] = false;
    this.hideNextEduButton = false;
  }

  public removeChosenEducation(e: number) {
    (<FormArray>this.cvForm.get('education')).removeAt(e);
    this.educationCompleted.splice(e, 1);
    console.log('Tablica educationCompleted: ' + this.educationCompleted);
    console.log('Długość tablicy education: ' + (<FormArray>this.cvForm.get('education')).length);    
  }

  public addCoursesButtonClick(c: number): void {
    // (<FormArray>this.cvForm.get('courses')).push(this.addCoursesFormGroup());

    let finishCourse = (<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodEnd');
    let nowCourse = (<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodNow');

    if ((!finishCourse.value && !nowCourse.value)) {
      (<FormArray>this.cvForm.get('courses')).controls[c].setErrors({'incorrect': true});
    };

    if ((<FormArray>this.cvForm.get('courses')).controls[c].invalid) {
      this.coursesCompletionError = true;
    } else {
      (<FormArray>this.cvForm.get('courses')).controls[c].setErrors(null);
      this.coursesCompletionError = false;
      this.coursesCompleted[c] = true;
      (<FormArray>this.cvForm.get('courses')).push(this.addCoursesFormGroup());      
    };    
  }

  public toggleCoursesEdit(c: number) {
    this.coursesCompleted[c] = false;
    this.coursesEditMode[c] = true;
    this.hideNextCourseButton = true;
  }

  public finishCoursesEdition(c: number) {
    this.coursesCompleted[c] = true;
    this.coursesEditMode[c] = false;
    this.hideNextCourseButton = false;
  }

  public removeChosenCourse(c: number) {
    (<FormArray>this.cvForm.get('courses')).removeAt(c);
    this.coursesCompleted.splice(c, 1);
    console.log('Tablica coursesCompleted: ' + this.coursesCompleted);
    console.log('Długość tablicy courses: ' + (<FormArray>this.cvForm.get('courses')).length);    
  }


  public addLanguagesButtonClick(): void {
    (<FormArray>this.cvForm.get('languages')).push(this.addLanguagesFormGroup());   
  }

  public removeLanguagesButtonClick(): void {
    let lastElement = (<FormArray>this.cvForm.get('languages')).length;
    (<FormArray>this.cvForm.get('languages')).removeAt(lastElement - 1);    
  }

  public getSelectedAvailabilityIndex(event: any) {
    console.log(event.value);
    // this.availabilitySelectedIndex = event.target["selectedIndex"];
    if (event.value === 'Wybierz datę...') {
      this.selectAvailability = true;      
    } else {
      this.selectAvailability = false;      
    }
  }

  public getSelectedEducationIndex(event: any, e: number) {
    console.log(event.value);
    this.schoolTypeSelected[e] = event.value;    
  }


  public getExperienceControls(i: number) {
    return (this.cvForm.get('experience') as FormArray).controls[i];
  }

  public getResponsibilitiesControls(i: number) {
    return (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('responsibilities'));
  }

  public getEducationControls(e: number) {
    return (this.cvForm.get('education') as FormArray).controls[e];
  }

  public getCoursesControls(c: number) {
    return (this.cvForm.get('courses') as FormArray).controls[c];
  }

  public checkAdvantagesControlsDirty() {     //zwraca true, jeśli którakolwiek z kontrolek w tablicy advantagesArray została dotknięta
    let advFlag = false;
    this.advantagesArray.controls.forEach((control) => {
      if (control.dirty) {
        advFlag = true;
      }
    });
    return advFlag;
  }

  public getSelectedAdvantagesValues() {
    this.selectedAdvantagesValues = [];
    this.advantagesArray.controls.forEach((control, i) => { //sprawdza każdy z elementów tablicy advantagesArrray i jeżeli posiada wartość true (został zaznaczony checkbox), dodaje go do tablicy selectedAdvantagesValues
      if (control.value) {
        this.selectedAdvantagesValues.push(this.advantagesList[i]);
      }
      this.advantagesLeft = (7 - this.selectedAdvantagesValues.length);
      if (this.advantagesLeft < 0) {
        this.advantagesLeft = 0;
      }
      switch (this.advantagesLeft) {
        case 4: {
          this.polishAdvantageSuffix = "y";
          break;
        }
        case 3: {
          this.polishAdvantageSuffix = "y";
          break;
        }
        case 2: {
          this.polishAdvantageSuffix = "y";
          break;
        }
        case 1: {
          this.polishAdvantageSuffix = "ę";
          break;
        }
        default: {
            this.polishAdvantageSuffix = "";
            break;
          }
        }
    });

    console.log(this.selectedAdvantagesValues);
    this.advantagesError = ((this.selectedAdvantagesValues.length > 7) || (this.selectedAdvantagesValues.length < 1)) ? true : false; //jeśli tablica selectedAdvantagesValues ma więcej niż 5 elementów, advantagesError otrzymuje wartość true

    // this.selectedAdvantagesValuesToPrint = this.selectedAdvantagesValues.join('\n');

  }

  public getSelectedLanguageName(event: any, l: number) {
    this.otherLanguageSelected[l] = false;
    this.languageNameSelectedIndex[l] = event.value;
    console.log(this.languageNameSelectedIndex[l]);

    if ( (this.languageNameSelectedIndex[l] === 'inny...') ) {
      this.otherLanguageSelected[l] = true;
    };

    console.log(this.otherLanguageSelected[l]);

    if ((<FormArray>this.cvForm.get('languages')).controls[l].get('languageName').dirty) {
      (<FormArray>this.cvForm.get('languages')).controls[l].get('level').enable();
    } else {
      (<FormArray>this.cvForm.get('languages')).controls[l].get('level').reset();
      (<FormArray>this.cvForm.get('languages')).controls[l].get('level').disable();
    }   
  };

  public onLanguageLevelChange(level: any, index: number) {
    this.selectedLanguageDegree[index] = level.description;
  }

  public uploadImage($event): void {
    this.readImage($event.target);
  };

  public readImage(inputValue: any): void {
    var file: File = inputValue.files[0];
    var myReader: FileReader = new FileReader();

    myReader.onloadend = (e) => {
      this.uploadedImage = myReader.result;
      console.log(myReader.result);

    };
    myReader.readAsDataURL(file);

  };

  public toggleDrivingLicenceDescription(e: Event) {
    console.log((<HTMLInputElement>(e.target)).checked);
    if ((<HTMLInputElement>(e.target)).checked) {
      this.cvForm.get('drivingLicenceDescription').enable();
    } else {
      this.cvForm.get('drivingLicenceDescription').reset()
      this.cvForm.get('drivingLicenceDescription').disable();
    }
  }

  public toggleKnownProgramsDescription(e: Event) {
    console.log((<HTMLInputElement>(e.target)).checked);
    if ((<HTMLInputElement>(e.target)).checked) {
      this.cvForm.get('knownProgramsDescription').enable();
    } else {
      this.cvForm.get('knownProgramsDescription').reset()
      this.cvForm.get('knownProgramsDescription').disable();
    }
  }

  public toggleProgrammingSkillsDescription(e: Event) {
    console.log((<HTMLInputElement>(e.target)).checked);
    if ((<HTMLInputElement>(e.target)).checked) {
      this.cvForm.get('programmingSkillsDescription').enable();
    } else {
      this.cvForm.get('programmingSkillsDescription').reset()
      this.cvForm.get('programmingSkillsDescription').disable();
    }
  }

  public toggleDevicesUsageDescription(e: Event) {
    console.log((<HTMLInputElement>(e.target)).checked);
    if ((<HTMLInputElement>(e.target)).checked) {
      this.cvForm.get('devicesUsageDescription').enable();
    } else {
      this.cvForm.get('devicesUsageDescription').reset()
      this.cvForm.get('devicesUsageDescription').disable();
    }
  }

  public togglePermissionsDescription(e: Event) {
    console.log((<HTMLInputElement>(e.target)).checked);
    if ((<HTMLInputElement>(e.target)).checked) {
      this.cvForm.get('permissionsDescription').enable();
    } else {
      this.cvForm.get('permissionsDescription').reset()
      this.cvForm.get('permissionsDescription').disable();
    }
  }

  public toggleKnownRegulationsDescription(e: Event) {
    console.log((<HTMLInputElement>(e.target)).checked);
    if ((<HTMLInputElement>(e.target)).checked) {
      this.cvForm.get('knownRegulationsDescription').enable();
    } else {
      this.cvForm.get('knownRegulationsDescription').reset()
      this.cvForm.get('knownRegulationsDescription').disable();
    }
  }

  public toggleOtherSkillsDescription(e: Event) {
    if ((<HTMLInputElement>(e.target)).checked) {
      this.cvForm.get('otherSkillsDescription').enable();
    } else {
      this.cvForm.get('otherSkillsDescription').reset()
      this.cvForm.get('otherSkillsDescription').disable();
    }
  }

  public setExperienceTillNow(i: number) {
    if ((<FormArray>this.cvForm.get('experience')).controls[i].get('experienceTillNow').value) {
      (<FormArray>this.cvForm.get('experience')).controls[i].get('workPeriodNow').setValue('Obecnie');
    } else {
      (<FormArray>this.cvForm.get('experience')).controls[i].get('workPeriodNow').setValue('');
    }
  };

  public setEducationTillNow(i: number) {
    if ((<FormArray>this.cvForm.get('education')).controls[i].get('educationTillNow').value) {
      (<FormArray>this.cvForm.get('education')).controls[i].get('educationPeriodNow').setValue('Obecnie');
    } else {
      (<FormArray>this.cvForm.get('education')).controls[i].get('educationPeriodNow').setValue('');
    }
  };

  public setCourseTillNow(i: number) {
    if ((<FormArray>this.cvForm.get('courses')).controls[i].get('courseTillNow').value) {
      (<FormArray>this.cvForm.get('courses')).controls[i].get('coursePeriodNow').setValue('Obecnie');
    } else {
      (<FormArray>this.cvForm.get('courses')).controls[i].get('coursePeriodNow').setValue('');
    }
  };

  public checkWorkPeriodDate(i: number) {
    let today = new Date();
    let startDate = (<FormArray>this.cvForm.get('experience')).controls[i].get('workPeriodStart').value;
    let endDate = (<FormArray>this.cvForm.get('experience')).controls[i].get('workPeriodEnd').value;
    let tillNow = (<FormArray>this.cvForm.get('experience')).controls[i].get('workPeriodNow').value;

    if ((startDate > endDate) && endDate != '' && tillNow === '') {
      this.workPeriodEndDateIssue[i] = true;
      this.workPeriodEndDateIssueMessage[i] = 'Data rozpoczęcia pracy nie może być nowsza od daty jej zakończenia!';
    } else {
      this.workPeriodEndDateIssue[i] = false;
      this.workPeriodEndDateIssueMessage[i] = '';
    };

    if (startDate > today) {
      this.workPeriodCurrentDateIssue[i] = true;
      this.workPeriodCurrentDateIssueMessage[i] = 'Data rozpoczęcia pracy nie może być nowsza od dzisiejszej!';
    } else {
      this.workPeriodCurrentDateIssue[i] = false;
    };
  };

  public checkEducationDate(e: number) {
    let today = new Date();
    let startDate = (<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodStart').value;
    let endDate = (<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodEnd').value;
    let tillNow = (<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodNow').value;

    if ((startDate > endDate) && endDate != '' && tillNow === '') {
      this.educationEndDateIssue[e] = true;
      this.educationEndDateIssueMessage[e] = 'Data rozpoczęcia nauki nie może być nowsza od daty jej zakończenia!';
    } else {
      this.educationEndDateIssue[e] = false;
      this.educationEndDateIssueMessage[e] = '';
    };

    if (startDate > today) {
      this.educationCurrentDateIssue[e] = true;
      this.educationCurrentDateIssueMessage[e] = 'Data rozpoczęcia nauki nie może być nowsza od dzisiejszej!';
    } else {
      this.educationCurrentDateIssue[e] = false;
    };
  };

  public checkCoursesDate(c: number) {
    let today = new Date();
    let startDate = (<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodStart').value;
    let endDate = (<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodEnd').value;
    let tillNow = (<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodNow').value;

    if ((startDate > endDate) && endDate != '' && tillNow === '') {
      this.coursesEndDateIssue[c] = true;
      this.coursesEndDateIssueMessage[c] = 'Data rozpoczęcia kursu nie może być nowsza od daty jej zakończenia!';
    } else {
      this.coursesEndDateIssue[c] = false;
      this.coursesEndDateIssueMessage[c] = '';
    };

    if (startDate > today) {
      this.coursesCurrentDateIssue[c] = true;
      this.coursesCurrentDateIssueMessage[c] = 'Data rozpoczęcia kursu nie może być nowsza od dzisiejszej!';
    } else {
      this.coursesCurrentDateIssue[c] = false;
    };
  };

  public checkFormValidity() {
    let position = this.cvForm.get('position');
    let location = this.cvForm.get('location');
    let availability = this.cvForm.get('availability');
    let disposition = this.cvForm.get('disposition');
    let name = this.cvForm.get('name');
    let surname = this.cvForm.get('surname');
    let email = this.cvForm.get('email');
    let phone = this.cvForm.get('phone');
    let education = (<FormArray>this.cvForm.get('education'));
    let hobby = this.cvForm.get('hobbies');
    let clause = this.cvForm.get('clause');

    this.employmentSectionValid = (position.valid && location.valid && availability.valid && disposition.valid) ? true : false;
    this.personalDataSectionValid = (name.valid && surname.valid && email.valid && phone.valid) ? true : false;
    this.uploadedImageValid = (this.uploadedImage != undefined) ? true : false;
    this.educationSectionValid = (education.controls[0].get('schoolType').valid && education.controls[0].get('educationPeriodStart').valid && education.controls[0].get('schoolName').valid) ? true : false;
    this.advantagesSectionValid = (!this.advantagesError && this.selectedAdvantagesValues != undefined) ? true : false;
    this.hobbySectionValid = (hobby.valid) ? true : false;
    this.clauseValid = (clause.valid) ? true : false;

    if (!position.valid) {
      this.formErrors.push('Stanowisko');
    };
    if (!location.valid) {
      this.formErrors.push('Lokalizacja');
    };
    if (!availability.valid) {
      this.formErrors.push('Dostępność');
    };
    if (!disposition.valid) {
      this.formErrors.push('Dyspozycyjność');
    };
    if (!name.valid) {
      this.formErrors.push('Imię');
    };
    if (!surname.valid) {
      this.formErrors.push('Nazwisko');
    };
    if (!email.valid) {
      this.formErrors.push('Adres e-mail');
    };
    if (!phone.valid) {
      this.formErrors.push('Numer telefonu');
    };
    if (this.uploadedImage === undefined) {
      this.formErrors.push('Zdjęcie');
    };
    if (!education.controls[0].get('schoolType').valid) {
      this.formErrors.push('Rodzaj szkoły');
    };
    if (!education.controls[0].get('educationPeriodStart').valid) {
      this.formErrors.push('Data rozpoczęcia nauki');
    };
    if (!education.controls[0].get('schoolName').valid) {
      this.formErrors.push('Nazwa szkoły/uczelni');
    };
    if (this.advantagesError || (this.selectedAdvantagesValues == undefined)) {
      this.formErrors.push('Wskaż minimum 1, maksimum 7 swoich mocnych stron');
    };
    if (!hobby.valid) {
      this.formErrors.push('Zainteresowania');
    };
    if (!clause.valid) {
      this.formErrors.push('Treść klauzuli');
    };

    console.log(this.formErrors);


    this.formValid = (this.employmentSectionValid && this.personalDataSectionValid
                      && this.uploadedImageValid && this.educationSectionValid
                      && this.advantagesSectionValid && this.hobbySectionValid
                      && this.clauseValid) ? true : false;


    // if (this.employmentSectionValid && this.personalDataSectionValid && this.educationSectionValid && this.advantagesSectionValid && this.hobbySectionValid && this.uploadedImageValid) {
    //   this.formValid = true;
    // } else {
    //   this.formValid = false;
    // };
  }

  public openErrorsDialog(): void {
    const dialogRef = this.dialog.open(WarningDialogComponent, {
      width: '700px',
      data: {errors: this.formErrors}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed!');
      this.formErrors = [];
    });
  }

  public canDeactivate(): Observable<boolean> | boolean {

    if (this.cvForm.dirty) {

        return this.dialogService.confirm('Czy na pewno chcesz opuscić stronę? Wprowadzone zmiany zostaną odrzucone.');
    }
    return true;
  }

  //********************  TWORZENIE BAZOWEGO CV  ********************************/

  public saveBaseCV() {

    const dateOptions = {
      day: undefined,
      month: 'long',
      year: 'numeric'
    };

    // WARUNKI ZATRUDNIENIA
    this.baseCV.position = this.cvForm.get('position').value;
    this.baseCV.location = this.cvForm.get('location').value;
    this.baseCV.disposition = this.cvForm.get('disposition').value;
    this.baseCV.salary = this.cvForm.get('salary').value;
    
    if (!this.selectAvailability) {
      this.baseCV.availability = this.cvForm.get('availability').value;
    } else {
      this.baseCV.availability = (new Date(this.cvForm.get('availabilityDate').value).toLocaleDateString('pl') + ' r.');
    };

    if (this.cvForm.get('employment').value != '') {
      this.baseCV.employment = this.cvForm.get('employment').value;
    } else {
      this.baseCV.employment = [];
    };    

    // DANE OSOBOWE + ZDJĘCIE
    this.baseCV.name = this.cvForm.get('name').value.charAt(0).toUpperCase() + this.cvForm.get('name').value.slice(1);
    this.baseCV.surname = this.cvForm.get('surname').value.charAt(0).toUpperCase() + this.cvForm.get('surname').value.slice(1);
    this.baseCV.email = this.cvForm.get('email').value;
    this.baseCV.phone = this.cvForm.get('phone').value;
      // !! dodać obsługę zdjęcia
    

    // DOŚWIADCZENIE ZAWODOWE
    this.baseCV.totalExperienceLength = (<FormArray>this.cvForm.get('experience')).length;

    for (let i = 0; i < (<FormArray>this.cvForm.get('experience')).length; i++) {

      if ( (<FormArray>this.cvForm.get('experience')).controls[i].get('employerName').value !== '' ) {

        if ( (<FormArray>this.cvForm.get('experience')).controls[i].get('experienceTillNow').value ) {

          this.baseCV.startWork[i] = new Date((<FormArray>this.cvForm.get('experience')).controls[i].get('workPeriodStart').value).toLocaleDateString('pl', dateOptions);
          this.baseCV.finishWork[i] = 'obecnie';

        } else {

          this.baseCV.startWork[i] = new Date((<FormArray>this.cvForm.get('experience')).controls[i].get('workPeriodStart').value).toLocaleDateString('pl', dateOptions);
          this.baseCV.finishWork[i] = new Date((<FormArray>this.cvForm.get('experience')).controls[i].get('workPeriodEnd').value).toLocaleDateString('pl', dateOptions);

          };

          this.baseCV.employer[i] = (<FormArray>this.cvForm.get('experience')).controls[i].get('employerName').value;
          this.baseCV.trade[i] = (<FormArray>this.cvForm.get('experience')).controls[i].get('trade').value;
          this.baseCV.occupation[i] = (<FormArray>this.cvForm.get('experience')).controls[i].get('occupation').value;

          let responsibilitiesArray = ((<FormArray>this.cvForm.get('experience')).controls[i].get('responsibilities') as FormArray);
          let chosenResponsibilities = [];

          for (let j = 0; j < responsibilitiesArray.length; j++) {
            chosenResponsibilities.push(responsibilitiesArray.controls[j].get('responsibility').value);
            this.baseCV.responsibilities[i] = chosenResponsibilities;
          };

      };
    };

    // EDUKACJA
    this.baseCV.totalEducationLength = (<FormArray>this.cvForm.get('education')).length;

    for (let e = 0; e < (<FormArray>this.cvForm.get('education')).length; e++) {

      if ( (<FormArray>this.cvForm.get('education')).controls[e].get('schoolName').value !== '' ) {

        if ( (<FormArray>this.cvForm.get('education')).controls[e].get('educationTillNow').value ) {

          this.baseCV.startEducation[e] = new Date((<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodStart').value).toLocaleDateString('pl', dateOptions);
          this.baseCV.finishEducation[e] = 'obecnie';

        } else {

          this.baseCV.startEducation[e] = new Date((<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodStart').value).toLocaleDateString('pl', dateOptions);
          this.baseCV.finishEducation[e] = new Date((<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodEnd').value).toLocaleDateString('pl', dateOptions);

          };

          this.baseCV.schoolName[e] = (<FormArray>this.cvForm.get('education')).controls[e].get('schoolName').value;

          this.baseCV.schoolProfile[e] = (<FormArray>this.cvForm.get('education')).controls[e].get('specialization').value || (<FormArray>this.cvForm.get('education')).controls[e].get('classProfile').value;
          this.baseCV.schoolMode[e] = (<FormArray>this.cvForm.get('education')).controls[e].get('educationMode').value || '';          

      };
    };

    // KURSY
    this.baseCV.totalCoursesLength = (<FormArray>this.cvForm.get('courses')).length;

    for (let c = 0; c < (<FormArray>this.cvForm.get('courses')).length; c++) {

      if ((<FormArray>this.cvForm.get('courses')).controls[c].get('courseName').value !== '') {

        if ( (<FormArray>this.cvForm.get('courses')).controls[c].get('courseTillNow').value ) {
          this.baseCV.startCourse[c] = new Date((<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodStart').value).toLocaleDateString('pl', dateOptions);
          this.baseCV.finishCourse[c] = 'obecnie';
        } else {
          this.baseCV.startCourse[c] = new Date((<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodStart').value).toLocaleDateString('pl', dateOptions);
          this.baseCV.finishCourse[c] = new Date((<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodEnd').value).toLocaleDateString('pl', dateOptions);
        };

        this.baseCV.courseName[c] = (<FormArray>this.cvForm.get('courses')).controls[c].get('courseName').value;
        this.baseCV.courseSubject[c] = (<FormArray>this.cvForm.get('courses')).controls[c].get('courseSubject').value;

      };
    };


     // JĘZYKI OBCE
     this.baseCV.totalLanguagesLength = (<FormArray>this.cvForm.get('languages')).length;

     for (let l = 0; l < (<FormArray>this.cvForm.get('languages')).length; l++) {

       if ((<FormArray>this.cvForm.get('languages')).controls[l].get('languageName').value !== '') {

         if ((<FormArray>this.cvForm.get('languages')).controls[l].get('otherLanguage').value !== '') {
           this.baseCV.languageName[l] = ((<FormArray>this.cvForm.get('languages')).controls[l].get('otherLanguage').value);
         } else {
           this.baseCV.languageName[l] = ((<FormArray>this.cvForm.get('languages')).controls[l].get('languageName').value);
         }

         this.baseCV.languageLevel[l] = ('(' + (<FormArray>this.cvForm.get('languages')).controls[l].get('level').value + ')');
         this.baseCV.languageDescription[l] = this.selectedLanguageDegree[l];

       };
     };


     // UMIEJĘTNOŚCI
     if (this.cvForm.get('drivingLicenceDescription').value) {
      this.baseCV.drivingLicence = this.cvForm.get('drivingLicenceDescription').value;
    };
    if (this.cvForm.get('knownProgramsDescription').value) {
      this.baseCV.knownPrograms = this.cvForm.get('knownProgramsDescription').value;
    };
    if (this.cvForm.get('programmingSkillsDescription').value) {
      this.baseCV.programmingLanguages = this.cvForm.get('programmingSkillsDescription').value;
    };
    if (this.cvForm.get('devicesUsageDescription').value) {
      this.baseCV.devices = this.cvForm.get('devicesUsageDescription').value;
    };
    if (this.cvForm.get('permissionsDescription').value) {
      this.baseCV.permissions = this.cvForm.get('permissionsDescription').value;
    };
    if (this.cvForm.get('knownRegulationsDescription').value) {
      this.baseCV.regulations = this.cvForm.get('knownRegulationsDescription').value;
    };
    if (this.cvForm.get('otherSkillsDescription').value) {
      this.baseCV.otherSkills = this.cvForm.get('otherSkillsDescription').value;
    };

    // MOCNE STRONY
    this.baseCV.advantages = this.selectedAdvantagesValues;

    // ZAINTERESOWANIA
    this.baseCV.hobbies = this.cvForm.get('hobbies').value;

    this.baseCV.sendBaseCVData();
    
  }



  //********************  GENEROWANIE CV DO PDF  ********************************/

  public async generatePDF(uploadedPhoto, icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8, icon9, icon10, calendar: HTMLElement): Promise<void> {

    this.checkFormValidity();

    if (this.formValid) {

      this.isLoading = true;
      console.log(this.screenInnerWidth);
      console.log(uploadedPhoto.clientWidth);
      console.log(uploadedPhoto.clientHeight);

      let userPhotoWidth = uploadedPhoto.clientWidth;
      let userPhotoHeight = uploadedPhoto.clientHeight;

      if (this.screenInnerWidth < 1980 && this.screenInnerWidth >= 1800) {
        userPhotoWidth = userPhotoWidth * 0.95; 
      } else if (this.screenInnerWidth < 1800 && this.screenInnerWidth >= 1500) {
        userPhotoWidth = userPhotoWidth * 1.25; 
      } else if (this.screenInnerWidth < 1500 && this.screenInnerWidth >= 1450) {
        userPhotoWidth = userPhotoWidth * 1.4;
      } else if (this.screenInnerWidth < 1450 && this.screenInnerWidth >= 1400) {
        userPhotoWidth = userPhotoWidth * 1.5;
      } else if (this.screenInnerWidth < 1400 && this.screenInnerWidth >= 1280) {
        userPhotoWidth = userPhotoWidth * 1.55;
      } else if (this.screenInnerWidth < 1280 && this.screenInnerWidth >= 1160) {
        userPhotoWidth = userPhotoWidth * 1.3; 
      } else if (this.screenInnerWidth < 1160 && this.screenInnerWidth >= 1100) {
        userPhotoWidth = userPhotoWidth * 1.35; 
      } else if (this.screenInnerWidth < 1100 && this.screenInnerWidth >= 992) {
        userPhotoWidth = userPhotoWidth * 1.55; 
      } else if (this.screenInnerWidth < 992 && this.screenInnerWidth >= 900) { 
        userPhotoWidth = userPhotoWidth * 0.7; 
      } else if (this.screenInnerWidth < 900 && this.screenInnerWidth >= 850) { 
        userPhotoWidth = userPhotoWidth * 0.75; 
      } else if (this.screenInnerWidth < 850 && this.screenInnerWidth >= 769) { 
        userPhotoWidth = userPhotoWidth * 0.8; 
      } else if (this.screenInnerWidth < 769 && this.screenInnerWidth >= 720) { 
        userPhotoWidth = userPhotoWidth * 0.4; 
      } else if (this.screenInnerWidth < 720 && this.screenInnerWidth >= 630) {
        userPhotoWidth = userPhotoWidth * 0.45; 
      } else if (this.screenInnerWidth < 630 && this.screenInnerWidth >= 580) { 
        userPhotoWidth = userPhotoWidth * 0.5; 
      } else if (this.screenInnerWidth < 580 && this.screenInnerWidth >= 558) {
        userPhotoWidth = userPhotoWidth * 0.6; 
      } else if (this.screenInnerWidth < 558 && this.screenInnerWidth >= 500) {
        userPhotoWidth = userPhotoWidth * 0.9; 
      } else if (this.screenInnerWidth < 500 && this.screenInnerWidth >= 480) {
        userPhotoWidth = userPhotoWidth * 1.0; 
      } else if (this.screenInnerWidth < 480 && this.screenInnerWidth >= 420) {
        userPhotoWidth = userPhotoWidth * 1.2; 
      } else if (this.screenInnerWidth < 420 && this.screenInnerWidth >= 400) {
        userPhotoWidth = userPhotoWidth * 0.8; 
      } else if (this.screenInnerWidth < 400 && this.screenInnerWidth >= 360) {
        userPhotoWidth = userPhotoWidth * 0.9; 
      } else if (this.screenInnerWidth < 360 && this.screenInnerWidth >= 300) {
        userPhotoWidth = userPhotoWidth * 1.0; 
      } 
      
      const userPhoto = await domtoimage.toPng(uploadedPhoto, {width: userPhotoWidth, height: userPhotoHeight});
      const headerIcon1 = await domtoimage.toPng(icon1, {width: icon1.clientWidth, height: icon1.clientHeight});
      const headerIcon2 = await domtoimage.toPng(icon2, {width: icon2.clientWidth, height: icon2.clientHeight});
      const headerIcon3 = await domtoimage.toPng(icon3, {width: icon3.clientWidth, height: icon3.clientHeight});
      const headerIcon4 = await domtoimage.toPng(icon4, {width: icon4.clientWidth, height: icon4.clientHeight});
      const headerIcon5 = await domtoimage.toPng(icon5, {width: icon5.clientWidth, height: icon5.clientHeight});
      const headerIcon6 = await domtoimage.toPng(icon6, {width: icon6.clientWidth, height: icon6.clientHeight});
      const headerIcon7 = await domtoimage.toPng(icon7, {width: icon7.clientWidth, height: icon7.clientHeight});
      const headerIcon8 = await domtoimage.toPng(icon8, {width: icon8.clientWidth, height: icon8.clientHeight});
      const headerIcon9 = await domtoimage.toPng(icon9, {width: icon9.clientWidth, height: icon9.clientHeight});
      const headerIcon10 = await domtoimage.toPng(icon10, {width: icon10.clientWidth, height: icon10.clientHeight});
      const calendarIcon = await domtoimage.toPng(calendar, {width: calendar.clientWidth, height: calendar.clientHeight});

      const dateOptions = {
        day: undefined,
        month: 'long',
        year: 'numeric'
      };

      // renderowane ikony i zdjęcie
      this.PDF.userPhoto = userPhoto;
      this.PDF.calendarIcon = calendarIcon;
      this.PDF.conditionsHeaderIcon = headerIcon1;
      this.PDF.personalDataHeaderIcon = headerIcon2;
      this.PDF.experienceHeaderIcon = headerIcon3;
      this.PDF.educationHeaderIcon = headerIcon4;
      this.PDF.coursesHeaderIcon = headerIcon5;
      this.PDF.languagesHeaderIcon = headerIcon6;
      this.PDF.skillsHeaderIcon = headerIcon7;
      this.PDF.advantagesHeaderIcon = headerIcon8;
      this.PDF.hobbiesHeaderIcon = headerIcon9;
      this.PDF.requirementsHeaderIcon = headerIcon10;

      // WARUNKI ZATRUDNIENIA
      this.PDF.position = this.cvForm.get('position').value;
      this.PDF.location = this.cvForm.get('location').value;

      if (!this.selectAvailability) {
        this.PDF.availability = this.cvForm.get('availability').value;
      } else {
        this.PDF.availability = (new Date(this.cvForm.get('availabilityDate').value).toLocaleDateString('pl') + ' r.');
      };

      this.PDF.disposition = this.cvForm.get('disposition').value;

      if (this.cvForm.get('employment').value != '') {
        this.PDF.employment = (this.cvForm.get('employment').value).join(', ');
      } else {
        this.PDF.employment = '';
      };

      this.PDF.salary = this.cvForm.get('salary').value;

      // DANE OSOBOWE
      this.PDF.name = this.cvForm.get('name').value.toUpperCase();
      this.PDF.surname = this.cvForm.get('surname').value.toUpperCase();
      this.PDF.email = this.cvForm.get('email').value;
      this.PDF.phone = this.cvForm.get('phone').value;

      // DOŚWIADCZENIE ZAWODOWE
      this.PDF.totalExperienceLength = (<FormArray>this.cvForm.get('experience')).length;

      for (let i = 0; i < (<FormArray>this.cvForm.get('experience')).length; i++) {

        if ( (<FormArray>this.cvForm.get('experience')).controls[i].get('employerName').value !== '' ) {

          if ( (<FormArray>this.cvForm.get('experience')).controls[i].get('experienceTillNow').value ) {

            this.PDF.startWork[i] = new Date((<FormArray>this.cvForm.get('experience')).controls[i].get('workPeriodStart').value).toLocaleDateString('pl', dateOptions);
            this.PDF.finishWork[i] = 'obecnie';

          } else {

            this.PDF.startWork[i] = new Date((<FormArray>this.cvForm.get('experience')).controls[i].get('workPeriodStart').value).toLocaleDateString('pl', dateOptions);
            this.PDF.finishWork[i] = new Date((<FormArray>this.cvForm.get('experience')).controls[i].get('workPeriodEnd').value).toLocaleDateString('pl', dateOptions);

            };

            this.PDF.employer[i] = (<FormArray>this.cvForm.get('experience')).controls[i].get('employerName').value;
            this.PDF.trade[i] = (<FormArray>this.cvForm.get('experience')).controls[i].get('trade').value;
            this.PDF.occupation[i] = (<FormArray>this.cvForm.get('experience')).controls[i].get('occupation').value;

            let responsibilitiesArray = ((<FormArray>this.cvForm.get('experience')).controls[i].get('responsibilities') as FormArray);
            let chosenResponsibilities = [];

            for (let j = 0; j < responsibilitiesArray.length; j++) {
              chosenResponsibilities.push(responsibilitiesArray.controls[j].get('responsibility').value);
              this.PDF.responsibilities[i] = chosenResponsibilities;
            };

        };
      };

      // EDUKACJA
      this.PDF.totalEducationLength = (<FormArray>this.cvForm.get('education')).length;

      for (let e = 0; e < (<FormArray>this.cvForm.get('education')).length; e++) {

        if ((<FormArray>this.cvForm.get('education')).controls[e].get('schoolName').value !== '') {

          if ( (<FormArray>this.cvForm.get('education')).controls[e].get('educationTillNow').value ) {
            this.PDF.startEducation[e] = new Date((<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodStart').value).toLocaleDateString('pl', dateOptions);
            this.PDF.finishEducation[e] = 'obecnie';
          } else {
            this.PDF.startEducation[e] = new Date((<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodStart').value).toLocaleDateString('pl', dateOptions);
            this.PDF.finishEducation[e] = new Date((<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodEnd').value).toLocaleDateString('pl', dateOptions);
          };

          this.PDF.schoolName[e] = (<FormArray>this.cvForm.get('education')).controls[e].get('schoolName').value;
          this.PDF.schoolProfile[e] = (<FormArray>this.cvForm.get('education')).controls[e].get('specialization').value || (<FormArray>this.cvForm.get('education')).controls[e].get('classProfile').value;

        };
      };

      // KURSY
      this.PDF.totalCoursesLength = (<FormArray>this.cvForm.get('courses')).length;

      for (let c = 0; c < (<FormArray>this.cvForm.get('courses')).length; c++) {

        if ((<FormArray>this.cvForm.get('courses')).controls[c].get('courseName').value !== '') {

          if ( (<FormArray>this.cvForm.get('courses')).controls[c].get('courseTillNow').value ) {
            this.PDF.startCourse[c] = new Date((<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodStart').value).toLocaleDateString('pl', dateOptions);
            this.PDF.finishCourse[c] = 'obecnie';
          } else {
            this.PDF.startCourse[c] = new Date((<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodStart').value).toLocaleDateString('pl', dateOptions);
            this.PDF.finishCourse[c] = new Date((<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodEnd').value).toLocaleDateString('pl', dateOptions);
          };

          this.PDF.courseName[c] = (<FormArray>this.cvForm.get('courses')).controls[c].get('courseName').value;
          this.PDF.courseSubject[c] = (<FormArray>this.cvForm.get('courses')).controls[c].get('courseSubject').value;

        };
      };

      // JĘZYKI OBCE
      this.PDF.totalLanguagesLength = (<FormArray>this.cvForm.get('languages')).length;

      for (let l = 0; l < (<FormArray>this.cvForm.get('languages')).length; l++) {

        if ((<FormArray>this.cvForm.get('languages')).controls[l].get('languageName').value !== '') {

          if ((<FormArray>this.cvForm.get('languages')).controls[l].get('otherLanguage').value !== '') {
            this.PDF.languageName[l] = ((<FormArray>this.cvForm.get('languages')).controls[l].get('otherLanguage').value);
          } else {
            this.PDF.languageName[l] = ((<FormArray>this.cvForm.get('languages')).controls[l].get('languageName').value);
          }

          this.PDF.languageLevel[l] = ('(' + (<FormArray>this.cvForm.get('languages')).controls[l].get('level').value + ')');
          this.PDF.languageDescription[l] = this.selectedLanguageDegree[l];

        };
      };


      // UMIEJĘTNOŚCI
      if (this.cvForm.get('drivingLicenceDescription').value) {
        this.PDF.drivingLicence = this.cvForm.get('drivingLicenceDescription').value;
      };
      if (this.cvForm.get('knownProgramsDescription').value) {
        this.PDF.computerPrograms = this.cvForm.get('knownProgramsDescription').value;
      };
      if (this.cvForm.get('programmingSkillsDescription').value) {
        this.PDF.programmingLanguages = this.cvForm.get('programmingSkillsDescription').value;
      };
      if (this.cvForm.get('devicesUsageDescription').value) {
        this.PDF.devices = this.cvForm.get('devicesUsageDescription').value;
      };
      if (this.cvForm.get('permissionsDescription').value) {
        this.PDF.permissions = this.cvForm.get('permissionsDescription').value;
      };
      if (this.cvForm.get('knownRegulationsDescription').value) {
        this.PDF.regulations = this.cvForm.get('knownRegulationsDescription').value;
      };
      if (this.cvForm.get('otherSkillsDescription').value) {
        this.PDF.otherSkills = this.cvForm.get('otherSkillsDescription').value;
      };

      // MOCNE STRONY
      this.PDF.advantages = this.selectedAdvantagesValues;

      // ZAINTERESOWANIA
      this.PDF.hobbies = this.cvForm.get('hobbies').value;

      // WYMAGANIA REKRUTACYJNE
      for (let r = 0; r < this.requirementsListLength; r++ ) {
        if ((<FormArray>this.cvForm.get('requirements')).controls[r].get('requirement').value === '') {
          (<FormArray>this.cvForm.get('requirements')).controls[r].get('answer').patchValue('');
        };
        if ((<FormArray>this.cvForm.get('requirements')).controls[r].get('requirement').value !='') {
          this.PDF.requirements[r] = (<FormArray>this.cvForm.get('requirements')).controls[r].get('requirement').value;
          this.PDF.answers[r] = (<FormArray>this.cvForm.get('requirements')).controls[r].get('answer').value;
        };
      };

      // KLAUZULA
      this.PDF.clause = this.cvForm.get('clause').value;

      setTimeout(() => this.PDF.generatePDF(), 300);
      this.isLoading = false;
    } else {
      this.openErrorsDialog();
    }

  }
}
