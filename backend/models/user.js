const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  surname: { type: String },
  contactEmail: { type: String },
  phone: { type: String },
  documentPath: { type: String }    //ścieżka do zapisanego CV w pliku pdf
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);