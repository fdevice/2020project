import { Component, OnInit, ElementRef, HostListener, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormArray, FormBuilder, Form } from '@angular/forms';
import { BsLocaleService, BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';
import { plLocale } from 'ngx-bootstrap/locale';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { HintMessageService } from '../../../../assets/services/hint-message.service';
import { fadeInTop } from '../../../../assets/animations/animations';
import { ListsViewerService } from '../../../../assets/services/list-viewer.service';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { WarningDialogComponent } from '../../../../assets/components/warning-dialog/warning-dialog.component';
import { DialogService } from '../../../../assets/services/dialog.service';
import { CVDataService } from 'src/assets/services/cv-data.service';
import { mimeType } from 'src/assets/validators/mime-type.validator';
import { UserDataService } from '../../services/userData.service';
import { Router } from '@angular/router';

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
  baseCVForm: FormGroup;
  employment: any[];
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
  selectedAdvantagesValuesToDatabase: boolean[];
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
  workPeriodEndDateIssue: any[];
  workPeriodEndDateIssueMessage: any[];
  workPeriodCurrentDateIssue: any[];
  workPeriodCurrentDateIssueMessage: any[];
  educationEndDateIssue: boolean[];
  educationEndDateIssueMessage: string[];
  educationCurrentDateIssue: boolean[];
  educationCurrentDateIssueMessage: string[];
  coursesEndDateIssue: boolean[];
  coursesEndDateIssueMessage: string[];
  coursesCurrentDateIssue: boolean[];
  coursesCurrentDateIssueMessage: string[];

  screenInnerWidth: any;  

  experienceTillNowSelected: any[];
  workStartDateFormatted: any[];
  workFinishDateFormatted: any[];
  workStartDateManuallyChanged: any[];
  workFinishDateManuallyChanged: any[];  

  educationTillNowSelected: boolean[] = new Array(30);
  educationStartDateFormatted: any[] = new Array(30);
  educationFinishDateFormatted: any[] = new Array(30);
  educationStartDateManuallyChanged: boolean[] = new Array(30);
  educationFinishDateManuallyChanged: boolean[] = new Array(30);

  courseTillNowSelected: boolean[] = new Array(30);
  courseStartDateFormatted: any[] = new Array(30);
  courseFinishDateFormatted: any[] = new Array(30);
  courseStartDateManuallyChanged: boolean[] = new Array(30);
  courseFinishDateManuallyChanged: boolean[] = new Array(30);

  advantagesLeft: number;
  polishAdvantageSuffix: string;
  focusOnResp: boolean;
  experienceCompleted: boolean[];
  experienceEditMode: boolean[] = new Array(30);
  occupationCompleted: any[];
  occupationEditMode: any[];
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
  hideNextOccupButton: any[];
  hideNextEduButton: boolean = false;
  hideNextCourseButton: boolean = false;

  drivingLicenceChecked: boolean = false;
  knownProgramsChecked: boolean = false;
  programmingSkillsChecked: boolean = false;
  devicesUsageChecked: boolean = false;
  permissionsChecked: boolean = false;
  knownRegulationsChecked: boolean = false;
  otherSkillsChecked: boolean = false;
  
  isLoading: boolean = false;  
  hasBaseCV: boolean;
  loggedUser: any;

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
    return <FormArray>this.baseCVForm.get('experience');
  }  

  get educationArray() {
    return <FormArray>this.baseCVForm.get('education');
  }

  get coursesArray() {
    return <FormArray>this.baseCVForm.get('courses');
  }

  get languagesArray() {
    return <FormArray>this.baseCVForm.get('languages');
  }

  get advantagesArray() {
    return <FormArray>this.baseCVForm.get('advantages');
  }

  get requirementsArray() {
    return <FormArray>this.baseCVForm.get('requirements');
  }



  constructor(    
    private baseCV: CVDataService,
    private userDataService: UserDataService,
    private router: Router,
    private localeService: BsLocaleService,
    private fb: FormBuilder,
    private sharedLists: ListsViewerService,
    private hoverHints: HintMessageService,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    public dialogService: DialogService    
    ) {
      this.DatePickerConfig = Object.assign({}, {containerClass: 'theme-dark-blue', dateInputFormat: 'DD.MM.YYYY' }); //tworzymy zmienną z wybraną konfiguracją obiektu DatePicker
      this.DatePickerWithoutDays = Object.assign({}, {containerClass: 'theme-dark-blue', minMode: this.minMode, dateInputFormat: 'MMMM YYYY'});
    }

  ngOnInit() {          

    this.screenInnerWidth = window.innerWidth;  //początkowa szerokość ekranu po załadowaniu strony    

    let Array2D = (r,c) => [...Array(r)].map(x=>Array(c).fill(0));   // matrix dwuwymariowej tablicy

    this.experienceTillNowSelected = Array2D(30,30);
    this.workPeriodEndDateIssue = Array2D(30,30);
    this.workPeriodEndDateIssueMessage = Array2D(30,30);
    this.workPeriodCurrentDateIssue = Array2D(30,30);
    this.workPeriodCurrentDateIssueMessage = Array2D(30,30);
    this.workStartDateManuallyChanged = Array2D(30,30);
    this.workFinishDateManuallyChanged = Array2D(30,30);
    this.workStartDateFormatted= Array2D(30,30);
    this.workFinishDateFormatted= Array2D(30,30);
    this.occupationCompleted = Array2D(30,30);
    this.occupationEditMode = Array2D(30,30);
    this.hideNextOccupButton = Array2D(30,30);

    this.hideNextOccupButton[0][0] = false;

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
    // this.requirementsListLength = (<FormArray>this.baseCVForm.get('requirements')).length;

    
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

    this.baseCVForm = this.fb.group({                             // reaktywne tworzenie obiektu formularza baseCVForm
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      phone: ['', Validators.required],
      image: [null, [Validators.required], [mimeType]],
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

    this.loggedUser = this.userDataService.getLoggedAs(); 
    this.userDataService.retrieveCV(this.loggedUser);
    this.userDataService.hasBaseCVUpdate.subscribe((result) => {
      this.hasBaseCV = result;  
      if (this.hasBaseCV) {
        this.populatebaseCVForm();
      };    
    });


  }; // koniec onInit()

  ngAfterViewInit() {
    for (let i = 1; i < 5; i++) {
      this.addNewRequirement();
    }
    this.requirementsListLength = (<FormArray>this.baseCVForm.get('requirements')).length;
    this.experienceArrayLength = (<FormArray>this.baseCVForm.get('experience')).length;
  };

        // Na potrzeby obsługi błędu ExpressionChangedAfterItHasBeenCheckedError
  ngAfterViewChecked() {
    let errorHandler = ((<FormArray>this.baseCVForm.get('requirements')).length > 1);
    if (errorHandler != this.errorHandler) { // check if it change, tell CD update view
      this.errorHandler = errorHandler;
      this.cdRef.detectChanges();
    }
  }
  

  public addExperienceFormGroup(): FormGroup {
    return this.fb.group({            
      employerName: ['', Validators.required],
      trade: ['', Validators.required],
      occupationArray: this.fb.array([
        this.addOccupationFormArray()
      ])                       
    });
  };

  public addOccupationFormArray(): FormGroup {    
    return this.fb.group({
      occupation: ['', Validators.required],
      workPeriodStart: ['', Validators.required],
      workPeriodEnd: [''],
      workPeriodNow: [''],
      experienceTillNow: [''],
      responsibilities: this.fb.array([
        this.addResponsibilitiesFormArray()
      ])
    })    
  }

  public addResponsibilitiesFormArray(): FormGroup {
    return this.fb.group({
      responsibility: ['', Validators.required]
    });
  }

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

  public addRequirementsFormGroup(): FormGroup {
    return this.fb.group({
      requirement: [''],
      answer: ['']
    });
  }

  public addNewRequirement(): void {
    let newRequirement = (<FormArray>this.baseCVForm.get('requirements'));
    newRequirement.push(this.addRequirementsFormGroup());
    this.requirementsListLength = (<FormArray>this.baseCVForm.get('requirements')).length;
  }

  public removeRequirement(r: number): void {
    let newRequirement = (<FormArray>this.baseCVForm.get('requirements'));
    newRequirement.removeAt(r);
    this.requirementsListLength = (<FormArray>this.baseCVForm.get('requirements')).length;
  }

  public addNewResponsibility(i: number, o: number): void {
    let newResponsibility = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('responsibilities') as FormArray;
    newResponsibility.push(this.addResponsibilitiesFormArray());
    this.focusOnResp = true;    
  }

  public removeResponsibility(i: number, o: number): void {
    let newResponsibility = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('responsibilities') as FormArray;
    newResponsibility.removeAt(newResponsibility.length - 1);
    this.focusOnResp = true;    
  }

  public removeOccupation(i: number, o: number): void {
    let newOccupation = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray'));
    newOccupation.removeAt(newOccupation.length - 1);    
    this.hideNextOccupButton[i][o-1] = false;   
  };

  public addAdvantagesControls(): FormArray {   //tworzy i zapełnia tablicę baseCVForm.get("advantages")
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

    console.log("WSDF[0]: " + this.workStartDateFormatted[0]);
    console.log("WFDF[0]: " +this.workFinishDateFormatted[0]);

    const dateOptions = {
      day: undefined,
      month: 'long',
      year: 'numeric'
    };

    for (let o = 0; o < (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get("occupationArray")).controls.length; o++) {

      let startWork = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart');
      let finishWork = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodEnd');
      let nowWork = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodNow'); 

      console.log(startWork.value);
      console.log(finishWork.value);
      // console.log(this.workStartDateFormatted[i][o]);
      // console.log(this.workFinishDateFormatted[i][o]);

      if (this.workStartDateFormatted[i][o] == undefined || this.workStartDateFormatted[i][o] == 0) {
        this.workStartDateFormatted[i][o] = new Date(startWork.value).toLocaleDateString('pl', dateOptions);
      };

      if (this.workFinishDateFormatted[i][o] == undefined || this.workFinishDateFormatted[i][o] == 0) {
        this.workFinishDateFormatted[i][o] = new Date(finishWork.value).toLocaleDateString('pl', dateOptions);
      };

      if ((!finishWork.value && !nowWork.value)) {
        (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].setErrors({'incorrect': true});
      };

      if ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].invalid) {
        this.experienceCompletionError = true;
      } else {
        (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].setErrors(null);
        this.experienceCompletionError = false;
        this.experienceCompleted[i] = true;
        // (<FormArray>this.baseCVForm.get('experience')).push(this.addExperienceFormGroup());
      }; 
    };    

    if ((<FormArray>this.baseCVForm.get('experience')).controls[i].invalid) {
      this.experienceCompletionError = true;
    } else {
      (<FormArray>this.baseCVForm.get('experience')).controls[i].setErrors(null);
      this.experienceCompletionError = false;
      this.experienceCompleted[i] = true;
      (<FormArray>this.baseCVForm.get('experience')).push(this.addExperienceFormGroup());
    };   
    
    this.hideNextOccupButton[i+1][0] = false;
    
  };

  public addOccupationButtonClick(i: number, o: number) {
    this.hideNextOccupButton[i][o] = true;
    // console.log("HideNextOccButt " + "[" + i + "][" + o + "]: " + this.hideNextOccupButton[i][o]);
    // console.log("Dirty?: " + (this.getOccupationControls(i, o).get('workPeriodStart').dirty));
    (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).push(this.addOccupationFormArray());
    this.hideNextOccupButton[i][o+1] = false;
  };

  public toggleExperienceEdit(i: number) {
    this.experienceCompleted[i] = false;
    this.experienceEditMode[i] = true;
    this.hideNextExpButton = true;

    for (let o = 0; o < (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get("occupationArray")).controls.length; o++) {

      let startWork = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart');
      let finishWork = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodEnd');
      let nowWork = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodNow'); 

      console.log("Start work on edit button click: " + startWork.value + " / " + typeof startWork.value);
      console.log("Finish work on edit button click: " + finishWork.value + " / " + typeof finishWork.value);

    };    
  }

  public finishExperienceEdition(i: number) {   

    const dateOptions = {
      day: undefined,
      month: 'long',
      year: 'numeric'
    };

    for (let o = 0; o < (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get("occupationArray")).controls.length; o++) {

      let startWork = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart');
      let finishWork = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodEnd');
      let nowWork = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodNow'); 

      console.log("Start work on close edit button click: " + startWork.value + " / " + typeof startWork.value);
      console.log("Finish work on close edit button click: " + finishWork.value + " / " + typeof finishWork.value);

      if (startWork.value instanceof Object) {
        this.workStartDateFormatted[i][o] = new Date(startWork.value).toLocaleDateString('pl', dateOptions);
      } else {
        this.workStartDateFormatted[i][o] = startWork.value;
      };

      if (finishWork.value instanceof Object) {
        this.workFinishDateFormatted[i][o] = new Date(finishWork.value).toLocaleDateString('pl', dateOptions);
      } else {
        this.workFinishDateFormatted[i][o] = finishWork.value;
      };
    };           
    
    this.experienceCompleted[i] = true;
    this.experienceEditMode[i] = false;
    this.hideNextExpButton = false;
  };

  public removeChosenExperience(i: number) {
    (<FormArray>this.baseCVForm.get('experience')).removeAt(i);
    this.experienceCompleted.splice(i, 1);
    console.log('Tablica experienceCompleted: ' + this.experienceCompleted);
    console.log('Długość tablicy experience: ' + (<FormArray>this.baseCVForm.get('experience')).length);
  }

  public addEducationButtonClick(e: number): void {  // tutej!
    
    const dateOptions = {
      day: undefined,
      month: 'long',
      year: 'numeric'
    };

    // console.log((<FormArray>this.baseCVForm.get('education')).controls[e].get('educationTillNow').value);  
    let startEducation = (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart');  
    let finishEducation = (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodEnd');
    let nowEducation = (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodNow');

    if (this.educationStartDateFormatted[e] == undefined) {
      this.educationStartDateFormatted[e] = new Date(startEducation.value).toLocaleDateString('pl', dateOptions);
    };

    if (this.educationFinishDateFormatted[e] == undefined) {
      this.educationFinishDateFormatted[e] = new Date(finishEducation.value).toLocaleDateString('pl', dateOptions);
    };

    if ((!finishEducation.value && !nowEducation.value)) {
      (<FormArray>this.baseCVForm.get('education')).controls[e].setErrors({'incorrect': true});
    };

    if ((<FormArray>this.baseCVForm.get('education')).controls[e].invalid) {
      this.educationCompletionError = true;
    } else {
      (<FormArray>this.baseCVForm.get('education')).controls[e].setErrors(null);
      this.educationCompletionError = false;
      this.educationCompleted[e] = true;
      (<FormArray>this.baseCVForm.get('education')).push(this.addEducationFormGroup());
    };   
    
  }

  public toggleEducationEdit(e: number) {

    this.educationCompleted[e] = false;
    this.educationEditMode[e] = true;
    this.hideNextEduButton = true;

    let startEducation = (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart');
    let finishEducation= (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodEnd');

    console.log("Start education on edit button click: " + startEducation.value + " / " + typeof startEducation.value);
    console.log("Finish education on edit button click: " + finishEducation.value + " / " + typeof finishEducation.value);
  };

  public finishEducationEdition(e: number) {

    const dateOptions = {
      day: undefined,
      month: 'long',
      year: 'numeric'
    };

    let startEducation = (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart');
    let finishEducation = (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodEnd');
    
    // this.workStartDateFormatted[i] = new Date(startWork.value).toLocaleDateString('pl', dateOptions);
    // this.workFinishDateFormatted[i] = new Date(finishWork.value).toLocaleDateString('pl', dateOptions);

    console.log("Start education on close edit button click: " + startEducation.value + " / " + typeof startEducation.value);
    console.log("Finish education on close edit button click: " + finishEducation.value + " / " + typeof finishEducation.value);

    if (startEducation.value instanceof Object) {
      this.educationStartDateFormatted[e] = new Date(startEducation.value).toLocaleDateString('pl', dateOptions);
    } else {
      this.educationStartDateFormatted[e] = startEducation.value;
    };

    if (finishEducation.value instanceof Object) {
      this.educationFinishDateFormatted[e] = new Date(finishEducation.value).toLocaleDateString('pl', dateOptions);
    } else {
      this.educationFinishDateFormatted[e] = finishEducation.value;
    };

    this.educationCompleted[e] = true;
    this.educationEditMode[e] = false;
    this.hideNextEduButton = false;
  }

  public removeChosenEducation(e: number) {
    (<FormArray>this.baseCVForm.get('education')).removeAt(e);
    this.educationCompleted.splice(e, 1);
    console.log('Tablica educationCompleted: ' + this.educationCompleted);
    console.log('Długość tablicy education: ' + (<FormArray>this.baseCVForm.get('education')).length);    
  }

  public addCoursesButtonClick(c: number): void {
    
    const dateOptions = {
      day: undefined,
      month: 'long',
      year: 'numeric'
    };

    let startCourse = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart');
    let finishCourse = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodEnd');
    let nowCourse = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodNow');

    console.log("Start course on close edit button click: " + startCourse.value + " / " + typeof startCourse.value);
    console.log("Finish course on close edit button click: " + finishCourse.value + " / " + typeof finishCourse.value);

    if (this.courseStartDateFormatted[c] == undefined) {
      this.courseStartDateFormatted[c] = new Date(startCourse.value).toLocaleDateString('pl', dateOptions);
    };

    if (this.courseFinishDateFormatted[c] == undefined) {
      this.courseFinishDateFormatted[c] = new Date(finishCourse.value).toLocaleDateString('pl', dateOptions);
    };

    if ((!finishCourse.value && !nowCourse.value)) {
      (<FormArray>this.baseCVForm.get('courses')).controls[c].setErrors({'incorrect': true});
    };

    if ((<FormArray>this.baseCVForm.get('courses')).controls[c].invalid) {
      this.coursesCompletionError = true;
    } else {
      (<FormArray>this.baseCVForm.get('courses')).controls[c].setErrors(null);
      this.coursesCompletionError = false;
      this.coursesCompleted[c] = true;
      (<FormArray>this.baseCVForm.get('courses')).push(this.addCoursesFormGroup());      
    };    
  }

  public toggleCoursesEdit(c: number) {
    this.coursesCompleted[c] = false;
    this.coursesEditMode[c] = true;
    this.hideNextCourseButton = true;

    let startCourse = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart');
    let finishCourse = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodEnd');

    console.log("Start course on edit button click: " + startCourse.value + " / " + typeof startCourse.value);
    console.log("Finish course on edit button click: " + finishCourse.value + " / " + typeof finishCourse.value);
  };

  public finishCoursesEdition(c: number) {

    const dateOptions = {
      day: undefined,
      month: 'long',
      year: 'numeric'
    };

    let startCourse = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart');
    let finishCourse = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodEnd');

    if (startCourse.value instanceof Object) {
      this.courseStartDateFormatted[c] = new Date(startCourse.value).toLocaleDateString('pl', dateOptions);
    } else {
      this.courseStartDateFormatted[c] = startCourse.value;
    };

    if (finishCourse.value instanceof Object) {
      this.courseFinishDateFormatted[c] = new Date(finishCourse.value).toLocaleDateString('pl', dateOptions);
    } else {
      this.courseFinishDateFormatted[c] = finishCourse.value;
    };

    this.coursesCompleted[c] = true;
    this.coursesEditMode[c] = false;
    this.hideNextCourseButton = false;
  }

  public removeChosenCourse(c: number) {
    (<FormArray>this.baseCVForm.get('courses')).removeAt(c);
    this.coursesCompleted.splice(c, 1);
    console.log('Tablica coursesCompleted: ' + this.coursesCompleted);
    console.log('Długość tablicy courses: ' + (<FormArray>this.baseCVForm.get('courses')).length);    
  }


  public addLanguagesButtonClick(): void {
    (<FormArray>this.baseCVForm.get('languages')).push(this.addLanguagesFormGroup());   
  }

  public removeLanguagesButtonClick(): void {
    let lastElement = (<FormArray>this.baseCVForm.get('languages')).length;
    (<FormArray>this.baseCVForm.get('languages')).removeAt(lastElement - 1);    
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
    return (this.baseCVForm.get('experience') as FormArray).controls[i];
  }

  public getOccupation(i: number) {
    return (<FormArray>(this.baseCVForm.get('experience') as FormArray).controls[i].get('occupationArray'));
  }

  public getOccupationControls(i: number, o: number) {
    return (<FormArray>(this.baseCVForm.get('experience') as FormArray).controls[i].get('occupationArray')).controls[o];
  }

  public getResponsibilitiesControls(i: number, o: number) {
    return (<FormArray>(<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('responsibilities'));
  }

  public getEducationControls(e: number) {
    return (this.baseCVForm.get('education') as FormArray).controls[e];
  }

  public getCoursesControls(c: number) {
    return (this.baseCVForm.get('courses') as FormArray).controls[c];
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
    this.selectedAdvantagesValuesToDatabase = [];
    this.advantagesArray.controls.forEach((control, i) => { //sprawdza każdy z elementów tablicy advantagesArrray i jeżeli posiada wartość true (został zaznaczony checkbox), dodaje go do tablicy selectedAdvantagesValues
      this.selectedAdvantagesValuesToDatabase[i] = control.value;
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

    if (this.advantagesLeft == 0) {

      console.log(this.advantagesArray.controls);

      this.advantagesArray.controls.forEach((checkbox, i) => {
        if (checkbox.value == false) {
          console.log("False!");
          this.advantagesArray.controls[i].disable();
        } else {
        console.log("selected!");
        }
      });
    } else {
      this.advantagesArray.controls.forEach((checkbox, i) => {        
          this.advantagesArray.controls[i].enable();        
      });
    }

    console.log(this.selectedAdvantagesValuesToDatabase);
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

    if ((<FormArray>this.baseCVForm.get('languages')).controls[l].get('languageName').dirty) {
      (<FormArray>this.baseCVForm.get('languages')).controls[l].get('level').enable();
    } else {
      (<FormArray>this.baseCVForm.get('languages')).controls[l].get('level').reset();
      (<FormArray>this.baseCVForm.get('languages')).controls[l].get('level').disable();
    }   
  };

  public onLanguageLevelChange(level: any, index: number) {
    this.selectedLanguageDegree[index] = level.description;
  }    

  public onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    console.log("info o file: ");
    console.dir(file);
    const reader = new FileReader();

    console.log("Zdjęcie jest typu: " + typeof file);
    this.baseCVForm.patchValue({image: file});
    this.baseCVForm.get("image").updateValueAndValidity();    
    console.log("Typ value kontrolki zdjęcia " + typeof this.baseCVForm.get('image').value);

    reader.onload = () => {  // wczytywanie jest procesem asynchronicznym
      this.uploadedImage = reader.result;
      console.log("Załadowane zdjęcie: " + this.uploadedImage);
      console.log("uploadedimage jest typu: " + typeof this.uploadedImage);
    };
    reader.readAsDataURL(file); // uruchamianie readera
  };    

  public toggleDrivingLicenceDescription(e: Event) {    
    if ((<HTMLInputElement>(e.target)).checked) {
      this.baseCVForm.get('drivingLicenceDescription').enable();
      this.drivingLicenceChecked = true;      
    } else {
      this.baseCVForm.get('drivingLicenceDescription').reset()
      this.baseCVForm.get('drivingLicenceDescription').disable();
      this.drivingLicenceChecked = false;      
    }
  }

  public toggleKnownProgramsDescription(e: Event) {   
    if ((<HTMLInputElement>(e.target)).checked) {
      this.baseCVForm.get('knownProgramsDescription').enable();
      this.knownProgramsChecked = true; 
    } else {
      this.baseCVForm.get('knownProgramsDescription').reset()
      this.baseCVForm.get('knownProgramsDescription').disable();
      this.knownProgramsChecked = false; 
    }
  }

  public toggleProgrammingSkillsDescription(e: Event) {    
    if ((<HTMLInputElement>(e.target)).checked) {
      this.baseCVForm.get('programmingSkillsDescription').enable();
      this.programmingSkillsChecked = true; 
    } else {
      this.baseCVForm.get('programmingSkillsDescription').reset()
      this.baseCVForm.get('programmingSkillsDescription').disable();
      this.programmingSkillsChecked = false; 
    }
  }

  public toggleDevicesUsageDescription(e: Event) {    
    if ((<HTMLInputElement>(e.target)).checked) {
      this.baseCVForm.get('devicesUsageDescription').enable();
      this.devicesUsageChecked = true; 
    } else {
      this.baseCVForm.get('devicesUsageDescription').reset()
      this.baseCVForm.get('devicesUsageDescription').disable();
      this.devicesUsageChecked = false; 
    }
  }

  public togglePermissionsDescription(e: Event) {    
    if ((<HTMLInputElement>(e.target)).checked) {
      this.baseCVForm.get('permissionsDescription').enable();
      this.permissionsChecked = true; 
    } else {
      this.baseCVForm.get('permissionsDescription').reset()
      this.baseCVForm.get('permissionsDescription').disable();
      this.permissionsChecked = false; 
    }
  }

  public toggleKnownRegulationsDescription(e: Event) {    
    if ((<HTMLInputElement>(e.target)).checked) {
      this.baseCVForm.get('knownRegulationsDescription').enable();
      this.knownRegulationsChecked = true; 
    } else {
      this.baseCVForm.get('knownRegulationsDescription').reset()
      this.baseCVForm.get('knownRegulationsDescription').disable();
      this.knownRegulationsChecked = false; 
    }
  }

  public toggleOtherSkillsDescription(e: Event) {
    if ((<HTMLInputElement>(e.target)).checked) {
      this.baseCVForm.get('otherSkillsDescription').enable();
      this.otherSkillsChecked = true; 
    } else {
      this.baseCVForm.get('otherSkillsDescription').reset()
      this.baseCVForm.get('otherSkillsDescription').disable();
      this.otherSkillsChecked = true; 
    }
  }

  public setExperienceTillNow(i: number, o: number) {
    if ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('experienceTillNow').value) {
      (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodNow').setValue('obecnie');
    } else {
      (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodNow').setValue('');
    }
  };

  public setEducationTillNow(i: number) {
    if ((<FormArray>this.baseCVForm.get('education')).controls[i].get('educationTillNow').value) {
      (<FormArray>this.baseCVForm.get('education')).controls[i].get('educationPeriodNow').setValue('obecnie');
    } else {
      (<FormArray>this.baseCVForm.get('education')).controls[i].get('educationPeriodNow').setValue('');
    }
  };

  public setCourseTillNow(i: number) {
    if ((<FormArray>this.baseCVForm.get('courses')).controls[i].get('courseTillNow').value) {
      (<FormArray>this.baseCVForm.get('courses')).controls[i].get('coursePeriodNow').setValue('obecnie');
    } else {
      (<FormArray>this.baseCVForm.get('courses')).controls[i].get('coursePeriodNow').setValue('');
    }
  };

  public setExperienceControlManuallyChanged (control: string, index: number, o: number, e: Event) {
    if (e != null && e instanceof Object) {  // z serwera zwracany jest typ String, a po wybraniu z kalendarza typ Object
      // console.log(control);
      console.log("Kontrolka " + control + ": " + e);
      // console.log(typeof e);      
      if (control === 'workStart') {
        this.workStartDateManuallyChanged[index][o] = true;
        console.log("workStartDateManuallyChanged[" + index + ' ' + o + "]: " + this.workStartDateManuallyChanged[index][o]);
      };
      if (control === 'workFinish') {
        this.workFinishDateManuallyChanged[index][o] = true;
        console.log("workFinishDateManuallyChanged[" + index + ' ' + o + "]: " + this.workFinishDateManuallyChanged[index][o]);
      };     
    };     
  };

  public setControlManuallyChanged (control: string, index: number, e: Event) {
    if (e != null && e instanceof Object) {  // z serwera zwracany jest typ String, a po wybraniu z kalendarza typ Object
      // console.log(control);
      console.log("Kontrolka " + control + ": " + e);
      // console.log(typeof e);           
      if (control === 'educationStart') {
        this.educationStartDateManuallyChanged[index] = true;
        console.log("educationStartDateManuallyChanged[" + index + "]: " + this.educationStartDateManuallyChanged[index]);
      };
      if (control === 'educationFinish') {
        this.educationFinishDateManuallyChanged[index] = true;
        console.log("educationFinishDateManuallyChanged[" + index + "]: " + this.educationFinishDateManuallyChanged[index]);
      };
      if (control === 'courseStart') {
        this.courseStartDateManuallyChanged[index] = true;
        console.log("courseStartDateManuallyChanged[" + index + "]: " + this.courseStartDateManuallyChanged[index]);
      };
      if (control === 'courseFinish') {
        this.courseFinishDateManuallyChanged[index] = true;
        console.log("courseFinishDateManuallyChanged[" + index + "]: " + this.courseFinishDateManuallyChanged[index]);
      };
    };     
  };

  public checkWorkPeriodDate(i: number, o: number, e: Event) {

    if (e != null && e instanceof Object) {  // z serwera zwracany jest typ String, a po wybraniu z kalendarza typ Object

      const dateOptions = {
        day: undefined,
        month: 'long',
        year: 'numeric'
      };
      let today = new Date();
      let startDate = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart').value;
      let endDate = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodEnd').value;
      let tillNow = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodNow').value;
  
      // this.workStartDateFormatted[i] = new Date(startDate).toLocaleDateString('pl', dateOptions);
      // this.workFinishDateFormatted[i] = new Date(endDate).toLocaleDateString('pl', dateOptions);
  
      if ((startDate > endDate) && endDate != '' && tillNow === '') {
        this.workPeriodEndDateIssue[i][o] = true;
        this.workPeriodEndDateIssueMessage[i] = 'Data rozpoczęcia pracy nie może być nowsza od daty jej zakończenia!';
      } else {
        this.workPeriodEndDateIssue[i][o] = false;
        this.workPeriodEndDateIssueMessage[i] = '';
      };
  
      if (startDate > today) {
        this.workPeriodCurrentDateIssue[i][o] = true;
        this.workPeriodCurrentDateIssueMessage[i] = 'Data rozpoczęcia pracy nie może być nowsza od dzisiejszej!';
      } else {
        this.workPeriodCurrentDateIssue[i][o] = false;
      };

    };
    
  };

  public checkEducationDate(e: number) {
    let today = new Date();
    let startDate = (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart').value;
    let endDate = (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodEnd').value;
    let tillNow = (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodNow').value;

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
    let startDate = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart').value;
    let endDate = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodEnd').value;
    let tillNow = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodNow').value;

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
    let position = this.baseCVForm.get('position');
    let location = this.baseCVForm.get('location');
    let availability = this.baseCVForm.get('availability');
    let disposition = this.baseCVForm.get('disposition');
    let name = this.baseCVForm.get('name');
    let surname = this.baseCVForm.get('surname');
    let email = this.baseCVForm.get('email');
    let phone = this.baseCVForm.get('phone');
    let education = (<FormArray>this.baseCVForm.get('education'));
    let hobby = this.baseCVForm.get('hobbies');
    let clause = this.baseCVForm.get('clause');

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

    if (this.baseCVForm.dirty) {

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
    
    // let occupationArray: any[] = new Array();

    // WARUNKI ZATRUDNIENIA
    this.baseCV.position = this.baseCVForm.get('position').value;
    this.baseCV.location = this.baseCVForm.get('location').value;
    this.baseCV.disposition = this.baseCVForm.get('disposition').value;
    this.baseCV.salary = this.baseCVForm.get('salary').value;
    
    if (!this.selectAvailability) {
      this.baseCV.availability = this.baseCVForm.get('availability').value;
    } else {
      // this.baseCV.availability = (new Date(this.baseCVForm.get('availabilityDate').value).toLocaleDateString('pl') + ' r.');
      this.baseCV.availability = (new Date(this.baseCVForm.get('availabilityDate').value).toLocaleDateString());
    };

    if (this.baseCVForm.get('employment').value != '') {
      this.baseCV.employment = this.baseCVForm.get('employment').value;
    } else {
      this.baseCV.employment = [];
    };    

    // DANE OSOBOWE
    this.baseCV.name = this.baseCVForm.get('name').value.charAt(0).toUpperCase() + this.baseCVForm.get('name').value.slice(1);
    this.baseCV.surname = this.baseCVForm.get('surname').value.charAt(0).toUpperCase() + this.baseCVForm.get('surname').value.slice(1);
    this.baseCV.email = this.baseCVForm.get('email').value;
    this.baseCV.phone = this.baseCVForm.get('phone').value;   
    

    // DOŚWIADCZENIE ZAWODOWE
    this.baseCV.totalExperienceLength = (<FormArray>this.baseCVForm.get('experience')).length;

    let startWork = new Array();
    let finishWork = new Array()
    let occupation = new Array();
    let responsibilities = new Array();

    for (let i = 0; i < (<FormArray>this.baseCVForm.get('experience')).length; i++) {

      let occupationArray: any[] = new Array();

      if ( (<FormArray>this.baseCVForm.get('experience')).controls[i].get('employerName').value !== '' ) {

        this.baseCV.employer[i] = (<FormArray>this.baseCVForm.get('experience')).controls[i].get('employerName').value;
        this.baseCV.trade[i] = (<FormArray>this.baseCVForm.get('experience')).controls[i].get('trade').value;

        for (let o = 0; o < (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).length; o++) {         

          if ( (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('experienceTillNow').value ) {

            if (this.workStartDateManuallyChanged[i][o] == true) {

              startWork[o] = new Date((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart').value).toLocaleDateString('pl', dateOptions);
                            
            } else {
              startWork[o] = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart').value;
            };          
            
            finishWork[o] = 'obecnie';
  
          } else {
            
            if (this.workStartDateManuallyChanged[i][o] == true) {
              startWork[o] = new Date((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart').value).toLocaleDateString('pl', dateOptions); 
            } else {
              startWork[o] = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart').value;
            };
            
            if (this.workFinishDateManuallyChanged[i][o] == true) {
              finishWork[o]  = new Date((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodEnd').value).toLocaleDateString('pl', dateOptions);
            } else {
              finishWork[o] = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodEnd').value;
            };          
          };

          occupation[o] = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('occupation').value;

          let responsibilitiesArray = ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('responsibilities') as FormArray);
          let chosenResponsibilities = [];

          for (let j = 0; j < responsibilitiesArray.length; j++) {
            chosenResponsibilities.push(responsibilitiesArray.controls[j].get('responsibility').value);
            responsibilities[o] = chosenResponsibilities;
          };      
          
          let occupationData: any[] = [
            {
              workStart: startWork[o],
              workFinish: finishWork[o],
              occupation: occupation[o],
              responsibilities: responsibilities[o]
            }
          ]; 

          occupationArray.push(occupationData);          

        };  // Koniec pętli occupation          

          this.baseCV.occupationData[i] = occupationArray;                                     

      };
    };

    // EDUKACJA
    this.baseCV.totalEducationLength = (<FormArray>this.baseCVForm.get('education')).length;

    for (let e = 0; e < (<FormArray>this.baseCVForm.get('education')).length; e++) {

      if ( (<FormArray>this.baseCVForm.get('education')).controls[e].get('schoolName').value !== '' ) {

        if ( (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationTillNow').value ) {

          if (this.educationStartDateManuallyChanged[e] == true) {
            this.baseCV.startEducation[e] = new Date((<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart').value).toLocaleDateString('pl', dateOptions);
          } else {
            this.baseCV.startEducation[e] = (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart').value;
          };                    

          this.baseCV.finishEducation[e] = 'obecnie';

          // this.baseCV.startEducation[e] = new Date((<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart').value).toLocaleDateString('pl', dateOptions);
          // this.baseCV.finishEducation[e] = 'obecnie';

        } else {

          if (this.educationStartDateManuallyChanged[e] == true) {
            this.baseCV.startEducation[e] = new Date((<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart').value).toLocaleDateString('pl', dateOptions);
          } else {
            this.baseCV.startEducation[e] = (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart').value;
          };  

          if (this.educationFinishDateManuallyChanged[e] == true) {
            this.baseCV.finishEducation[e] = new Date((<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodEnd').value).toLocaleDateString('pl', dateOptions);
          } else {
            this.baseCV.finishEducation[e] = (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodEnd').value;
          }; 

          // this.baseCV.startEducation[e] = new Date((<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart').value).toLocaleDateString('pl', dateOptions);
          // this.baseCV.finishEducation[e] = new Date((<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodEnd').value).toLocaleDateString('pl', dateOptions);

          };

          this.baseCV.schoolName[e] = (<FormArray>this.baseCVForm.get('education')).controls[e].get('schoolName').value;

          this.baseCV.schoolProfile[e] = (<FormArray>this.baseCVForm.get('education')).controls[e].get('specialization').value || (<FormArray>this.baseCVForm.get('education')).controls[e].get('classProfile').value;
          this.baseCV.schoolMode[e] = (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationMode').value || '';       
          
          if (this.schoolTypeSelected[e] == 1) {
            this.baseCV.schoolTypeIndex[e] = 1;
            this.baseCV.schoolType[e] = "Wyższa"; 
          } else {
            this.baseCV.schoolTypeIndex[e] = 2;
            this.baseCV.schoolType[e] = "Średnia";             
          };         
      };
    };

    // KURSY
    this.baseCV.totalCoursesLength = (<FormArray>this.baseCVForm.get('courses')).length;

    for (let c = 0; c < (<FormArray>this.baseCVForm.get('courses')).length; c++) {

      if ((<FormArray>this.baseCVForm.get('courses')).controls[c].get('courseName').value !== '') {

        if ( (<FormArray>this.baseCVForm.get('courses')).controls[c].get('courseTillNow').value ) {

          if (this.courseStartDateManuallyChanged[c] == true) {
            this.baseCV.startCourse[c] = new Date((<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart').value).toLocaleDateString('pl', dateOptions);
          } else {
            this.baseCV.startCourse[c] = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart').value;
          };                    

          this.baseCV.finishCourse[c] = 'obecnie';

          // this.baseCV.startCourse[c] = new Date((<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart').value).toLocaleDateString('pl', dateOptions);
          // this.baseCV.finishCourse[c] = 'obecnie';
        } else {

          if (this.courseStartDateManuallyChanged[c] == true) {
            this.baseCV.startCourse[c] = new Date((<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart').value).toLocaleDateString('pl', dateOptions);
          } else {
            this.baseCV.startCourse[c] = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart').value;
          };   

          if (this.courseFinishDateManuallyChanged[c] == true) {
            this.baseCV.finishCourse[c] = new Date((<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodEnd').value).toLocaleDateString('pl', dateOptions);
          } else {
            this.baseCV.finishCourse[c] = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodEnd').value;
          }; 

          // this.baseCV.startCourse[c] = new Date((<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart').value).toLocaleDateString('pl', dateOptions);
          // this.baseCV.finishCourse[c] = new Date((<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodEnd').value).toLocaleDateString('pl', dateOptions);
        };

        this.baseCV.courseName[c] = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('courseName').value;
        this.baseCV.courseSubject[c] = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('courseSubject').value;

      };
    };


     // JĘZYKI OBCE
     this.baseCV.totalLanguagesLength = (<FormArray>this.baseCVForm.get('languages')).length;

     for (let l = 0; l < (<FormArray>this.baseCVForm.get('languages')).length; l++) {

       if ((<FormArray>this.baseCVForm.get('languages')).controls[l].get('languageName').value !== '') {

         if ((<FormArray>this.baseCVForm.get('languages')).controls[l].get('otherLanguage').value !== '') {
           this.baseCV.languageName[l] = ((<FormArray>this.baseCVForm.get('languages')).controls[l].get('otherLanguage').value);
         } else {
           this.baseCV.languageName[l] = ((<FormArray>this.baseCVForm.get('languages')).controls[l].get('languageName').value);
         }

         this.baseCV.languageLevel[l] = ((<FormArray>this.baseCVForm.get('languages')).controls[l].get('level').value);
         this.baseCV.languageDescription[l] = this.selectedLanguageDegree[l];

       };
     };


     // UMIEJĘTNOŚCI
     if (this.baseCVForm.get('drivingLicenceDescription').value) {
      this.baseCV.drivingLicence = this.baseCVForm.get('drivingLicenceDescription').value;
    };
    if (this.baseCVForm.get('knownProgramsDescription').value) {
      this.baseCV.knownPrograms = this.baseCVForm.get('knownProgramsDescription').value;
    };
    if (this.baseCVForm.get('programmingSkillsDescription').value) {
      this.baseCV.programmingLanguages = this.baseCVForm.get('programmingSkillsDescription').value;
    };
    if (this.baseCVForm.get('devicesUsageDescription').value) {
      this.baseCV.devices = this.baseCVForm.get('devicesUsageDescription').value;
    };
    if (this.baseCVForm.get('permissionsDescription').value) {
      this.baseCV.permissions = this.baseCVForm.get('permissionsDescription').value;
    };
    if (this.baseCVForm.get('knownRegulationsDescription').value) {
      this.baseCV.regulations = this.baseCVForm.get('knownRegulationsDescription').value;
    };
    if (this.baseCVForm.get('otherSkillsDescription').value) {
      this.baseCV.otherSkills = this.baseCVForm.get('otherSkillsDescription').value;
    };

    // MOCNE STRONY
    this.getSelectedAdvantagesValues();
    this.baseCV.advantages = this.selectedAdvantagesValues;
    this.baseCV.selectedAdvantagesIndex = this.selectedAdvantagesValuesToDatabase;

    // ZAINTERESOWANIA
    this.baseCV.hobbies = this.baseCVForm.get('hobbies').value;    

    // ZDJĘCIE
    this.baseCV.sendBaseCVData(this.baseCVForm.get("image").value);

    this.router.navigate(["/kokpit"]);
    
  };

  compareFn: ((f1: any, f2: any) => boolean) | null = this.compareByValue 

  compareFnLang: ((f1: any, f2: any) => boolean) | null = this.compareByLang 

  compareFnEdu: ((f1: any, f2: any) => boolean) | null = this.compareByEdu 

  compareFn1(f1: any, f2: any) {    
    console.log("f1: " + f1 + "typ: " + typeof(f1));
    console.log("f2: " + f2 + "typ: " + typeof(f2));       
    return f1.toString() && f2 && f1.toString() === f2;
  }

  compareByEdu(f1: any, f2: any) {
    // console.log("f1: " + f1);
    // console.log("f2: " + f2);       
    return f1 && f2 && f1 === f2;
  }

  compareByValue(f1: any, f2: any) {     
    return f1 && f2 && f1.value === f2.value; 
  }

  compareByLang(f1: any, f2:any) {
    // console.log("f1: " + f1);
    // console.log("f2: " + f2);    
    // return f1 && f2 && f1.lang === f2.lang;

    return f1 && f2 && f1 === f2;
  }


  //********************  POBIERANIE BAZOWEGO CV  ********************************/

  public populatebaseCVForm() {

    this.baseCV.getBaseCVData();

    let employmentFromDatabase = [];
    let availabilityFromDatabase = '';
    let languagesFromDatabase = [];
    let advantagesIndexFromDatabase = [];
    let experienceFromDatabase = [];
    let educationFromDatabase = [];
    let coursesFromDatabase = [];

    this.baseCV.receivedFormData.subscribe((CVData) => {
      console.log(CVData);
      employmentFromDatabase = CVData.data.baseCVData.employment;
      this.baseCVForm.get('employment').setValue(employmentFromDatabase);

        // DANE OSOBOWE, WARUNKI ZATRUDNIENIA, ZAINTERESOWANIA
      this.baseCVForm.patchValue({
        name: CVData.data.name,
        surname: CVData.data.surname,
        phone: CVData.data.phone,
        email: CVData.data.contactEmail,       
        position: CVData.data.baseCVData.position,
        location: CVData.data.baseCVData.location,        
        disposition: CVData.data.baseCVData.disposition,
        salary: CVData.data.baseCVData.salary,
        hobbies: CVData.data.baseCVData.hobby              
      });

      if (CVData.data.baseCVData.photoPath && CVData.data.baseCVData.photoPath !== '') {        
        this.baseCVForm.patchValue({ image: CVData.data.baseCVData.photoPath });
        this.baseCVForm.get("image").updateValueAndValidity();    
        console.log(this.baseCVForm.get("image").value);
        this.uploadedImage = CVData.data.baseCVData.photoPath;
        // this.cdRef.detectChanges();
        // this.getBase64ImageFromUrl(CVData.data.baseCVData.photoPath)
        // .then(result => this.uploadedImage = result)
        // .catch(err => console.error(err));
      };      

      console.log("Fotka po pobraniu danych: " + this.uploadedImage);

        // DOSTĘPNOŚĆ
      availabilityFromDatabase = CVData.data.baseCVData.availability;
      switch (availabilityFromDatabase) {
        case 'Od zaraz':
          this.baseCVForm.patchValue({ availability: availabilityFromDatabase });
          break;
        case '2 tygodnie okresu wypowiedzenia':
            this.baseCVForm.patchValue({ availability: availabilityFromDatabase });
            break;
        case '1 miesiąc okresu wypowiedzenia':
            this.baseCVForm.patchValue({ availability: availabilityFromDatabase });
            break;
        case '3 miesiące okresu wypowiedzenia':
          this.baseCVForm.patchValue({ availability: availabilityFromDatabase });
          break;
        default: 
        this.selectAvailability = true;
        this.baseCVForm.patchValue({ 
          availability: 'Wybierz datę...',
          availabilityDate: availabilityFromDatabase
        });        
      };
      
        // UMIEJĘTNOŚCI
      if (CVData.data.baseCVData.skills.drivingLicence.checked) {
        this.drivingLicenceChecked = true;
        this.baseCVForm.patchValue({ drivingLicenceDescription: CVData.data.baseCVData.skills.drivingLicence.description });     
        this.baseCVForm.get("drivingLicenceDescription").enable();   
      } else {
        this.drivingLicenceChecked = false;
        this.baseCVForm.get("drivingLicenceDescription").disable();   
      };

      if (CVData.data.baseCVData.skills.knownPrograms.checked) {
        this.knownProgramsChecked = true;
        this.baseCVForm.patchValue({ knownProgramsDescription: CVData.data.baseCVData.skills.knownPrograms.description });     
        this.baseCVForm.get("knownProgramsDescription").enable();   
      } else {
        this.knownProgramsChecked = false;
        this.baseCVForm.get("knownProgramsDescription").disable();   
      };

      if (CVData.data.baseCVData.skills.programmingSkills.checked) {
        this.programmingSkillsChecked = true;
        this.baseCVForm.patchValue({ programmingSkillsDescription: CVData.data.baseCVData.skills.programmingSkills.description });     
        this.baseCVForm.get("programmingSkillsDescription").enable();   
      } else {
        this.programmingSkillsChecked = false;
        this.baseCVForm.get("programmingSkillsDescription").disable();   
      };

      if (CVData.data.baseCVData.skills.devicesUsage.checked) {
        this.devicesUsageChecked = true;
        this.baseCVForm.patchValue({ devicesUsageDescription: CVData.data.baseCVData.skills.devicesUsage.description });     
        this.baseCVForm.get("devicesUsageDescription").enable();   
      } else {
        this.devicesUsageChecked = false;
        this.baseCVForm.get("devicesUsageDescription").disable();   
      };

      if (CVData.data.baseCVData.skills.permissions.checked) {
        this.permissionsChecked = true;
        this.baseCVForm.patchValue({ permissionsDescription: CVData.data.baseCVData.skills.permissions.description });     
        this.baseCVForm.get("permissionsDescription").enable();   
      } else {
        this.permissionsChecked = false;
        this.baseCVForm.get("permissionsDescription").disable();   
      };

      if (CVData.data.baseCVData.skills.knownRegulations.checked) {
        this.knownRegulationsChecked = true;
        this.baseCVForm.patchValue({ knownRegulationsDescription: CVData.data.baseCVData.skills.knownRegulations.description });     
        this.baseCVForm.get("knownRegulationsDescription").enable();   
      } else {
        this.knownRegulationsChecked = false;
        this.baseCVForm.get("knownRegulationsDescription").disable();   
      };

      if (CVData.data.baseCVData.skills.otherSkills.checked) {
        this.otherSkillsChecked = true;
        this.baseCVForm.patchValue({ otherSkillsDescription: CVData.data.baseCVData.skills.otherSkills.description });     
        this.baseCVForm.get("otherSkillsDescription").enable();   
      } else {
        this.otherSkillsChecked = false;
        this.baseCVForm.get("otherSkillsDescription").disable();   
      };


        // JĘZYKI
      languagesFromDatabase = CVData.data.baseCVData.languages;
      // console.log(languagesFromDatabase);                
      if (languagesFromDatabase.length > 0) {       
        ((<FormArray>this.baseCVForm.get('languages')).controls[0].get('languageName').patchValue(languagesFromDatabase[0][0].languageName));
        ((<FormArray>this.baseCVForm.get('languages')).controls[0].get('languageName').markAsDirty());

        if ((<FormArray>this.baseCVForm.get('languages')).controls[0].get('languageName').dirty) {
          (<FormArray>this.baseCVForm.get('languages')).controls[0].get('level').enable();
        } else {
          (<FormArray>this.baseCVForm.get('languages')).controls[0].get('level').reset();
          (<FormArray>this.baseCVForm.get('languages')).controls[0].get('level').disable();
        } 

        (<FormArray>this.baseCVForm.get('languages')).controls[0].get('level').patchValue(languagesFromDatabase[0][0].languageLevel);     
        this.selectedLanguageDegree[0] = languagesFromDatabase[0][0].languageDescription;  
      }

      for (let l = 1; l < languagesFromDatabase.length; l++) {  // Jeśli w bazowym CV jest więcej języków niż 1
        
        if ((<FormArray>this.baseCVForm.get('languages')).length < languagesFromDatabase.length  ) {
          this.addLanguagesButtonClick();
        };        

        ((<FormArray>this.baseCVForm.get('languages')).controls[l].get('languageName').patchValue(languagesFromDatabase[l][0].languageName));
        ((<FormArray>this.baseCVForm.get('languages')).controls[l].get('languageName').markAsDirty());

        if ((<FormArray>this.baseCVForm.get('languages')).controls[l].get('languageName').dirty) {
          (<FormArray>this.baseCVForm.get('languages')).controls[l].get('level').enable();
        } else {
          (<FormArray>this.baseCVForm.get('languages')).controls[l].get('level').reset();
          (<FormArray>this.baseCVForm.get('languages')).controls[l].get('level').disable();
        } 

        (<FormArray>this.baseCVForm.get('languages')).controls[l].get('level').patchValue(languagesFromDatabase[l][0].languageLevel);
        this.selectedLanguageDegree[l] = languagesFromDatabase[l][0].languageDescription;  
      };


        // MOCNE STRONY
      advantagesIndexFromDatabase = CVData.data.baseCVData.selectedAdvantagesIndex;
      // console.log(advantagesIndexFromDatabase);
      // console.log(this.advantagesArray.controls);
      advantagesIndexFromDatabase.forEach((advantage, i) => {              
        // console.log(this.advantagesArray.controls[i].patchValue(advantage));
        this.advantagesArray.controls[i].patchValue(advantage);        
      });      

      this.selectedAdvantagesValues = CVData.data.baseCVData.advantages;
      this.advantagesLeft = (7 - this.selectedAdvantagesValues.length);
      if (this.advantagesLeft < 0) {
        this.advantagesLeft = 0;
      };
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
        };  

      if (this.advantagesLeft == 0) {
        // console.log(this.advantagesArray.controls);
        this.advantagesArray.controls.forEach((selected, i) => {
          if (selected.value == false) {
            console.log("Not selected!");
            this.advantagesArray.controls[i].disable();
          } else {
          console.log("Selected!");
          }
        });
      };

        // ZATRUDNIENIE
      experienceFromDatabase = CVData.data.baseCVData.experience;
      console.log(experienceFromDatabase);                
      if (experienceFromDatabase.length > 0) { 

      //   // const dateOptions = {
      //   //   day: undefined,
      //   //   month: 'long',
      //   //   year: 'numeric'
      //   // };      

      let occupationDataFromDatabase: any[] = new Array();        
      let responsibilitiesFromDatabase: any[] = new Array();
      let responsibilitiesArrayToFill: any[] = new Array();

      occupationDataFromDatabase[0] = experienceFromDatabase[0][0].occupationData;
      console.log("OccupFromDB0: ");
      console.dir(occupationDataFromDatabase[0]);

      ((<FormArray>this.baseCVForm.get('experience')).controls[0].get('employerName').setValue(experienceFromDatabase[0][0].employerName));
      ((<FormArray>this.baseCVForm.get('experience')).controls[0].get('trade').setValue(experienceFromDatabase[0][0].trade));

      for (let o = 0; o < occupationDataFromDatabase[0].length; o++) {
        
          if ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[0].get('occupationArray')).length < occupationDataFromDatabase[0].length) {                                
            this.addOccupationButtonClick(0, 0)
          }

          ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[0].get('occupationArray')).controls[o].get('occupation').patchValue(occupationDataFromDatabase[0][o][0].occupation));

          if (occupationDataFromDatabase[0][o][0].workFinish != "obecnie") {          

          ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[0].get('occupationArray')).controls[o].get('workPeriodStart').patchValue(occupationDataFromDatabase[0][o][0].workStart));
          this.workStartDateFormatted[0][o] = occupationDataFromDatabase[0][o][0].workStart;  
          ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[0].get('occupationArray')).controls[o].get('workPeriodEnd').patchValue(occupationDataFromDatabase[0][o][0].workFinish));
          this.workFinishDateFormatted[0][o] = occupationDataFromDatabase[0][o][0].workFinish;          
        } else {
          ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[0].get('occupationArray')).controls[o].get('workPeriodStart').patchValue(occupationDataFromDatabase[0][o][0].workStart));
          this.workStartDateFormatted[0][o] = occupationDataFromDatabase[0][o][0].workStart;   
          this.experienceTillNowSelected[0][o] = true;             
          this.getOccupationControls(0,o).get('experienceTillNow').patchValue(this.experienceTillNowSelected[0][o]);       
        };

          responsibilitiesFromDatabase[o] = occupationDataFromDatabase[0][o][0].responsibilities;          
          responsibilitiesArrayToFill[o] = ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[0].get('occupationArray')).controls[o].get('responsibilities') as FormArray);
          

          if (responsibilitiesFromDatabase[o].length > 0) {
            responsibilitiesArrayToFill[o].controls[0].get('responsibility').setValue(responsibilitiesFromDatabase[o][0]);          
            for (let r = 1; r < responsibilitiesFromDatabase[o].length; r++) {
            if (responsibilitiesArrayToFill[o].length < responsibilitiesFromDatabase[o].length) {
              this.addNewResponsibility(0, o);
            };            
            responsibilitiesArrayToFill[o].controls[r].get('responsibility').setValue(responsibilitiesFromDatabase[o][r]);
          };         
        };

        // this.addOccupationButtonClick(0, 0);

      }; // koniec pętli occupationFromDatabase[0]               

        // this.workPeriodEndDateIssue[0] = false;
        // this.workPeriodCurrentDateIssue[0] = false;
        (<FormArray>this.baseCVForm.get('experience')).controls[0].get('employerName').markAsDirty();             
        // this.experienceCompleted[0] = true;        

        for (let e = 1; e < experienceFromDatabase.length; e++) {

          this.experienceCompleted[e-1] = true;    
          
          if ((<FormArray>this.baseCVForm.get('experience')).length < experienceFromDatabase.length) {
            (<FormArray>this.baseCVForm.get('experience')).push(this.addExperienceFormGroup());
          }          

          occupationDataFromDatabase[e] = experienceFromDatabase[e][0].occupationData;          

          ((<FormArray>this.baseCVForm.get('experience')).controls[e].get('employerName').setValue(experienceFromDatabase[e][0].employerName));
          ((<FormArray>this.baseCVForm.get('experience')).controls[e].get('trade').setValue(experienceFromDatabase[e][0].trade));

          for (let o = 0; o < occupationDataFromDatabase[e].length; o++) { 

            this.hideNextOccupButton[e][o-1] = true;

            if ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[e].get('occupationArray')).length < occupationDataFromDatabase[e].length) {                                
              this.addOccupationButtonClick(e, 0)
            };

            ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[e].get('occupationArray')).controls[o].get('occupation').patchValue(occupationDataFromDatabase[e][o][0].occupation));
  
            if (occupationDataFromDatabase[e][o][0].workFinish != "obecnie") {          
  
            ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[e].get('occupationArray')).controls[o].get('workPeriodStart').patchValue(occupationDataFromDatabase[e][o][0].workStart));
            this.workStartDateFormatted[e][o] = occupationDataFromDatabase[e][o][0].workStart;  
            ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[e].get('occupationArray')).controls[o].get('workPeriodEnd').patchValue(occupationDataFromDatabase[e][o][0].workFinish));
            this.workFinishDateFormatted[e][o] = occupationDataFromDatabase[e][o][0].workFinish;          
          } else {
            ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[e].get('occupationArray')).controls[o].get('workPeriodStart').patchValue(occupationDataFromDatabase[e][o][0].workStart));
            this.workStartDateFormatted[e][o] = occupationDataFromDatabase[e][o][0].workStart;   
            this.experienceTillNowSelected[e][o] = true;             
            this.getOccupationControls(e,o).get('experienceTillNow').patchValue(this.experienceTillNowSelected[e][o]);       
          };
  
            responsibilitiesFromDatabase[o] = occupationDataFromDatabase[e][o][0].responsibilities;            
            responsibilitiesArrayToFill[o] = ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[e].get('occupationArray')).controls[o].get('responsibilities') as FormArray);
              
            if (responsibilitiesFromDatabase[o].length > 0) {
              responsibilitiesArrayToFill[o].controls[0].get('responsibility').setValue(responsibilitiesFromDatabase[o][0]);          
              for (let r = 1; r < responsibilitiesFromDatabase[o].length; r++) {
              if (responsibilitiesArrayToFill[o].length < responsibilitiesFromDatabase[o].length) {
                this.addNewResponsibility(e, o);
              }              
              responsibilitiesArrayToFill[o].controls[r].get('responsibility').setValue(responsibilitiesFromDatabase[o][r]);
            };         
          };
  
          // this.addOccupationButtonClick(e, 0);
          this.getOccupationControls(e, o).get('workPeriodStart').markAsDirty();
          this.hideNextOccupButton[e][o] = false;
  
        };
          //   this.workPeriodEndDateIssue[e] = false;
          //   this.workPeriodCurrentDateIssue[e] = false;

          (<FormArray>this.baseCVForm.get('experience')).controls[e].get('employerName').markAsDirty();  
          this.hideNextExpButton = false;
       }                      
      }; // koniec doświadczenia zawodowego

        // EDUKACJA
        educationFromDatabase = CVData.data.baseCVData.education;
        console.log(educationFromDatabase);                
        if (educationFromDatabase.length > 0) { 
        
          if (educationFromDatabase[0][0].educationFinish != "obecnie") {            
  
            ((<FormArray>this.baseCVForm.get('education')).controls[0].get('educationPeriodStart').patchValue(educationFromDatabase[0][0].educationStart));
            this.educationStartDateFormatted[0] = educationFromDatabase[0][0].educationStart;  
            ((<FormArray>this.baseCVForm.get('education')).controls[0].get('educationPeriodEnd').patchValue(educationFromDatabase[0][0].educationFinish));
            this.educationFinishDateFormatted[0] = educationFromDatabase[0][0].educationFinish;          
          } else {
            ((<FormArray>this.baseCVForm.get('education')).controls[0].get('educationPeriodStart').patchValue(educationFromDatabase[0][0].educationStart));
            this.educationStartDateFormatted[0] = educationFromDatabase[0][0].educationStart;   
            this.educationTillNowSelected[0] = true;           
            this.getEducationControls(0).get('educationTillNow').patchValue(this.educationTillNowSelected[0]);
            this.setEducationTillNow(0);  
          };   

          this.schoolTypeSelected[0] = educationFromDatabase[0][0].schoolTypeIndex;          

          ((<FormArray>this.baseCVForm.get('education')).controls[0].get('schoolType').patchValue(this.schoolTypeSelected[0]));
          ((<FormArray>this.baseCVForm.get('education')).controls[0].get('schoolName').patchValue(educationFromDatabase[0][0].schoolName));
          ((<FormArray>this.baseCVForm.get('education')).controls[0].get('specialization').patchValue(educationFromDatabase[0][0].schoolProfile));
          ((<FormArray>this.baseCVForm.get('education')).controls[0].get('classProfile').patchValue(educationFromDatabase[0][0].schoolProfile));
          ((<FormArray>this.baseCVForm.get('education')).controls[0].get('educationMode').patchValue(educationFromDatabase[0][0].schoolMode));   
          
          this.educationEndDateIssue[0] = false;
          this.educationCurrentDateIssue[0] = false;
          (<FormArray>this.baseCVForm.get('education')).controls[0].get('educationPeriodStart').markAsDirty();  
          
          for (let e = 1; e < educationFromDatabase.length; e++) {

            this.educationCompleted[e-1] = true;

            if ((<FormArray>this.baseCVForm.get('education')).length < educationFromDatabase.length) {
              (<FormArray>this.baseCVForm.get('education')).push(this.addEducationFormGroup()); 
            };                                 
  
          if (educationFromDatabase[e][0].educationFinish !== "obecnie") {
            ((<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart').patchValue(educationFromDatabase[e][0].educationStart));
            this.educationStartDateFormatted[e] = educationFromDatabase[e][0].educationStart;  
            ((<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodEnd').patchValue(educationFromDatabase[e][0].educationFinish));
            this.educationFinishDateFormatted[e] = educationFromDatabase[e][0].educationFinish;   
          } else {
            ((<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart').patchValue(educationFromDatabase[e][0].educationStart));
            this.educationStartDateFormatted[e] = educationFromDatabase[e][0].educationStart;   
            this.educationTillNowSelected[e] = true;    
            this.getEducationControls(e).get('educationTillNow').patchValue(this.educationTillNowSelected[e]);   
            this.setEducationTillNow(e);  
          };
  
          this.schoolTypeSelected[e] = educationFromDatabase[e][0].schoolTypeIndex;
          console.log("sch2: " + this.schoolTypeSelected[e]);

          ((<FormArray>this.baseCVForm.get('education')).controls[e].get('schoolType').patchValue(this.schoolTypeSelected[e]));
          ((<FormArray>this.baseCVForm.get('education')).controls[e].get('schoolName').patchValue(educationFromDatabase[e][0].schoolName));
          ((<FormArray>this.baseCVForm.get('education')).controls[e].get('specialization').patchValue(educationFromDatabase[e][0].schoolProfile));
          ((<FormArray>this.baseCVForm.get('education')).controls[e].get('classProfile').patchValue(educationFromDatabase[e][0].schoolProfile));
          ((<FormArray>this.baseCVForm.get('education')).controls[e].get('educationMode').patchValue(educationFromDatabase[e][0].schoolMode));   
          
          this.educationEndDateIssue[e] = false;
          this.educationCurrentDateIssue[e] = false;
          (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart').markAsDirty(); 
  
          };

          console.log("SchoolTypeSelected: " + this.schoolTypeSelected);
        
        }; // koniec edukacji

          // KURSY
          coursesFromDatabase = CVData.data.baseCVData.courses;
          console.log(coursesFromDatabase);                
          if (coursesFromDatabase.length > 0) { 
          
            if (coursesFromDatabase[0][0].courseFinish != "obecnie") {
  
              console.log("*** PO WEJŚCIU W PĘTLĘ ***");
              console.log(coursesFromDatabase[0][0].courseStart);
              console.log(coursesFromDatabase[0][0].courseFinish);
              console.log(this.courseStartDateFormatted);
              console.log("*** ********** ***");
    
              ((<FormArray>this.baseCVForm.get('courses')).controls[0].get('coursePeriodStart').patchValue(coursesFromDatabase[0][0].courseStart));
              this.courseStartDateFormatted[0] = coursesFromDatabase[0][0].courseStart;  
              ((<FormArray>this.baseCVForm.get('courses')).controls[0].get('coursePeriodEnd').patchValue(coursesFromDatabase[0][0].courseFinish));
              this.courseFinishDateFormatted[0] = coursesFromDatabase[0][0].courseFinish;          
            } else {
              ((<FormArray>this.baseCVForm.get('courses')).controls[0].get('coursePeriodStart').patchValue(coursesFromDatabase[0][0].courseStart));
              this.courseStartDateFormatted[0] = coursesFromDatabase[0][0].courseStart;   
              this.courseTillNowSelected[0] = true; 
              this.setCourseTillNow(0);          
            };               
  
            ((<FormArray>this.baseCVForm.get('courses')).controls[0].get('courseName').patchValue(coursesFromDatabase[0][0].courseName));
            ((<FormArray>this.baseCVForm.get('courses')).controls[0].get('courseSubject').patchValue(coursesFromDatabase[0][0].courseSubject));               
            
            this.coursesEndDateIssue[0] = false;
            this.coursesCurrentDateIssue[0] = false;
            (<FormArray>this.baseCVForm.get('courses')).controls[0].get('coursePeriodStart').markAsDirty();  
            
            for (let c = 1; c < coursesFromDatabase.length; c++) {
  
              this.coursesCompleted[c-1] = true;
  
              console.log("jestem w drugiej pętli courses!");
              console.log("courseStartDateFormatted[1]: " + this.courseStartDateFormatted[1]);
    
              (<FormArray>this.baseCVForm.get('courses')).push(this.addCoursesFormGroup());                      
    
            if (coursesFromDatabase[c][0].courseFinish !== "obecnie") {
              ((<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart').patchValue(coursesFromDatabase[c][0].courseStart));
              this.courseStartDateFormatted[c] = coursesFromDatabase[c][0].courseStart;  
              ((<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodEnd').patchValue(coursesFromDatabase[c][0].courseFinish));
              this.courseFinishDateFormatted[c] = coursesFromDatabase[c][0].courseFinish;  
            } else {
              ((<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart').patchValue(coursesFromDatabase[c][0].courseStart));
              this.courseStartDateFormatted[c] = coursesFromDatabase[c][0].courseStart;   
              this.courseTillNowSelected[c] = true; 
              this.setCourseTillNow(c);           
            };              
  
            ((<FormArray>this.baseCVForm.get('courses')).controls[c].get('courseName').patchValue(coursesFromDatabase[c][0].courseName));
            ((<FormArray>this.baseCVForm.get('courses')).controls[c].get('courseSubject').patchValue(coursesFromDatabase[c][0].courseSubject));    
            
            this.coursesEndDateIssue[c] = false;
            this.coursesCurrentDateIssue[c] = false;
            (<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart').markAsDirty(); 
    
            };
          
          }; // koniec kursów


    },
    (error) => {
      console.log(error);
    });
  };

  //********************  GENEROWANIE CV DO PDF  ********************************/

  // public async generatePDF(uploadedPhoto, icon1, icon2, icon3, icon4, icon5, icon6, icon7, icon8, icon9, icon10, calendar: HTMLElement): Promise<void> {

  //   this.checkFormValidity();

  //   if (this.formValid) {

  //     this.isLoading = true;
  //     console.log(this.screenInnerWidth);
  //     console.log(uploadedPhoto.clientWidth);
  //     console.log(uploadedPhoto.clientHeight);

  //     let userPhotoWidth = uploadedPhoto.clientWidth;
  //     let userPhotoHeight = uploadedPhoto.clientHeight;

  //     if (this.screenInnerWidth < 1980 && this.screenInnerWidth >= 1800) {
  //       userPhotoWidth = userPhotoWidth * 0.95; 
  //     } else if (this.screenInnerWidth < 1800 && this.screenInnerWidth >= 1500) {
  //       userPhotoWidth = userPhotoWidth * 1.25; 
  //     } else if (this.screenInnerWidth < 1500 && this.screenInnerWidth >= 1450) {
  //       userPhotoWidth = userPhotoWidth * 1.4;
  //     } else if (this.screenInnerWidth < 1450 && this.screenInnerWidth >= 1400) {
  //       userPhotoWidth = userPhotoWidth * 1.5;
  //     } else if (this.screenInnerWidth < 1400 && this.screenInnerWidth >= 1280) {
  //       userPhotoWidth = userPhotoWidth * 1.55;
  //     } else if (this.screenInnerWidth < 1280 && this.screenInnerWidth >= 1160) {
  //       userPhotoWidth = userPhotoWidth * 1.3; 
  //     } else if (this.screenInnerWidth < 1160 && this.screenInnerWidth >= 1100) {
  //       userPhotoWidth = userPhotoWidth * 1.35; 
  //     } else if (this.screenInnerWidth < 1100 && this.screenInnerWidth >= 992) {
  //       userPhotoWidth = userPhotoWidth * 1.55; 
  //     } else if (this.screenInnerWidth < 992 && this.screenInnerWidth >= 900) { 
  //       userPhotoWidth = userPhotoWidth * 0.7; 
  //     } else if (this.screenInnerWidth < 900 && this.screenInnerWidth >= 850) { 
  //       userPhotoWidth = userPhotoWidth * 0.75; 
  //     } else if (this.screenInnerWidth < 850 && this.screenInnerWidth >= 769) { 
  //       userPhotoWidth = userPhotoWidth * 0.8; 
  //     } else if (this.screenInnerWidth < 769 && this.screenInnerWidth >= 720) { 
  //       userPhotoWidth = userPhotoWidth * 0.4; 
  //     } else if (this.screenInnerWidth < 720 && this.screenInnerWidth >= 630) {
  //       userPhotoWidth = userPhotoWidth * 0.45; 
  //     } else if (this.screenInnerWidth < 630 && this.screenInnerWidth >= 580) { 
  //       userPhotoWidth = userPhotoWidth * 0.5; 
  //     } else if (this.screenInnerWidth < 580 && this.screenInnerWidth >= 558) {
  //       userPhotoWidth = userPhotoWidth * 0.6; 
  //     } else if (this.screenInnerWidth < 558 && this.screenInnerWidth >= 500) {
  //       userPhotoWidth = userPhotoWidth * 0.9; 
  //     } else if (this.screenInnerWidth < 500 && this.screenInnerWidth >= 480) {
  //       userPhotoWidth = userPhotoWidth * 1.0; 
  //     } else if (this.screenInnerWidth < 480 && this.screenInnerWidth >= 420) {
  //       userPhotoWidth = userPhotoWidth * 1.2; 
  //     } else if (this.screenInnerWidth < 420 && this.screenInnerWidth >= 400) {
  //       userPhotoWidth = userPhotoWidth * 0.8; 
  //     } else if (this.screenInnerWidth < 400 && this.screenInnerWidth >= 360) {
  //       userPhotoWidth = userPhotoWidth * 0.9; 
  //     } else if (this.screenInnerWidth < 360 && this.screenInnerWidth >= 300) {
  //       userPhotoWidth = userPhotoWidth * 1.0; 
  //     } 
      
  //     const userPhoto = await domtoimage.toPng(uploadedPhoto, {width: userPhotoWidth, height: userPhotoHeight, cachebust: true});
  //     const headerIcon1 = await domtoimage.toPng(icon1, {width: icon1.clientWidth, height: icon1.clientHeight});
  //     const headerIcon2 = await domtoimage.toPng(icon2, {width: icon2.clientWidth, height: icon2.clientHeight});
  //     const headerIcon3 = await domtoimage.toPng(icon3, {width: icon3.clientWidth, height: icon3.clientHeight});
  //     const headerIcon4 = await domtoimage.toPng(icon4, {width: icon4.clientWidth, height: icon4.clientHeight});
  //     const headerIcon5 = await domtoimage.toPng(icon5, {width: icon5.clientWidth, height: icon5.clientHeight});
  //     const headerIcon6 = await domtoimage.toPng(icon6, {width: icon6.clientWidth, height: icon6.clientHeight});
  //     const headerIcon7 = await domtoimage.toPng(icon7, {width: icon7.clientWidth, height: icon7.clientHeight});
  //     const headerIcon8 = await domtoimage.toPng(icon8, {width: icon8.clientWidth, height: icon8.clientHeight});
  //     const headerIcon9 = await domtoimage.toPng(icon9, {width: icon9.clientWidth, height: icon9.clientHeight});
  //     const headerIcon10 = await domtoimage.toPng(icon10, {width: icon10.clientWidth, height: icon10.clientHeight});
  //     const calendarIcon = await domtoimage.toPng(calendar, {width: calendar.clientWidth, height: calendar.clientHeight});

  //     const dateOptions = {
  //       day: undefined,
  //       month: 'long',
  //       year: 'numeric'
  //     };

  //     // renderowane ikony i zdjęcie
  //     this.PDF.userPhoto = userPhoto;
  //     this.PDF.calendarIcon = calendarIcon;
  //     this.PDF.conditionsHeaderIcon = headerIcon1;
  //     this.PDF.personalDataHeaderIcon = headerIcon2;
  //     this.PDF.experienceHeaderIcon = headerIcon3;
  //     this.PDF.educationHeaderIcon = headerIcon4;
  //     this.PDF.coursesHeaderIcon = headerIcon5;
  //     this.PDF.languagesHeaderIcon = headerIcon6;
  //     this.PDF.skillsHeaderIcon = headerIcon7;
  //     this.PDF.advantagesHeaderIcon = headerIcon8;
  //     this.PDF.hobbiesHeaderIcon = headerIcon9;
  //     this.PDF.requirementsHeaderIcon = headerIcon10;

  //     // WARUNKI ZATRUDNIENIA
  //     this.PDF.position = this.baseCVForm.get('position').value;
  //     this.PDF.location = this.baseCVForm.get('location').value;

  //     if (!this.selectAvailability) {
  //       this.PDF.availability = this.baseCVForm.get('availability').value;
  //     } else {
  //       this.PDF.availability = (new Date(this.baseCVForm.get('availabilityDate').value).toLocaleDateString('pl') + ' r.');
  //     };

  //     this.PDF.disposition = this.baseCVForm.get('disposition').value;

  //     if (this.baseCVForm.get('employment').value != '') {
  //       console.dir(this.baseCVForm.get('employment').value);              
  //       this.PDF.employment = (this.baseCVForm.get('employment').value).map(emp => {
  //         return emp.value;
  //       }).join(', ');        
  //     } else {
  //       this.PDF.employment = '';
  //     };

  //     this.PDF.salary = this.baseCVForm.get('salary').value;

  //     // DANE OSOBOWE
  //     this.PDF.name = this.baseCVForm.get('name').value.toUpperCase();
  //     this.PDF.surname = this.baseCVForm.get('surname').value.toUpperCase();
  //     this.PDF.email = this.baseCVForm.get('email').value;
  //     this.PDF.phone = this.baseCVForm.get('phone').value;

  //     // // DOŚWIADCZENIE ZAWODOWE
  //     // this.PDF.totalExperienceLength = (<FormArray>this.baseCVForm.get('experience')).length;

  //     // for (let i = 0; i < (<FormArray>this.baseCVForm.get('experience')).length; i++) {

  //     //   if ( (<FormArray>this.baseCVForm.get('experience')).controls[i].get('employerName').value !== '' ) {

  //     //     if ( (<FormArray>this.baseCVForm.get('experience')).controls[i].get('experienceTillNow').value ) {

  //     //       this.PDF.startWork[i] = new Date((<FormArray>this.baseCVForm.get('experience')).controls[i].get('workPeriodStart').value).toLocaleDateString('pl', dateOptions);
  //     //       this.PDF.finishWork[i] = 'obecnie';

  //     //     } else {

  //     //       this.PDF.startWork[i] = new Date((<FormArray>this.baseCVForm.get('experience')).controls[i].get('workPeriodStart').value).toLocaleDateString('pl', dateOptions);
  //     //       this.PDF.finishWork[i] = new Date((<FormArray>this.baseCVForm.get('experience')).controls[i].get('workPeriodEnd').value).toLocaleDateString('pl', dateOptions);

  //     //       };

  //     //       this.PDF.employer[i] = (<FormArray>this.baseCVForm.get('experience')).controls[i].get('employerName').value;
  //     //       this.PDF.trade[i] = (<FormArray>this.baseCVForm.get('experience')).controls[i].get('trade').value;
  //     //       this.PDF.occupation[i] = (<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupation').value;

  //     //       let responsibilitiesArray = ((<FormArray>this.baseCVForm.get('experience')).controls[i].get('responsibilities') as FormArray);
  //     //       let chosenResponsibilities = [];

  //     //       for (let j = 0; j < responsibilitiesArray.length; j++) {
  //     //         chosenResponsibilities.push(responsibilitiesArray.controls[j].get('responsibility').value);
  //     //         this.PDF.responsibilities[i] = chosenResponsibilities;
  //     //       };

  //     //   };
  //     // };


  //     // DOŚWIADCZENIE ZAWODOWE
  //   this.PDF.totalExperienceLength = (<FormArray>this.baseCVForm.get('experience')).length;

  //   let startWork = new Array();
  //   let finishWork = new Array()
  //   let occupation = new Array();
  //   let responsibilities = new Array();

  //   for (let i = 0; i < (<FormArray>this.baseCVForm.get('experience')).length; i++) {

  //     let occupationArray: any[] = new Array();

  //     if ( (<FormArray>this.baseCVForm.get('experience')).controls[i].get('employerName').value !== '' ) {

  //       this.PDF.employer[i] = (<FormArray>this.baseCVForm.get('experience')).controls[i].get('employerName').value;
  //       this.PDF.trade[i] = (<FormArray>this.baseCVForm.get('experience')).controls[i].get('trade').value;

  //       for (let o = 0; o < (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).length; o++) {         

  //         if ( (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('experienceTillNow').value ) {

  //           if (this.workStartDateManuallyChanged[i][o] == true) {

  //             startWork[o] = new Date((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart').value).toLocaleDateString('pl', dateOptions);
                            
  //           } else {
  //             startWork[o] = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart').value;
  //           };          
            
  //           finishWork[o] = 'obecnie';
  
  //         } else {
            
  //           if (this.workStartDateManuallyChanged[i][o] == true) {
  //             startWork[o] = new Date((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart').value).toLocaleDateString('pl', dateOptions); 
  //           } else {
  //             startWork[o] = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart').value;
  //           };
            
  //           if (this.workFinishDateManuallyChanged[i][o] == true) {
  //             finishWork[o]  = new Date((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodEnd').value).toLocaleDateString('pl', dateOptions);
  //           } else {
  //             finishWork[o] = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodEnd').value;
  //           };          
  //         };

  //         occupation[o] = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('occupation').value;

  //         let responsibilitiesArray = ((<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('responsibilities') as FormArray);
  //         let chosenResponsibilities = [];

  //         for (let j = 0; j < responsibilitiesArray.length; j++) {
  //           chosenResponsibilities.push(responsibilitiesArray.controls[j].get('responsibility').value);
  //           responsibilities[o] = chosenResponsibilities;
  //         };      
          
  //         let occupationData: any[] = [
  //           {
  //             workStart: startWork[o],
  //             workFinish: finishWork[o],
  //             occupation: occupation[o],
  //             responsibilities: responsibilities[o]
  //           }
  //         ]; 

  //         occupationArray.push(occupationData);          

  //       };  // Koniec pętli occupation          

  //         this.PDF.occupationArray[i] = occupationArray;                                     

  //     };

  //     this.PDF.totalOccupationArrayLength[i] = (<FormArray>(<FormArray>this.baseCVForm.get('experience')).controls[i].get('occupationArray')).length;

  //   };



  //     // EDUKACJA
  //     this.PDF.totalEducationLength = (<FormArray>this.baseCVForm.get('education')).length;

  //     for (let e = 0; e < (<FormArray>this.baseCVForm.get('education')).length; e++) {

  //       if ((<FormArray>this.baseCVForm.get('education')).controls[e].get('schoolName').value !== '') {

  //         if ( (<FormArray>this.baseCVForm.get('education')).controls[e].get('educationTillNow').value ) {
  //           this.PDF.startEducation[e] = new Date((<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart').value).toLocaleDateString('pl', dateOptions);
  //           this.PDF.finishEducation[e] = 'obecnie';
  //         } else {
  //           this.PDF.startEducation[e] = new Date((<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodStart').value).toLocaleDateString('pl', dateOptions);
  //           this.PDF.finishEducation[e] = new Date((<FormArray>this.baseCVForm.get('education')).controls[e].get('educationPeriodEnd').value).toLocaleDateString('pl', dateOptions);
  //         };

  //         this.PDF.schoolName[e] = (<FormArray>this.baseCVForm.get('education')).controls[e].get('schoolName').value;
  //         this.PDF.schoolProfile[e] = (<FormArray>this.baseCVForm.get('education')).controls[e].get('specialization').value || (<FormArray>this.baseCVForm.get('education')).controls[e].get('classProfile').value;

  //       };
  //     };

  //     // KURSY
  //     this.PDF.totalCoursesLength = (<FormArray>this.baseCVForm.get('courses')).length;

  //     for (let c = 0; c < (<FormArray>this.baseCVForm.get('courses')).length; c++) {

  //       if ((<FormArray>this.baseCVForm.get('courses')).controls[c].get('courseName').value !== '') {

  //         if ( (<FormArray>this.baseCVForm.get('courses')).controls[c].get('courseTillNow').value ) {
  //           this.PDF.startCourse[c] = new Date((<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart').value).toLocaleDateString('pl', dateOptions);
  //           this.PDF.finishCourse[c] = 'obecnie';
  //         } else {
  //           this.PDF.startCourse[c] = new Date((<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodStart').value).toLocaleDateString('pl', dateOptions);
  //           this.PDF.finishCourse[c] = new Date((<FormArray>this.baseCVForm.get('courses')).controls[c].get('coursePeriodEnd').value).toLocaleDateString('pl', dateOptions);
  //         };

  //         this.PDF.courseName[c] = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('courseName').value;
  //         this.PDF.courseSubject[c] = (<FormArray>this.baseCVForm.get('courses')).controls[c].get('courseSubject').value;

  //       };
  //     };

  //     // JĘZYKI OBCE
  //     this.PDF.totalLanguagesLength = (<FormArray>this.baseCVForm.get('languages')).length;

  //     for (let l = 0; l < (<FormArray>this.baseCVForm.get('languages')).length; l++) {

  //       if ((<FormArray>this.baseCVForm.get('languages')).controls[l].get('languageName').value !== '') {

  //         if ((<FormArray>this.baseCVForm.get('languages')).controls[l].get('otherLanguage').value !== '') {
  //           this.PDF.languageName[l] = ((<FormArray>this.baseCVForm.get('languages')).controls[l].get('otherLanguage').value);
  //         } else {
  //           this.PDF.languageName[l] = ((<FormArray>this.baseCVForm.get('languages')).controls[l].get('languageName').value);
  //         }

  //         this.PDF.languageLevel[l] = ('(' + (<FormArray>this.baseCVForm.get('languages')).controls[l].get('level').value + ')');
  //         this.PDF.languageDescription[l] = this.selectedLanguageDegree[l];

  //       };
  //     };


  //     // UMIEJĘTNOŚCI
  //     if (this.baseCVForm.get('drivingLicenceDescription').value) {
  //       this.PDF.drivingLicence = this.baseCVForm.get('drivingLicenceDescription').value;
  //     };
  //     if (this.baseCVForm.get('knownProgramsDescription').value) {
  //       this.PDF.computerPrograms = this.baseCVForm.get('knownProgramsDescription').value;
  //     };
  //     if (this.baseCVForm.get('programmingSkillsDescription').value) {
  //       this.PDF.programmingLanguages = this.baseCVForm.get('programmingSkillsDescription').value;
  //     };
  //     if (this.baseCVForm.get('devicesUsageDescription').value) {
  //       this.PDF.devices = this.baseCVForm.get('devicesUsageDescription').value;
  //     };
  //     if (this.baseCVForm.get('permissionsDescription').value) {
  //       this.PDF.permissions = this.baseCVForm.get('permissionsDescription').value;
  //     };
  //     if (this.baseCVForm.get('knownRegulationsDescription').value) {
  //       this.PDF.regulations = this.baseCVForm.get('knownRegulationsDescription').value;
  //     };
  //     if (this.baseCVForm.get('otherSkillsDescription').value) {
  //       this.PDF.otherSkills = this.baseCVForm.get('otherSkillsDescription').value;
  //     };

  //     // MOCNE STRONY
  //     this.PDF.advantages = this.selectedAdvantagesValues;

  //     // ZAINTERESOWANIA
  //     this.PDF.hobbies = this.baseCVForm.get('hobbies').value;

  //     // WYMAGANIA REKRUTACYJNE
  //     for (let r = 0; r < this.requirementsListLength; r++ ) {
  //       if ((<FormArray>this.baseCVForm.get('requirements')).controls[r].get('requirement').value === '') {
  //         (<FormArray>this.baseCVForm.get('requirements')).controls[r].get('answer').patchValue('');
  //       };
  //       if ((<FormArray>this.baseCVForm.get('requirements')).controls[r].get('requirement').value !='') {
  //         this.PDF.requirements[r] = (<FormArray>this.baseCVForm.get('requirements')).controls[r].get('requirement').value;
  //         this.PDF.answers[r] = (<FormArray>this.baseCVForm.get('requirements')).controls[r].get('answer').value;
  //       };
  //     };

  //     // KLAUZULA
  //     this.PDF.clause = this.baseCVForm.get('clause').value;

  //     setTimeout(() => this.PDF.generatePDF(), 300);
  //     this.isLoading = false;
  //   } else {
  //     this.openErrorsDialog();
  //   }

  // } 

}
