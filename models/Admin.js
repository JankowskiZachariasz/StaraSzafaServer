const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  BranchId: {
    type: String,
    required: true
  }
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;
