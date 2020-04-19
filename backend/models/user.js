const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  surname: { type: String },
  contactEmail: { type: String },
  phone: { type: String },
  hasBaseCV: { type: Boolean, default: false },
  documentPath: { type: String },    //ścieżka do zapisanego CV w pliku pdf
  registrationTime: { type: Date },
  modificationTime: { type: Date },
  baseCVData: { 
    photoPath: { type: String },  //ścieżka do zapisanego zdjęcia 
    position: { type: String },
    location: { type: String },
    availability: { type: String },
    disposition: { type: String },
    employment: [
      { type: String }
    ],
    salary: { type: String },
    experience: [
      // {
      //   workPeriodStart: { type: String },
      //   workPeriodEnd: { type: String },
      //   employerName: { type: String },
      //   trade: { type: String },
      //   occupation: { type: String },
      //   responsibilities: [
      //     { type: String }
      //   ]
      // }
    ],
    education: [
      // {
      //   schoolType: { type: String },
      //   educationPeriodStart: { type: String },
      //   educationPeriodEnd: { type: String },
      //   schoolName: { type: String },
      //   specialization: { type: String },
      //   educationMode: { type: String },
      //   classProfile: { type: String }
      // }
    ],
    courses: [
      // {
      //   coursePeriodStart: { type: String },
      //   coursePeriodEnd: { type: String },
      //   courseName: { type: String },
      //   courseSubject: { type: String }
      // }
    ],
    languages: [
      // {
      //   languageName: { type: String },
      //   level: { type: String }
      // }
    ],
    skills: {
      drivingLicence: {
        checked: { type: Boolean },
        description: { type: String }
      },
      knownPrograms: {
        checked: { type: Boolean },
        description: { type: String }
      },
      programmingSkills: {
        checked: { type: Boolean },
        description: { type: String }
      },
      devicesUsage: {
        checked: { type: Boolean },
        description: { type: String }
      },
      permissions: {
        checked: { type: Boolean },
        description: { type: String }
      },
      knownRegulations: {
        checked: { type: Boolean },
        description: { type: String }
      },
      otherSkills: {
        checked: { type: Boolean },
        description: { type: String }
      }
    },
    advantages: [
      { type: String }
    ],
    hobby: { type: String },
    creationTime: { type: Date },
    lastModified: { type: Date }
   }   
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);