import { Component, OnInit, ElementRef, HostListener, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CreatePdfService } from '../../../../assets/services/create-pdf.service';
import { FormGroup, Validators, FormArray, FormBuilder, NG_ASYNC_VALIDATORS, Form } from '@angular/forms';
import { BsLocaleService, BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';
import { plLocale } from 'ngx-bootstrap/locale';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { HintMessageService } from '../../../../assets/services/hint-message.service';
import { fadeInTop } from '../../../../assets/animations/animations';
import { ListsViewerService } from '../../../../assets/services/list-viewer.service';
import domtoimage from 'dom-to-image';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { WarningDialogComponent } from '../../../../assets/components/warning-dialog/warning-dialog.component';
import { DialogService } from '../../../../assets/services/dialog.service';
import { CVDataService } from 'src/assets/services/cv-data.service';
import { mimeType } from 'src/assets/validators/mime-type.validator';
import { UserDataService } from '../../services/userData.service';
import { Router } from '@angular/router';
import { MessageDialogComponent } from 'src/assets/components/message-dialog/message-dialog.component';

defineLocale('pl', plLocale);

export interface DialogData {
  errors?: string[];
  warning?: string
}

@Component({
  selector: 'gorilla-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss'],
  animations: [fadeInTop()]
})

export class GeneratorComponent implements OnInit, AfterViewInit {

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
  DatePickerYearsOnly: Partial<BsDatepickerConfig>;

  uploadedImage: any; 
  imageClass: string = 'portrait'; 
  cvForm: FormGroup;
  employment: any[];
  availability: string[];
  languagesList: any[];
  languageLevels: any[];
  advantagesList: string[];
  schoolType: any[];
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
  minModeYear: BsDatepickerViewMode = 'year';
  workPeriodEndDateIssue: any[];
  workPeriodEndDateIssueMessage: any[];
  workPeriodCurrentDateIssue: any[];
  workPeriodCurrentDateIssueMessage: any[];
  educationEndDateIssue: boolean[];
  educationEndDateIssueMessage: string[];
  educationCurrentDateIssue: boolean[];
  educationCurrentDateIssueMessage: string[];  
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
  
  courseStartDateFormatted: any[] = new Array(30);  
  courseStartDateManuallyChanged: boolean[] = new Array(30);  

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
  addClause: boolean;
  errorHandler: boolean = false;
  experienceCompletionError: boolean = false;
  educationCompletionError: boolean = false;
  coursesCompletionError: boolean = false;
  hideNextExpButton: boolean = false;
  hideNextOccupButton: any[];
  hideNextEduButton: boolean = false;
  hideNextCourseButton: boolean = false;
  hideNextLanguagesButton: any[] = new Array();
  experienceEditionModeEnabled: boolean;
  educationEditionModeEnabled: boolean;
  coursesEditionModeEnabled: boolean;

  drivingLicenceChecked: boolean = false;
  knownProgramsChecked: boolean = false;
  programmingSkillsChecked: boolean = false;
  devicesUsageChecked: boolean = false;
  permissionsChecked: boolean = false;
  knownRegulationsChecked: boolean = false;
  otherSkillsChecked: boolean = false;

  jobStart: any = new Array();
  jobFinish: any = new Array();
  
  isLoading: boolean = false;
  hasBaseCV: boolean;
  loggedUser: any;
  retrieveBaseCVSubscription$: Subscription;
  populateFormSubscription$: Subscription;

  formValid: boolean = false;
  employmentSectionValid: boolean = false;
  personalDataSectionValid: boolean = false;
  educationSectionValid: boolean = false;
  languagesValid: boolean;
  languagesError: boolean[] = new Array();
  advantagesSectionValid: boolean = false;
  hobbySectionValid: boolean = false;
  uploadedImageValid: boolean = false; 
  baseURL: boolean;
  formErrors: string[] = new Array();

  requirementsListLength: number;
  experienceArrayLength: number;  
 
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
      this.DatePickerYearsOnly = Object.assign({}, {containerClass: 'theme-dark-blue', minMode: this.minModeYear, dateInputFormat: 'YYYY'});
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
    this.hideNextLanguagesButton[0] = false;

    this.languagesList = this.sharedLists.getLanguageList();
    this.advantagesList = this.sharedLists.getAdvantagesList();
    this.hoverMessages = this.hoverHints.setHintMessage();    

    this.localeService.use('pl');
    this.defaultClause = "Zgadzam się na przetwarzanie moich danych osobowych zawartych w zgłoszeniu rekrutacyjnym dla celów obecnej i przyszłych rekrutacji.";
    this.addClause = false;

    this.currentHint = '';        //treść "podpowiadałki"
    this.currentTopHint = '';
    this.sideHintTrigger = 0;
    this.currentHintPosition = 0;  //aktualna pozycja "podpowiadałki"
    this.hintOnFocus = false;
    this.focusOnResp = false;

    this.advantagesLeft = 6;
    this.advantagesError = false;
    this.polishAdvantageSuffix = '';   
    
    this.educationEndDateIssue = [];
    this.educationEndDateIssueMessage = [];
    this.educationCurrentDateIssue = [];
    this.educationCurrentDateIssueMessage = [];    
    this.coursesCurrentDateIssue = [];
    this.coursesCurrentDateIssueMessage = [];

    this.experienceCompleted = [];
    this.educationCompleted = [];
    this.coursesCompleted = [];    

    this.experienceEditionModeEnabled = false;
    this.educationEditionModeEnabled = false;
    this.coursesEditionModeEnabled = false;

    this.employment = this.sharedLists.getEmploymentList();
    this.availability = this.sharedLists.getAvailabilityList();
    this.schoolType = this.sharedLists.getSchoolTypes();
    this.studiesMode = this.sharedLists.getStudiesModes();
    this.languageLevels = this.sharedLists.getLanguageLevels();
    this.selectedLanguageDegree = [];

    this.cvForm = this.fb.group({                             // reaktywne tworzenie obiektu formularza cvForm
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      phone: ['', Validators.compose([Validators.pattern('^[0-9 ()+-]+$'), Validators.required])],
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
      addClause: [this.addClause],
      clause: [{value: this.defaultClause, disabled: true}]        
    });

