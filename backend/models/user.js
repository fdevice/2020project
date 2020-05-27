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
    photoClass: { type: String },
    position: { type: String },
    location: { type: String },
    availability: { type: String },
    disposition: { type: String },
    employment: [],
    salary: { type: String },
    experience: [],
    education: [],
    courses: [],
    languages: [],
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
    selectedAdvantagesIndex: [],
    hobby: { type: String },
    creationTime: { type: Date },
    lastModified: { type: Date }
   }   
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);