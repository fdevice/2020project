export interface CVData {    
    name?: string,
    surname?: string,
    contactEmail?: string,
    phone?: string,       
    photoPath?: string,  //ścieżka do zapisanego zdjęcia 
    position?: string,
    location?: string,
    availability?: string,
    disposition?: string,
    employment?: string[],
    salary?: string,
    experience?: [
        {
            workPeriodStart?: string,
            workPeriodEnd?: string,
            employerName?: string,
            trade?: string,
            occupation?: string,
            responsibilities?: string[]
        }
    ],
    education?: [
        {
            schoolType?: string,
            educationPeriodStart?: string,
            educationPeriodEnd?: string,
            schoolName?: string,
            specialization?: string,
            educationMode?: string,
            classProfile?: string
        }
    ],
    courses?: [
        {
            coursePeriodStart?: string,
            coursePeriodEnd?: string,
            courseName?: string,
            courseSubject?: string
        }
    ],
    languages?: [
        {
            languageName?: string,
            level?: string
        }
    ],
    drivingLicenceChecked?: boolean,
    drivingLicenceDescription?: string,
    knownProgramsChecked?: boolean,
    knownProgramsDescription?: string,
    programmingSkillsChecked?: boolean,
    programmingSkillsDescription?: string,
    devicesUsageChecked?: boolean,
    devicesUsageDescription?: string,
    permissionsChecked?: boolean,
    permissionsDescription?: string,
    knownRegulationsChecked?: boolean,
    knownRegulationsDescription?: string,
    otherSkillsChecked?: boolean,
    otherSkillsDescription?: string,
    advantages?: string[],
    hobby?: string                                                  
}