    this.loggedUser = this.userDataService.getLoggedAs(); 
    this.userDataService.retrieveCV(this.loggedUser);
    this.retrieveBaseCVSubscription$ = this.userDataService.hasBaseCVUpdate.subscribe((result) => {
      this.hasBaseCV = result;  
      if (this.hasBaseCV) {
        if (this.cvForm.get("name").pristine) {
            console.log("Czy jest pristine: " + this.cvForm.get("name").pristine)
            this.populateCVForm();
        };       
      };    
    });

  }; // koniec onInit()

  ngAfterViewInit() {
    for (let i = 1; i < 3; i++) {
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
      employerName: ['', Validators.required],
      trade: [''],
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
      coursePeriodStart: ['', Validators.required]      
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
    let newRequirement = (<FormArray>this.cvForm.get('requirements'));
    newRequirement.push(this.addRequirementsFormGroup());
    this.requirementsListLength = (<FormArray>this.cvForm.get('requirements')).length;
  }

  public removeRequirement(r: number): void {
    let newRequirement = (<FormArray>this.cvForm.get('requirements'));
    newRequirement.removeAt(r);
    this.requirementsListLength = (<FormArray>this.cvForm.get('requirements')).length;
  }

  public addNewResponsibility(i: number, o: number): void {
    let newResponsibility = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('responsibilities') as FormArray;
    newResponsibility.push(this.addResponsibilitiesFormArray());
    this.focusOnResp = true;    
  }

  public removeResponsibility(i: number, o: number, x: number): void {
    let responsibilities = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('responsibilities') as FormArray;    
    responsibilities.removeAt(x);
    this.focusOnResp = true;    
  }

  public removeOccupation(i: number, o: number): void {
    let newOccupation = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray'));
    newOccupation.removeAt(newOccupation.length - 1);    
    this.hideNextOccupButton[i][o-1] = false;   
  };

  public addAdvantagesControls(): FormArray {   //tworzy i zapełnia tablicę cvForm.get("advantages")
    const advArr = this.advantagesList.map((element) => {
      return this.fb.control(false);
    });
    console.log(advArr);
    return this.fb.array(advArr);
  }  

  public calcPosition(event: Event) {   //oblicza odległość elementu od górnej krawędzi ekranu z uwzględnieniem wysokości banneru    
    let scrollDistance = Math.abs(this.creatorContainer.nativeElement.getBoundingClientRect().top - 64);        
    let totalScrollDistance = scrollDistance == 0 ? ((event.target as HTMLElement).getBoundingClientRect().top + Math.abs(this.creatorContainer.nativeElement.getBoundingClientRect().top) - 128) : (event.target as HTMLElement).getBoundingClientRect().top + Math.abs(this.creatorContainer.nativeElement.getBoundingClientRect().top);
    this.currentHintPosition = totalScrollDistance;  //rzutowanie even.target na HTML i obliczanie odległości od górnej krawędzi ekranu         
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

    const dateOptions = {
      day: undefined,
      month: 'long',
      year: 'numeric'
    };

    for (let o = 0; o < (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get("occupationArray")).controls.length; o++) {

      let startWork = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart');
      let finishWork = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodEnd');
      let nowWork = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodNow'); 
  
      if (this.workStartDateFormatted[i][o] == undefined || this.workStartDateFormatted[i][o] == 0) {
        this.workStartDateFormatted[i][o] = new Date(startWork.value).toLocaleDateString('pl', dateOptions);
      };

      if (this.workFinishDateFormatted[i][o] == undefined || this.workFinishDateFormatted[i][o] == 0) {
        this.workFinishDateFormatted[i][o] = new Date(finishWork.value).toLocaleDateString('pl', dateOptions);
      };

      // Obsługa błędów w kontrolkach formularza
      if ((!finishWork.value && !nowWork.value)) {
        (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].setErrors({'incorrect': true});
      };

      if ((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].invalid) {
        this.experienceCompletionError = true;
      } else {
        (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].setErrors(null);
        this.experienceCompletionError = false;
        this.experienceCompleted[i] = true;        
      }; 
    };   
    
    if (((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get("occupationArray")).controls.length > 1)) {
      this.jobStart[i] = this.workStartDateFormatted[i][(<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get("occupationArray")).controls.length - 1];
        if (this.getOccupationControls(i,0).get('experienceTillNow').value) {
          this.jobFinish[i] = 'obecnie';  
        } else {
          this.jobFinish[i] = this.workFinishDateFormatted[i][0];
        };           
    } else {
      this.jobStart[i] = this.workStartDateFormatted[i][0];
      this.jobFinish[i] = this.workFinishDateFormatted[i][0];
    };    

    if ((<FormArray>this.cvForm.get('experience')).controls[i].invalid) {
      this.experienceCompletionError = true;
    } else {
      (<FormArray>this.cvForm.get('experience')).controls[i].setErrors(null);
      this.experienceCompletionError = false;
      this.experienceCompleted[i] = true;
      (<FormArray>this.cvForm.get('experience')).push(this.addExperienceFormGroup());
    };   
    
    this.hideNextOccupButton[i+1][0] = false;
    
  };

  public addOccupationButtonClick(i: number, o: number) {
    this.hideNextOccupButton[i][o] = true;
    (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).push(this.addOccupationFormArray());
    this.hideNextOccupButton[i][o+1] = false;
  };

  public toggleExperienceEdit(i: number) {
    this.experienceCompleted[i] = false;
    this.experienceEditMode[i] = true;
    this.hideNextExpButton = true;
    this.experienceEditionModeEnabled = true;

    for (let o = 0; o < (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get("occupationArray")).controls.length; o++) {

      let startWork = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart');
      let finishWork = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodEnd');
      let nowWork = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodNow'); 

      this.cvForm.get('experience').disable();
      (<FormArray>this.cvForm.get('experience')).controls[i].enable();     
    };    
  }

  public finishExperienceEdition(i: number) {   

    const dateOptions = {
      day: undefined,
      month: 'long',
      year: 'numeric'
    };

    for (let o = 0; o < (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get("occupationArray")).controls.length; o++) {

      let startWork = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart');
      let finishWork = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodEnd');
      let nowWork = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodNow'); 
      
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
    
    if (((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get("occupationArray")).controls.length > 1)) {
      this.jobStart[i] = this.workStartDateFormatted[i][(<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get("occupationArray")).controls.length - 1];
        if (this.getOccupationControls(i,0).get('experienceTillNow').value) {
          this.jobFinish[i] = 'obecnie';  
        } else {
          this.jobFinish[i] = this.workFinishDateFormatted[i][0];
        };           
    } else {
      this.jobStart[i] = this.workStartDateFormatted[i][0];
      this.jobFinish[i] = this.workFinishDateFormatted[i][0];
    };       
    
    this.cvForm.get('experience').enable();
    this.experienceEditionModeEnabled = false;
    this.experienceCompleted[i] = true;
    this.experienceEditMode[i] = false;
    this.hideNextExpButton = false;
  };

  public removeChosenExperience(i: number) {
    (<FormArray>this.cvForm.get('experience')).removeAt(i);
    this.experienceCompleted.splice(i, 1);    
  }

  public onDeleteExperience(i: number) {
    let deleteExperience: boolean = false;
    
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '400px'
      // data: {message: ''}
    });

    dialogRef.afterClosed().subscribe(result => {      
      deleteExperience = result;

      if (deleteExperience == true) {
        (<FormArray>this.cvForm.get('experience')).removeAt(i);
        this.experienceCompleted.splice(i, 1);        
      } else {
        return;
      };
    });     
  };

  public addEducationButtonClick(e: number): void {  // tutej!
    
    const dateOptions = {
      day: undefined,
      month: undefined,
      year: 'numeric'
    };
      
    let startEducation = (<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodStart');  
    let finishEducation = (<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodEnd');
    let nowEducation = (<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodNow');

    if (this.educationStartDateFormatted[e] == undefined) {
      this.educationStartDateFormatted[e] = new Date(startEducation.value).toLocaleDateString('pl', dateOptions);
    };

    if (this.educationFinishDateFormatted[e] == undefined) {
      this.educationFinishDateFormatted[e] = new Date(finishEducation.value).toLocaleDateString('pl', dateOptions);
    };

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
  };

  public toggleEducationEdit(e: number) {

    this.educationCompleted[e] = false;
    this.educationEditMode[e] = true;
    this.hideNextEduButton = true;
    this.educationEditionModeEnabled = true;

    let startEducation = (<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodStart');
    let finishEducation= (<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodEnd');

    this.cvForm.get('education').disable();
    (<FormArray>this.cvForm.get('education')).controls[e].enable();

  };

  public finishEducationEdition(e: number) {

    const dateOptions = {
      day: undefined,
      month: undefined,
      year: 'numeric'
    };

    let startEducation = (<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodStart');
    let finishEducation = (<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodEnd');       

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

    this.cvForm.get('education').enable();
    this.educationEditionModeEnabled = false;
    this.educationCompleted[e] = true;
    this.educationEditMode[e] = false;
    this.hideNextEduButton = false;
  }

  public removeChosenEducation(e: number) {
    (<FormArray>this.cvForm.get('education')).removeAt(e);
    this.educationCompleted.splice(e, 1);       
  };

  public addCoursesButtonClick(c: number): void {
    
    const dateOptions = {
      day: undefined,
      month: undefined,
      year: 'numeric'
    };

    let startCourse = (<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodStart');           

    if (this.courseStartDateFormatted[c] == undefined) {
      this.courseStartDateFormatted[c] = new Date(startCourse.value).toLocaleDateString('pl', dateOptions);
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
    this.coursesEditionModeEnabled = true;

    let startCourse = (<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodStart');    

    this.cvForm.get('courses').disable();
    (<FormArray>this.cvForm.get('courses')).controls[c].enable();       
  };

  public finishCoursesEdition(c: number) {

    const dateOptions = {
      day: undefined,
      month: undefined,
      year: 'numeric'
    };

    let startCourse = (<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodStart');    

    if (startCourse.value instanceof Object) {
      this.courseStartDateFormatted[c] = new Date(startCourse.value).toLocaleDateString('pl', dateOptions);
    } else {
      this.courseStartDateFormatted[c] = startCourse.value;
    };    

    this.cvForm.get('courses').enable();
    this.coursesEditionModeEnabled = false;
    this.coursesCompleted[c] = true;
    this.coursesEditMode[c] = false;
    this.hideNextCourseButton = false;
  }

  public removeChosenCourse(c: number) {
    (<FormArray>this.cvForm.get('courses')).removeAt(c);
    this.coursesCompleted.splice(c, 1);      
  };

  public addLanguagesButtonClick(l: number): void {
    (<FormArray>this.cvForm.get('languages')).push(this.addLanguagesFormGroup());   
    this.hideNextLanguagesButton[l] = true;
  }

  public removeLanguagesButtonClick(l: number): void {    
    (<FormArray>this.cvForm.get('languages')).removeAt(l);  
    this.hideNextLanguagesButton[(<FormArray>this.cvForm.get('languages')).length - 1] = false;
    this.selectedLanguageDegree[l] = '';
    if ((<FormArray>this.cvForm.get('languages')).length == 0) {
      (<FormArray>this.cvForm.get('languages')).push(this.addLanguagesFormGroup());
      this.hideNextLanguagesButton[0] == false;
    }     
  };

  public getSelectedAvailabilityIndex(event: any) {    
    if (event.value === 'Wybierz datę...') {
      this.selectAvailability = true;      
    } else {
      this.selectAvailability = false;      
    }
  };

  public getSelectedEducationIndex(event: any, e: number) {    
    this.schoolTypeSelected[e] = event.value;  
  };

  public getExperienceControls(i: number) {
    return (this.cvForm.get('experience') as FormArray).controls[i];
  }

  public getOccupationArray(i: number) {
    return (<FormArray>(this.cvForm.get('experience') as FormArray).controls[i].get('occupationArray'));
  }

  public getOccupationControls(i: number, o: number) {
    return (<FormArray>(this.cvForm.get('experience') as FormArray).controls[i].get('occupationArray')).controls[o];
  }

  public getResponsibilitiesControls(i: number, o: number) {
    return (<FormArray>(<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('responsibilities'));
  }

  public getEducationControls(e: number) {
    return (this.cvForm.get('education') as FormArray).controls[e];
  }

  public getCoursesControls(c: number) {
    return (this.cvForm.get('courses') as FormArray).controls[c];
  }

  public getLanguagesControls(l: number) {
    return (this.cvForm.get('languages') as FormArray).controls[l];
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
      this.advantagesLeft = (6 - this.selectedAdvantagesValues.length);
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
    this.advantagesError = ((this.selectedAdvantagesValues.length > 6) || (this.selectedAdvantagesValues.length < 1)) ? true : false; //jeśli tablica selectedAdvantagesValues ma więcej niż 6 elementów, advantagesError otrzymuje wartość true
   
  };

  public getSelectedLanguageName(event: any, l: number) {
    this.otherLanguageSelected[l] = false;
    this.languageNameSelectedIndex[l] = event.value;    

    if ( (this.languageNameSelectedIndex[l] === 'inny...') ) {
      this.otherLanguageSelected[l] = true;
    };    

    if ((<FormArray>this.cvForm.get('languages')).controls[l].get('languageName').dirty) {
      (<FormArray>this.cvForm.get('languages')).controls[l].get('level').enable();
    } else {
      (<FormArray>this.cvForm.get('languages')).controls[l].get('level').reset();
      (<FormArray>this.cvForm.get('languages')).controls[l].get('level').disable();
    }   
  };

  public onLanguageLevelChange(level: any, index: number) {
    this.selectedLanguageDegree[index] = level.description;
  };    

  public onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    console.log("info o file: ");
    console.dir(file);
    const reader = new FileReader();

    console.log("Zdjęcie jest typu: " + typeof file);
    this.cvForm.patchValue({image: file});
    this.cvForm.get("image").updateValueAndValidity();    
    console.log("Typ value kontrolki zdjęcia " + typeof this.cvForm.get('image').value);

    reader.onload = () => {  // wczytywanie jest procesem asynchronicznym
      var img = new Image;
      img.onload = () => {
        console.log(img.width);
        console.log(img.height);  
        
        if (img.height > img.width) {
          this.imageClass = 'portrait';
        } else if (img.height < img.width) {
          this.imageClass = 'landscape';
        } else if (img.height == img.width) {
          this.imageClass = 'square';
        };

      } 
      img.src = reader.result as string;
      console.log(img.src);        
      
      this.uploadedImage = img.src;       
      console.log("Załadowane zdjęcie: " + this.uploadedImage);
      console.log("uploadedimage jest typu: " + typeof this.uploadedImage);
    };
    reader.readAsDataURL(file); // uruchamianie readera
  };    

  public toggleDrivingLicenceDescription(e: Event) {    
    if ((<HTMLInputElement>(e.target)).checked) {
      this.cvForm.get('drivingLicenceDescription').enable();
      this.drivingLicenceChecked = true;      
    } else {
      this.cvForm.get('drivingLicenceDescription').reset()
      this.cvForm.get('drivingLicenceDescription').disable();
      this.drivingLicenceChecked = false;      
    }
  };

  public toggleKnownProgramsDescription(e: Event) {   
    if ((<HTMLInputElement>(e.target)).checked) {
      this.cvForm.get('knownProgramsDescription').enable();
      this.knownProgramsChecked = true; 
    } else {
      this.cvForm.get('knownProgramsDescription').reset()
      this.cvForm.get('knownProgramsDescription').disable();
      this.knownProgramsChecked = false; 
    }
  };

  public toggleProgrammingSkillsDescription(e: Event) {    
    if ((<HTMLInputElement>(e.target)).checked) {
      this.cvForm.get('programmingSkillsDescription').enable();
      this.programmingSkillsChecked = true; 
    } else {
      this.cvForm.get('programmingSkillsDescription').reset()
      this.cvForm.get('programmingSkillsDescription').disable();
      this.programmingSkillsChecked = false; 
    }
  };

  public toggleDevicesUsageDescription(e: Event) {    
    if ((<HTMLInputElement>(e.target)).checked) {
      this.cvForm.get('devicesUsageDescription').enable();
      this.devicesUsageChecked = true; 
    } else {
      this.cvForm.get('devicesUsageDescription').reset()
      this.cvForm.get('devicesUsageDescription').disable();
      this.devicesUsageChecked = false; 
    }
  };

  public togglePermissionsDescription(e: Event) {    
    if ((<HTMLInputElement>(e.target)).checked) {
      this.cvForm.get('permissionsDescription').enable();
      this.permissionsChecked = true; 
    } else {
      this.cvForm.get('permissionsDescription').reset()
      this.cvForm.get('permissionsDescription').disable();
      this.permissionsChecked = false; 
    }
  };

  public toggleKnownRegulationsDescription(e: Event) {    
    if ((<HTMLInputElement>(e.target)).checked) {
      this.cvForm.get('knownRegulationsDescription').enable();
      this.knownRegulationsChecked = true; 
    } else {
      this.cvForm.get('knownRegulationsDescription').reset()
      this.cvForm.get('knownRegulationsDescription').disable();
      this.knownRegulationsChecked = false; 
    }
  };

  public toggleOtherSkillsDescription(e: Event) {
    if ((<HTMLInputElement>(e.target)).checked) {
      this.cvForm.get('otherSkillsDescription').enable();
      this.otherSkillsChecked = true; 
    } else {
      this.cvForm.get('otherSkillsDescription').reset()
      this.cvForm.get('otherSkillsDescription').disable();
      this.otherSkillsChecked = true; 
    }
  };

  public setExperienceTillNow(i: number, o: number) {
    if ((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('experienceTillNow').value) {
      (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodNow').setValue('obecnie');
    } else {
      (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodNow').setValue('');
    }
  };

  public setEducationTillNow(i: number) {
    if ((<FormArray>this.cvForm.get('education')).controls[i].get('educationTillNow').value) {
      (<FormArray>this.cvForm.get('education')).controls[i].get('educationPeriodNow').setValue('obecnie');
    } else {
      (<FormArray>this.cvForm.get('education')).controls[i].get('educationPeriodNow').setValue('');
    }
  }; 

  public setExperienceControlManuallyChanged (control: string, index: number, o: number, e: Event) {
    if (e != null && e instanceof Object) {  // z serwera zwracany jest typ String, a po wybraniu z kalendarza typ Object           
      if (control === 'workStart') {
        this.workStartDateManuallyChanged[index][o] = true;        
      };
      if (control === 'workFinish') {
        this.workFinishDateManuallyChanged[index][o] = true;        
      };     
    };     
  };

  public setControlManuallyChanged (control: string, index: number, e: Event) {
    if (e != null && e instanceof Object) {  // z serwera zwracany jest typ String, a po wybraniu z kalendarza typ Object                 
      if (control === 'educationStart') {
        this.educationStartDateManuallyChanged[index] = true;        
      };
      if (control === 'educationFinish') {
        this.educationFinishDateManuallyChanged[index] = true;        
      };
      if (control === 'courseStart') {
        this.courseStartDateManuallyChanged[index] = true;        
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
      let startDate = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart').value;
      let endDate = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodEnd').value;
      let tillNow = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodNow').value;       
  
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

  public checkEducationDate(e: number) {   // sprawdzanie poprawności daty (tymczasowo wyłączone)
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

    if (startDate > today) {
      this.coursesCurrentDateIssue[c] = true;
      this.coursesCurrentDateIssueMessage[c] = 'Data rozpoczęcia kursu nie może być nowsza od dzisiejszej!';
    } else {
      this.coursesCurrentDateIssue[c] = false;
    };
  };  

  public onAddClause() {
    this.addClause = !this.addClause;    
    if (this.addClause) {
      this.cvForm.get("clause").enable();
    } else {
      this.cvForm.get("clause").disable();
    };
  };

  public checkFormValidity() {  // sprawdzanie, czy formularz zawiera błędy

    this.PDF.totalLanguagesLength = (<FormArray>this.cvForm.get('languages')).length;     

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

    this.employmentSectionValid = (position.valid && location.valid && availability.valid && disposition.valid) ? true : false;
    this.personalDataSectionValid = (name.valid && surname.valid && email.valid && phone.valid) ? true : false;
    this.uploadedImageValid = (this.uploadedImage != undefined) ? true : false;
    this.educationSectionValid = (education.controls[0].get('schoolType').valid && education.controls[0].get('educationPeriodStart').valid && education.controls[0].get('schoolName').valid) ? true : false;
    this.advantagesSectionValid = (!this.advantagesError && this.selectedAdvantagesValues != undefined) ? true : false;
    this.hobbySectionValid = (hobby.valid) ? true : false;    

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
      this.formErrors.push('Wymiar pracy');
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
      this.formErrors.push('Wskaż minimum 1, maksimum 6 swoich mocnych stron');
    };
    if (!hobby.valid) {
      this.formErrors.push('Zainteresowania');
    };    

    for (let l = 0; l < (<FormArray>this.cvForm.get('languages')).length; l++) {
      if ((<FormArray>this.cvForm.get('languages')).controls[l].get('languageName').value !== '' && ((<FormArray>this.cvForm.get('languages')).controls[l].get('level').value === '' || (<FormArray>this.cvForm.get('languages')).controls[l].get('level').value === undefined)) {
         
        if (((<FormArray>this.cvForm.get('languages')).controls[l].get('otherLanguage').value !== '')) {
          this.formErrors.push('Uzupełnij poziom umiejętności języka: ' + (<FormArray>this.cvForm.get('languages')).controls[l].get('otherLanguage').value);
          this.languagesError[l] = true;
        } else {
          this.formErrors.push('Uzupełnij poziom umiejętności języka: ' + (<FormArray>this.cvForm.get('languages')).controls[l].get('languageName').value);
          this.languagesError[l] = true;
        };                 
      } else {
        this.languagesError[l] = false;
      };
    };    

    this.languagesValid = this.languagesError.every((error)=> {return error == false});   // Zwraca true, jeśli każdy element tablicy languagesError jest równy false   

    this.formValid = (this.employmentSectionValid && this.personalDataSectionValid
                      && this.uploadedImageValid && this.educationSectionValid
                      && this.advantagesSectionValid && this.hobbySectionValid
                      && this.languagesValid) ? true : false;    
  };

  public openErrorsDialog(): void {
    const dialogRef = this.dialog.open(WarningDialogComponent, {
      width: '700px',
      data: {errors: this.formErrors}
    });

    dialogRef.afterClosed().subscribe(result => {      
      this.formErrors = [];
    });
  }

  public canDeactivate(): Observable<boolean> | boolean {
    if (this.cvForm.dirty) {
        return this.dialogService.confirm('Czy na pewno chcesz opuscić stronę? Wprowadzone zmiany zostaną odrzucone.');
    }
    return true;
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
    return f1 && f2 && f1 === f2;
  }

  compareByValue(f1: any, f2: any) {     
    return f1 && f2 && f1.value === f2.value; 
  }

  compareByLang(f1: any, f2:any) {  
    return f1 && f2 && f1 === f2;
  }


  //********************  POBIERANIE BAZOWEGO CV  ********************************/

  public populateCVForm() {

    this.baseCV.getBaseCVData();

    let employmentFromDatabase = [];
    let availabilityFromDatabase = '';
    let languagesFromDatabase = [];
    let advantagesIndexFromDatabase = [];
    let experienceFromDatabase = [];
    let educationFromDatabase = [];
    let coursesFromDatabase = [];

    this.populateFormSubscription$ = this.baseCV.receivedFormData.subscribe((CVData) => {      
      this.imageClass = CVData.data.baseCVData.photoClass; 
      employmentFromDatabase = CVData.data.baseCVData.employment;
      this.cvForm.get('employment').setValue(employmentFromDatabase);

        // DANE OSOBOWE, WARUNKI ZATRUDNIENIA, ZAINTERESOWANIA
      this.cvForm.patchValue({
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
        this.cvForm.patchValue({ image: CVData.data.baseCVData.photoPath });
        this.cvForm.get("image").updateValueAndValidity();    
        console.log(this.cvForm.get("image").value);
        this.uploadedImage = CVData.data.baseCVData.photoPath;        
      };               

        // DOSTĘPNOŚĆ
      availabilityFromDatabase = CVData.data.baseCVData.availability;
      switch (availabilityFromDatabase) {
        case 'Od zaraz':
          this.cvForm.patchValue({ availability: availabilityFromDatabase });
          break;
        case '2 tygodnie okresu wypowiedzenia':
            this.cvForm.patchValue({ availability: availabilityFromDatabase });
            break;
        case '1 miesiąc okresu wypowiedzenia':
            this.cvForm.patchValue({ availability: availabilityFromDatabase });
            break;
        case '3 miesiące okresu wypowiedzenia':
          this.cvForm.patchValue({ availability: availabilityFromDatabase });
          break;
        default: 
        this.selectAvailability = true;
        this.cvForm.patchValue({ 
          availability: 'Wybierz datę...',
          availabilityDate: availabilityFromDatabase
        });        
      };
      
        // UMIEJĘTNOŚCI
      if (CVData.data.baseCVData.skills.drivingLicence.checked) {
        this.drivingLicenceChecked = true;
        this.cvForm.patchValue({ drivingLicenceDescription: CVData.data.baseCVData.skills.drivingLicence.description });     
        this.cvForm.get("drivingLicenceDescription").enable();   
      } else {
        this.drivingLicenceChecked = false;
        this.cvForm.get("drivingLicenceDescription").disable();   
      };

      if (CVData.data.baseCVData.skills.knownPrograms.checked) {
        this.knownProgramsChecked = true;
        this.cvForm.patchValue({ knownProgramsDescription: CVData.data.baseCVData.skills.knownPrograms.description });     
        this.cvForm.get("knownProgramsDescription").enable();   
      } else {
        this.knownProgramsChecked = false;
        this.cvForm.get("knownProgramsDescription").disable();   
      };

      if (CVData.data.baseCVData.skills.programmingSkills.checked) {
        this.programmingSkillsChecked = true;
        this.cvForm.patchValue({ programmingSkillsDescription: CVData.data.baseCVData.skills.programmingSkills.description });     
        this.cvForm.get("programmingSkillsDescription").enable();   
      } else {
        this.programmingSkillsChecked = false;
        this.cvForm.get("programmingSkillsDescription").disable();   
      };

      if (CVData.data.baseCVData.skills.devicesUsage.checked) {
        this.devicesUsageChecked = true;
        this.cvForm.patchValue({ devicesUsageDescription: CVData.data.baseCVData.skills.devicesUsage.description });     
        this.cvForm.get("devicesUsageDescription").enable();   
      } else {
        this.devicesUsageChecked = false;
        this.cvForm.get("devicesUsageDescription").disable();   
      };

      if (CVData.data.baseCVData.skills.permissions.checked) {
        this.permissionsChecked = true;
        this.cvForm.patchValue({ permissionsDescription: CVData.data.baseCVData.skills.permissions.description });     
        this.cvForm.get("permissionsDescription").enable();   
      } else {
        this.permissionsChecked = false;
        this.cvForm.get("permissionsDescription").disable();   
      };

      if (CVData.data.baseCVData.skills.knownRegulations.checked) {
        this.knownRegulationsChecked = true;
        this.cvForm.patchValue({ knownRegulationsDescription: CVData.data.baseCVData.skills.knownRegulations.description });     
        this.cvForm.get("knownRegulationsDescription").enable();   
      } else {
        this.knownRegulationsChecked = false;
        this.cvForm.get("knownRegulationsDescription").disable();   
      };

      if (CVData.data.baseCVData.skills.otherSkills.checked) {
        this.otherSkillsChecked = true;
        this.cvForm.patchValue({ otherSkillsDescription: CVData.data.baseCVData.skills.otherSkills.description });     
        this.cvForm.get("otherSkillsDescription").enable();   
      } else {
        this.otherSkillsChecked = false;
        this.cvForm.get("otherSkillsDescription").disable();   
      };


        // JĘZYKI
      languagesFromDatabase = CVData.data.baseCVData.languages;                      
      if (languagesFromDatabase.length > 0) {       
        ((<FormArray>this.cvForm.get('languages')).controls[0].get('languageName').patchValue(languagesFromDatabase[0][0].languageName));
        ((<FormArray>this.cvForm.get('languages')).controls[0].get('languageName').markAsDirty());

        if ((<FormArray>this.cvForm.get('languages')).controls[0].get('languageName').dirty) {
          (<FormArray>this.cvForm.get('languages')).controls[0].get('level').enable();
        } else {
          (<FormArray>this.cvForm.get('languages')).controls[0].get('level').reset();
          (<FormArray>this.cvForm.get('languages')).controls[0].get('level').disable();
        } 

        (<FormArray>this.cvForm.get('languages')).controls[0].get('level').patchValue(languagesFromDatabase[0][0].languageLevel);     
        this.selectedLanguageDegree[0] = languagesFromDatabase[0][0].languageDescription;  
        this.hideNextLanguagesButton[0] = true;
      }

      for (let l = 1; l < languagesFromDatabase.length; l++) {  // Jeśli w bazowym CV jest więcej języków niż 1
        if ((<FormArray>this.cvForm.get('languages')).length < languagesFromDatabase.length) {
            this.addLanguagesButtonClick(l);
        };        

        ((<FormArray>this.cvForm.get('languages')).controls[l].get('languageName').patchValue(languagesFromDatabase[l][0].languageName));
        ((<FormArray>this.cvForm.get('languages')).controls[l].get('languageName').markAsDirty());

        if ((<FormArray>this.cvForm.get('languages')).controls[l].get('languageName').dirty) {
          (<FormArray>this.cvForm.get('languages')).controls[l].get('level').enable();
        } else {
          (<FormArray>this.cvForm.get('languages')).controls[l].get('level').reset();
          (<FormArray>this.cvForm.get('languages')).controls[l].get('level').disable();
        } 

        (<FormArray>this.cvForm.get('languages')).controls[l].get('level').patchValue(languagesFromDatabase[l][0].languageLevel);
        this.selectedLanguageDegree[l] = languagesFromDatabase[l][0].languageDescription;  
        this.hideNextLanguagesButton[l] = true;
      };

      this.hideNextLanguagesButton[(<FormArray>this.cvForm.get('languages')).length - 1] = false;


        // MOCNE STRONY
      advantagesIndexFromDatabase = CVData.data.baseCVData.selectedAdvantagesIndex;      
      advantagesIndexFromDatabase.forEach((advantage, i) => {                   
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

      let occupationDataFromDatabase: any[] = new Array();        
      let responsibilitiesFromDatabase: any[] = new Array();
      let responsibilitiesArrayToFill: any[] = new Array();       

        for (let e = 0; e < experienceFromDatabase.length; e++) {               

          if ((<FormArray>this.cvForm.get('experience')).length < experienceFromDatabase.length) {
            (<FormArray>this.cvForm.get('experience')).push(this.addExperienceFormGroup());
          };          

          occupationDataFromDatabase[e] = experienceFromDatabase[e][0].occupationData;          

          ((<FormArray>this.cvForm.get('experience')).controls[e].get('employerName').setValue(experienceFromDatabase[e][0].employerName));
          ((<FormArray>this.cvForm.get('experience')).controls[e].get('trade').setValue(experienceFromDatabase[e][0].trade));

          for (let o = 0; o < occupationDataFromDatabase[e].length; o++) { 

            this.hideNextOccupButton[e][o-1] = true;

            if ((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[e].get('occupationArray')).length < occupationDataFromDatabase[e].length) {                                
              this.addOccupationButtonClick(e, 0);
            };

            ((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[e].get('occupationArray')).controls[o].get('occupation').patchValue(occupationDataFromDatabase[e][o][0].occupation));
  
            if (occupationDataFromDatabase[e][o][0].workFinish != "obecnie") {          
  
            ((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[e].get('occupationArray')).controls[o].get('workPeriodStart').patchValue(occupationDataFromDatabase[e][o][0].workStart));
            this.workStartDateFormatted[e][o] = occupationDataFromDatabase[e][o][0].workStart;  
            ((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[e].get('occupationArray')).controls[o].get('workPeriodEnd').patchValue(occupationDataFromDatabase[e][o][0].workFinish));
            this.workFinishDateFormatted[e][o] = occupationDataFromDatabase[e][o][0].workFinish;          
          } else {
            ((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[e].get('occupationArray')).controls[o].get('workPeriodStart').patchValue(occupationDataFromDatabase[e][o][0].workStart));
            this.workStartDateFormatted[e][o] = occupationDataFromDatabase[e][o][0].workStart;   
            this.experienceTillNowSelected[e][o] = true;             
            this.getOccupationControls(e,o).get('experienceTillNow').patchValue(this.experienceTillNowSelected[e][o]);       
          };
  
            responsibilitiesFromDatabase[o] = occupationDataFromDatabase[e][o][0].responsibilities;            
            responsibilitiesArrayToFill[o] = ((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[e].get('occupationArray')).controls[o].get('responsibilities') as FormArray);
              
            if (responsibilitiesFromDatabase[o].length > 0) {
              responsibilitiesArrayToFill[o].controls[0].get('responsibility').setValue(responsibilitiesFromDatabase[o][0]);          
              for (let r = 1; r < responsibilitiesFromDatabase[o].length; r++) {
                  if (responsibilitiesArrayToFill[o].length < responsibilitiesFromDatabase[o].length) {
                    this.addNewResponsibility(e, o);
                    this.focusOnResp = false;  
                  }
                responsibilitiesArrayToFill[o].controls[r].get('responsibility').setValue(responsibilitiesFromDatabase[o][r]);
            };         
          };  
          
          this.getOccupationControls(e, o).get('workPeriodStart').markAsDirty();
          this.hideNextOccupButton[e][o] = false;
  
        };          

          (<FormArray>this.cvForm.get('experience')).controls[e].get('employerName').markAsDirty();  
          this.experienceCompleted[e] = true;
          this.hideNextExpButton = false;

          (<FormArray>this.cvForm.get('experience')).push(this.addExperienceFormGroup());  

          if (((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[e].get("occupationArray")).controls.length > 1)) {
            this.jobStart[e] = this.workStartDateFormatted[e][(<FormArray>(<FormArray>this.cvForm.get('experience')).controls[e].get("occupationArray")).controls.length - 1];
              if (this.getOccupationControls(e,0).get('experienceTillNow').value) {
                this.jobFinish[e] = 'obecnie';  
              } else {
                this.jobFinish[e] = this.workFinishDateFormatted[e][0];
              };           
          } else {
            this.jobStart[e] = this.workStartDateFormatted[e][0];
            this.jobFinish[e] = this.workFinishDateFormatted[e][0];
          };
       }                      
      }; // koniec doświadczenia zawodowego

        // EDUKACJA
        educationFromDatabase = CVData.data.baseCVData.education;
        console.log(educationFromDatabase);                
        if (educationFromDatabase.length > 0) {                    
          
          for (let e = 0; e < educationFromDatabase.length; e++) {                      
            
            if ((<FormArray>this.cvForm.get('education')).length < educationFromDatabase.length) {
                (<FormArray>this.cvForm.get('education')).push(this.addEducationFormGroup());  
            };                                
  
            if (educationFromDatabase[e][0].educationFinish !== "obecnie") {
                ((<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodStart').patchValue(educationFromDatabase[e][0].educationStart));
                this.educationStartDateFormatted[e] = educationFromDatabase[e][0].educationStart;  
                ((<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodEnd').patchValue(educationFromDatabase[e][0].educationFinish));
                this.educationFinishDateFormatted[e] = educationFromDatabase[e][0].educationFinish;   
            } else {
                ((<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodStart').patchValue(educationFromDatabase[e][0].educationStart));
                this.educationStartDateFormatted[e] = educationFromDatabase[e][0].educationStart;   
                this.educationTillNowSelected[e] = true;    
                this.getEducationControls(e).get('educationTillNow').patchValue(this.educationTillNowSelected[e]);   
                this.setEducationTillNow(e);  
            };
  
            this.schoolTypeSelected[e] = educationFromDatabase[e][0].schoolTypeIndex;          

            ((<FormArray>this.cvForm.get('education')).controls[e].get('schoolType').patchValue(this.schoolTypeSelected[e]));
            ((<FormArray>this.cvForm.get('education')).controls[e].get('schoolName').patchValue(educationFromDatabase[e][0].schoolName));
            ((<FormArray>this.cvForm.get('education')).controls[e].get('specialization').patchValue(educationFromDatabase[e][0].schoolProfile));
            ((<FormArray>this.cvForm.get('education')).controls[e].get('classProfile').patchValue(educationFromDatabase[e][0].schoolProfile));
            ((<FormArray>this.cvForm.get('education')).controls[e].get('educationMode').patchValue(educationFromDatabase[e][0].schoolMode));   
            
            this.educationEndDateIssue[e] = false;
            this.educationCurrentDateIssue[e] = false;
            (<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodStart').markAsDirty(); 

            this.educationCompleted[e] = true;
          (<FormArray>this.cvForm.get('education')).push(this.addEducationFormGroup());
  
          };                  
        }; // koniec edukacji

          // KURSY
          coursesFromDatabase = CVData.data.baseCVData.courses;
          console.log(coursesFromDatabase);                
          if (coursesFromDatabase.length > 0) {                                 
            
            for (let c = 0; c < coursesFromDatabase.length; c++) {                             
              
              if ((<FormArray>this.cvForm.get('courses')).length < coursesFromDatabase.length) {
                (<FormArray>this.cvForm.get('courses')).push(this.addCoursesFormGroup());  
              };                                   
            
              ((<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodStart').patchValue(coursesFromDatabase[c][0].courseStart));
              this.courseStartDateFormatted[c] = coursesFromDatabase[c][0].courseStart;                            
  
              ((<FormArray>this.cvForm.get('courses')).controls[c].get('courseName').patchValue(coursesFromDatabase[c][0].courseName));
              ((<FormArray>this.cvForm.get('courses')).controls[c].get('courseSubject').patchValue(coursesFromDatabase[c][0].courseSubject));                
              
              this.coursesCurrentDateIssue[c] = false;
              (<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodStart').markAsDirty(); 

              this.coursesCompleted[c] = true;     
              (<FormArray>this.cvForm.get('courses')).push(this.addCoursesFormGroup());  
    
            };
          
          }; // koniec kursów


    },
    (error) => {
      console.log(error);
    });
  };

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

      if (this.screenInnerWidth < 1980 && this.screenInnerWidth >= 1800) {          // modyfikowanie wielkości zdjęcia na wydruku w zależności od szerokości ekranu generatora; należy uzupełnić, żeby uniknąć "jajowatości zdjęcia"
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
      } else if (this.screenInnerWidth < 769 && this.screenInnerWidth >= 750) { 
        userPhotoWidth = userPhotoWidth * 0.55; 
      } else if (this.screenInnerWidth < 750 && this.screenInnerWidth >= 720) { 
        userPhotoWidth = userPhotoWidth * 0.6;
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
      
      const userPhoto = await domtoimage.toPng(uploadedPhoto, {width: userPhotoWidth, height: userPhotoHeight, cachebust: true});
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

      const dateOptionsYearsOnly = {
        day: undefined,
        month: undefined,
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
        this.PDF.employment = (this.cvForm.get('employment').value).map(emp => {
          return emp.value;
        }).join(', ');        
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

    let startWork = new Array();
    let finishWork = new Array()
    let occupation = new Array();
    let responsibilities = new Array();

    for (let i = 0; i < (<FormArray>this.cvForm.get('experience')).length; i++) {

      let occupationArray: any[] = new Array();

      if ( (<FormArray>this.cvForm.get('experience')).controls[i].get('employerName').value !== '' ) {

        this.PDF.employer[i] = (<FormArray>this.cvForm.get('experience')).controls[i].get('employerName').value;
        this.PDF.trade[i] = (<FormArray>this.cvForm.get('experience')).controls[i].get('trade').value;

        for (let o = 0; o < (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).length; o++) {         

          if ( (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('experienceTillNow').value ) {

            if (this.workStartDateManuallyChanged[i][o] == true) {

              startWork[o] = new Date((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart').value).toLocaleDateString('pl', dateOptions);
                            
            } else {
              startWork[o] = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart').value;
            };          
            
            finishWork[o] = 'obecnie';
  
          } else {
            
            if (this.workStartDateManuallyChanged[i][o] == true) {
              startWork[o] = new Date((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart').value).toLocaleDateString('pl', dateOptions); 
            } else {
              startWork[o] = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodStart').value;
            };
            
            if (this.workFinishDateManuallyChanged[i][o] == true) {
              finishWork[o]  = new Date((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodEnd').value).toLocaleDateString('pl', dateOptions);
            } else {
              finishWork[o] = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('workPeriodEnd').value;
            };          
          };

          occupation[o] = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('occupation').value;

          let responsibilitiesArray = ((<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).controls[o].get('responsibilities') as FormArray);
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

          this.PDF.occupationArray[i] = occupationArray;                                     

      };

      this.PDF.totalOccupationArrayLength[i] = (<FormArray>(<FormArray>this.cvForm.get('experience')).controls[i].get('occupationArray')).length;

      this.PDF.jobStart[i] = this.jobStart[i];
      this.PDF.jobFinish[i] = this.jobFinish[i];

    };

      // EDUKACJA
      this.PDF.totalEducationLength = (<FormArray>this.cvForm.get('education')).length;

      for (let e = 0; e < (<FormArray>this.cvForm.get('education')).length; e++) {

        if ((<FormArray>this.cvForm.get('education')).controls[e].get('schoolName').value !== '') {

          if ( (<FormArray>this.cvForm.get('education')).controls[e].get('educationTillNow').value ) {
            this.PDF.startEducation[e] = new Date((<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodStart').value).toLocaleDateString('pl', dateOptionsYearsOnly);
            this.PDF.finishEducation[e] = 'obecnie';
          } else {
            this.PDF.startEducation[e] = new Date((<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodStart').value).toLocaleDateString('pl', dateOptionsYearsOnly);
            this.PDF.finishEducation[e] = new Date((<FormArray>this.cvForm.get('education')).controls[e].get('educationPeriodEnd').value).toLocaleDateString('pl', dateOptionsYearsOnly);
          };

          this.PDF.schoolName[e] = (<FormArray>this.cvForm.get('education')).controls[e].get('schoolName').value;
          this.PDF.schoolProfile[e] = (<FormArray>this.cvForm.get('education')).controls[e].get('specialization').value || (<FormArray>this.cvForm.get('education')).controls[e].get('classProfile').value;

        };
      };

      // KURSY
      this.PDF.totalCoursesLength = (<FormArray>this.cvForm.get('courses')).length;

      for (let c = 0; c < (<FormArray>this.cvForm.get('courses')).length; c++) {

        if ((<FormArray>this.cvForm.get('courses')).controls[c].get('courseName').value !== '') {          
          this.PDF.startCourse[c] = new Date((<FormArray>this.cvForm.get('courses')).controls[c].get('coursePeriodStart').value).toLocaleDateString('pl', dateOptionsYearsOnly);         
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
      if (this.addClause) {
        this.PDF.clause = this.cvForm.get('clause').value;
      };      

      setTimeout(() => this.PDF.generatePDF(), 300);
      this.isLoading = false;
      this.router.navigate(["/kokpit"]);
    } else {
      this.openErrorsDialog();
    }

  }
  
  ngOnDestroy() {
    this.retrieveBaseCVSubscription$.unsubscribe();
    if (this.populateFormSubscription$ !== undefined) {
      this.populateFormSubscription$.unsubscribe();
    }  
  };

}
