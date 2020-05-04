export interface CVData {    
    name?: string;
    surname?: string;
    contactEmail?: string;
    phone?: string;       
    photoPath?: string;  //ścieżka do zapisanego zdjęcia 
    position?: string;
    location?: string;
    availability?: string;
    disposition?: string;
    employment?: any[];
    salary?: string;
    experience?: any[];
    education?: any[
        // {
        //     schoolType?: string;
        //     educationPeriodStart?: string;
        //     educationPeriodEnd?: string;
        //     schoolName?: string;
        //     specialization?: string;
        //     educationMode?: string;
        //     classProfile?: string;
        // }
    ];
    courses?: any[
        // {
        //     coursePeriodStart?: string;
        //     coursePeriodEnd?: string;
        //     courseName?: string;
        //     courseSubject?: string;
        // }
    ];
    languages?: any[
        // {
        //     languageName?: string;
        //     level?: string;
        // }
    ];
    drivingLicenceChecked?: boolean;
    drivingLicenceDescription?: string;
    knownProgramsChecked?: boolean;
    knownProgramsDescription?: string;
    programmingSkillsChecked?: boolean;
    programmingSkillsDescription?: string;
    devicesUsageChecked?: boolean;
    devicesUsageDescription?: string;
    permissionsChecked?: boolean;
    permissionsDescription?: string;
    knownRegulationsChecked?: boolean;
    knownRegulationsDescription?: string;
    otherSkillsChecked?: boolean;
    otherSkillsDescription?: string;
    advantages?: string[];
    selectedAdvantagesIndex?: boolean[];
    hobby?: string;   
    creationTime?: Date;
    lastModified?: Date;                                               
}