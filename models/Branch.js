const mongoose = require('mongoose');

const BranchSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true
  },
  shortName: {
    type: String,
    required: true
  }
});

const Branch = mongoose.model('Branch', BranchSchema);

module.exports = Branch;
