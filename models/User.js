const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  AdminStatus: {
    type: Boolean,
    required: true
  },
  PasswordRemindCode: {
    type: String,
    required: true
  },
  FirstName: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  limit: {
    type: String,
    default: 2
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
