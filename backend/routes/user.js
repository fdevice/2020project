const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const router = express.Router();

router.post("/signup", (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
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

  router.get("/:email", (req, res, next) => {
    let hasSavedCV;
    User.findOne({ email: req.params.email })
      .then(user => {
        if (!user.documentPath) {   
          console.log(hasSavedCV);       
          hasSavedCV = false;
          console.log(hasSavedCV);
          console.log("Brak zapisanego CV");
          res.status(200).json({
            message: "Brak zapisanego CV!",
            hasSavedCV: hasSavedCV            
          });
        } else {
          hasSavedCV = true; 
          console.log(hasSavedCV);
          res.status(200).json({
            message: "Odnaleziono zapisane CV!",
            hasSavedCV: hasSavedCV
          })
        }               
      })      
      .catch(err => {
        console.log(err);
      });
  });

  module.exports = router;