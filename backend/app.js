const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");

const app = express();

mongoose
  .connect(        
    "mongodb+srv://Dominik:lYAmieK4aw42OJkR@cluster0.skyji.mongodb.net/?retryWrites=true&w=majority",
    // "mongodb+srv://dominik:" + process.env.MONGO_ATLAS_PW + "@cluster0.usbpw.mongodb.net/test?retryWrites=true&w=majority",
    { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
     }
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((err) => {
    console.log(err);
    console.log("Connection failed!");
  });

    // Zezwalanie na ominięcie zabezpieczeń CORS
  app.use((req, res, next) => { 
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PATCH, PUT, DELETE"
    );
    next();
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  // app.use("/images", express.static(path.join(__dirname, "images")));
  app.use("/images", express.static(path.join("images")));
  app.use("/documents", express.static(path.join(__dirname, "documents")));
  app.use("/", express.static(__dirname));

  

  app.use("/api/user", userRoutes);
  // app.use((req, res, next) => {
  //   res.sendFile(path.join(__dirname,"index.html"));
  // })

  module.exports = app;  