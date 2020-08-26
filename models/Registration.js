const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  FirstName: {
    type: String,
    required: true
  },
  LastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Registration = mongoose.model('Registration', RegistrationSchema);

module.exports = Registration;
