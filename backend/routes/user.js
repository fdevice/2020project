const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const User = require("../models/user");

const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type!");
    if (isValid) {
      error = null;
    }
    // cb(error, "./backend/images");  // podczas pracy na developerce
    cb(error, "images");   // na produkcji
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const extension = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + extension);    // blueprint dla nazwy przechowywanych plików graficznych
  }
});

  
    // REJESTRACJA NOWEGO UŻYTKOWNIKA
router.post("/signup", (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash,
        hasBaseCV: false
      });
      user
        .save()
        .then(result => {
          res.status(201).json({
            message: "Rejestracja nowego użytkownika zakończona!",
            result: result
          });
        })
        .catch(err => {
          res.status(500).json({
            message: "Błąd autentykacji!"
          });
        });
    });
  });

      // LOGOWANIE
  router.post("/login", (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          return res.status(401).json({
            message: "Nie odnaleziono użytkownika!"
          });
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password);
      })
      .then(result => {
        if (!result) {
          return res.status(401).json({
            message: "Niewłaściwe hasło!"
          });
        }
        const token = jwt.sign(
          { email: fetchedUser.email, userId: fetchedUser._id },
          process.env.JWT_KEY,
          { expiresIn: "1h" }
        );
        res.status(200).json({
          token: token,
          expiresIn: 3600,
          userId: fetchedUser._id
          // hasBaseCV: fetchedUser.hasBaseCV
        });
      })
      .catch(err => {
        return res.status(401).json({
          message: "Nieprawidłowe dane logowania!"
        });
      });
  });

        // SPRAWDZANIE, CZY UŻYTKOWNIK POSIADA ZAPISANE BAZOWE CV
  router.get("/:email", (req, res, next) => {    
    User.findOne({ email: req.params.email })
      .then(result => {
        if (result.hasBaseCV == true) {   
          console.log(result.hasBaseCV);                
          console.log("Odnaleziono bazowe CV!");
          res.status(200).json({
            message: "Odnaleziono bazowe CV!",
            hasBaseCV: result.hasBaseCV            
          });
        } else {           
          console.log(result.hasBaseCV);
          console.log("Brak zapisanego bazowego CV!");
          res.status(200).json({
            message: "Brak zapisanego bazowego CV!",
            hasBaseCV: false
          })
        }               
      })      
      .catch(err => {
        console.log(err);
      });
  });


      // ZAPISYWANIE BAZOWEGO CV
    // router.put("/cv", (req, res, next) => {
    router.post("/cv", (req, res, next) => {  
      // console.log(req.body);
      User.findOne({ email: req.body.loggedUserEmail })
        .then(user => {
          if (!user) {
            return res.status(401).json({
              message: "Nie odnaleziono takiego użytkownika!"
            });          
          }         
          // DANE OSOBOWE I KONTAKTOWE
          if (req.body.cvData.name) {
            user.name = req.body.cvData.name;
          }
          if (req.body.cvData.surname) {
            user.surname = req.body.cvData.surname;
          }
          if (req.body.cvData.contactEmail) {
            user.contactEmail = req.body.cvData.contactEmail;
          }
          if (req.body.cvData.phone) {
            user.phone = req.body.cvData.phone;
          }   
          if (req.body.cvData.photoClass) {
            user.baseCVData.photoClass = req.body.cvData.photoClass;
          }        
          // PREFEROWANE WARUNKI ZATRUDNIENIA
          if (req.body.cvData.position) {
            user.baseCVData.position = req.body.cvData.position;
          }
          if (req.body.cvData.disposition) {
            user.baseCVData.disposition = req.body.cvData.disposition;
          }
          if (req.body.cvData.location) {
            user.baseCVData.location = req.body.cvData.location;
          }
          if (req.body.cvData.availability) {
            user.baseCVData.availability = req.body.cvData.availability;
          }
          if (req.body.cvData.salary) {
            user.baseCVData.salary = req.body.cvData.salary;
          }
          if (req.body.cvData.employment) {
            user.baseCVData.employment = req.body.cvData.employment;
          }
          // DOŚWIADCZENIE ZAWODOWE
          if (req.body.cvData.experience) {            
            user.baseCVData.experience = req.body.cvData.experience;
          }
          // EDUKACJA
          if (req.body.cvData.education) {            
            user.baseCVData.education = req.body.cvData.education;
          }
          // KURSY
          if (req.body.cvData.courses) {            
            user.baseCVData.courses = req.body.cvData.courses;
          }
          // JĘZYKI
          if (req.body.cvData.languages) {            
            user.baseCVData.languages = req.body.cvData.languages;
          }
          // UMIEJĘTNOŚCI
          if (req.body.cvData.drivingLicenceChecked) {            
            user.baseCVData.skills.drivingLicence.checked = req.body.cvData.drivingLicenceChecked;
            user.baseCVData.skills.drivingLicence.description = req.body.cvData.drivingLicenceDescription;
          } else {
            user.baseCVData.skills.drivingLicence.checked = req.body.cvData.drivingLicenceChecked;
            user.baseCVData.skills.drivingLicence.description = req.body.cvData.drivingLicenceDescription;
          } 
          if (req.body.cvData.knownProgramsChecked) {            
            user.baseCVData.skills.knownPrograms.checked = req.body.cvData.knownProgramsChecked;
            user.baseCVData.skills.knownPrograms.description = req.body.cvData.knownProgramsDescription;
          } else {
            user.baseCVData.skills.knownPrograms.checked = req.body.cvData.knownProgramsChecked;
            user.baseCVData.skills.knownPrograms.description = req.body.cvData.knownProgramsDescription;
          } 
          if (req.body.cvData.programmingSkillsChecked) {            
            user.baseCVData.skills.programmingSkills.checked = req.body.cvData.programmingSkillsChecked;
            user.baseCVData.skills.programmingSkills.description = req.body.cvData.programmingSkillsDescription;
          } else {
            user.baseCVData.skills.programmingSkills.checked = req.body.cvData.programmingSkillsChecked;
            user.baseCVData.skills.programmingSkills.description = req.body.cvData.programmingSkillsDescription;
          }          
          if (req.body.cvData.devicesUsageChecked) {            
            user.baseCVData.skills.devicesUsage.checked = req.body.cvData.devicesUsageChecked;
            user.baseCVData.skills.devicesUsage.description = req.body.cvData.devicesUsageDescription;
          } else {
            user.baseCVData.skills.devicesUsage.checked = req.body.cvData.devicesUsageChecked;
            user.baseCVData.skills.devicesUsage.description = req.body.cvData.devicesUsageDescription;
          } 
          if (req.body.cvData.permissionsChecked) {            
            user.baseCVData.skills.permissions.checked = req.body.cvData.permissionsChecked;
            user.baseCVData.skills.permissions.description = req.body.cvData.permissionsDescription;
          } else {
            user.baseCVData.skills.permissions.checked = req.body.cvData.permissionsChecked;
            user.baseCVData.skills.permissions.description = req.body.cvData.permissionsDescription;
          } 
          if (req.body.cvData.knownRegulationsChecked) {            
            user.baseCVData.skills.knownRegulations.checked = req.body.cvData.knownRegulationsChecked;
            user.baseCVData.skills.knownRegulations.description = req.body.cvData.knownRegulationsDescription;
          } else {
            user.baseCVData.skills.knownRegulations.checked = req.body.cvData.knownRegulationsChecked;
            user.baseCVData.skills.knownRegulations.description = req.body.cvData.knownRegulationsDescription;
          }
          if (req.body.cvData.otherSkillsChecked) {            
            user.baseCVData.skills.otherSkills.checked = req.body.cvData.otherSkillsChecked;
            user.baseCVData.skills.otherSkills.description = req.body.cvData.otherSkillsDescription;
          } else {
            user.baseCVData.skills.otherSkills.checked = req.body.cvData.otherSkillsChecked;
            user.baseCVData.skills.otherSkills.description = req.body.cvData.otherSkillsDescription;
          }
          // MOCNE STRONY
          if (req.body.cvData.advantages) {            
            user.baseCVData.advantages = req.body.cvData.advantages;
            user.baseCVData.selectedAdvantagesIndex = req.body.cvData.selectedAdvantagesIndex;
          }
          // ZAINTERESOWANIA / HOBBY
          if (req.body.cvData.hobby) {            
            user.baseCVData.hobby = req.body.cvData.hobby;
          }
          user.baseCVData.creationTime = req.body.cvData.creationTime;
          user.hasBaseCV = true;
          user.save()
            .then(updatedUser => {
              res.status(200).json({
                message: "Aktualizacja danych użytkownika zakończona!",
                result: updatedUser                
              });
              console.log(updatedUser);
              console.log("Updated!")
            })
            .catch(err => {
              res.status(500).send();
              console.log(err);
            })
        })
    });

    // AKTUALIZOWANIE BAZOWEGO CV
      router.put("/cv", (req, res, next) => {       
        // console.log(req.body);
        User.updateOne(
          { email: req.body.loggedUserEmail },
          {
            $set: {
              // DANE OSOBOWE I KONTAKTOWE
              name: req.body.cvData.name,
              surname: req.body.cvData.surname,
              contactEmail: req.body.cvData.contactEmail,
              phone: req.body.cvData.phone,
              "baseCVData.photoClass": req.body.cvData.photoClass,
              // PREFEROWANE WARUNKI ZATRUDNIENIA
              "baseCVData.position": req.body.cvData.position,
              "baseCVData.disposition": req.body.cvData.disposition,
              "baseCVData.location": req.body.cvData.location,
              "baseCVData.availability": req.body.cvData.availability,
              "baseCVData.salary": req.body.cvData.salary,
              "baseCVData.employment": req.body.cvData.employment,
              // DOŚWIADCZENIE ZAWODOWE
              "baseCVData.experience": req.body.cvData.experience,
              // EDUKACJA
              "baseCVData.education": req.body.cvData.education,
              // KURSY
              "baseCVData.courses": req.body.cvData.courses,
              // JĘZYKI
              "baseCVData.languages": req.body.cvData.languages,
              // UMIEJĘTNOŚCI
              "baseCVData.skills.drivingLicence.checked": req.body.cvData.drivingLicenceChecked,
              "baseCVData.skills.drivingLicence.description": req.body.cvData.drivingLicenceDescription,
              "baseCVData.skills.knownPrograms.checked": req.body.cvData.knownProgramsChecked,
              "baseCVData.skills.knownPrograms.description": req.body.cvData.knownProgramsDescription,
              "baseCVData.skills.programmingSkills.checked": req.body.cvData.programmingSkillsChecked,
              "baseCVData.skills.programmingSkills.description": req.body.cvData.programmingSkillsDescription,
              "baseCVData.skills.devicesUsage.checked": req.body.cvData.devicesUsageChecked,
              "baseCVData.skills.devicesUsage.description": req.body.cvData.devicesUsageDescription,
              "baseCVData.skills.permissions.checked": req.body.cvData.permissionsChecked,
              "baseCVData.skills.permissions.description": req.body.cvData.permissionsDescription,
              "baseCVData.skills.knownRegulations.checked": req.body.cvData.knownRegulationsChecked,
              "baseCVData.skills.knownRegulations.description": req.body.cvData.knownRegulationsDescription,
              "baseCVData.skills.otherSkills.checked": req.body.cvData.otherSkillsChecked,
              "baseCVData.skills.otherSkills.description": req.body.cvData.otherSkillsDescription,
              // MOCNE STRONY
              "baseCVData.advantages": req.body.cvData.advantages,
              "baseCVData.selectedAdvantagesIndex": req.body.cvData.selectedAdvantagesIndex,
              "baseCVData.hobby": req.body.cvData.hobby
            },
            $currentDate: { lastModified: true }
          }          
          )                         
          .then(updatedUser => {
            res.status(200).json({
              message: "Aktualizacja danych użytkownika zakończona!",
              result: updatedUser                
            });
              console.log(updatedUser);
              console.log("Updated!")
            })
            .catch(err => {
              res.status(500).send();
              console.log(err);
            })
        });      

    // ZAPISYWANIE ZDJĘCIA
    router.post("/cv/photo", multer({storage: storage}).single("image"), (req, res, next) => {
      if (req.file) {
        const url = req.protocol + '://' + req.get("host");        
        User.findOne({ email: req.body.loggedUserEmail })
        .then(user => {
          if (!user) {
            return res.status(401).json({
              message: "Nie odnaleziono takiego użytkownika!"
            });          
          }
          console.log("Ścieżka do zdjęcia: " + (url + "/images/" + req.file.filename));
          user.baseCVData.photoPath = url + "/images/" + req.file.filename;          
          user.save()
            .then(updatedUser => {
              res.status(201).json({
                message: "Zapisano zdjęcie użytkownika!",
                photoPath: updatedUser.baseCVData.photoPath
              });
              console.log(updatedUser); 
            }) 
        })
      } else {
        let imagePath = req.body.imagePath;        
        User.findOne({ email: req.body.loggedUserEmail })
        .then(user => {
          if (!user) {
            return res.status(401).json({
              message: "Nie odnaleziono takiego użytkownika!"
            });          
          }          
          user.baseCVData.photoPath = imagePath;          
          user.save()
            .then(updatedUser => {
              res.status(201).json({
                message: "Zapisano zdjęcie użytkownika!",
                photoPath: updatedUser.baseCVData.photoPath
              });
              console.log(updatedUser); 
            }); 
        });
      };      
    });

    // POBIERANIE ZAWARTOŚCI BAZOWEGO CV
    router.get("/cv/:email", (req, res, next) => {
      // console.log(req.body);
      User.findOne({ email: req.params.email })
        .then(user => {
          if (!user) {
            return res.status(401).json({
              message: "Nie odnaleziono takiego użytkownika!"
            });                  
          }
          res.status(200).json({
            message: "Pobrano dane zalogowane użytkownika!",
            data: user
          });
          console.log(user);  
        });
      });

  module.exports = router;