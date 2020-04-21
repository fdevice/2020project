const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const router = express.Router();

  
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
    router.put("/cv", (req, res, next) => {
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