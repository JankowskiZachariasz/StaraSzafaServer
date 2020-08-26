const mongoose = require('mongoose');

const TagGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  children: {
    type: Array,
    required: true
  }
});

const TagGroup = mongoose.model('TagGroup', TagGroupSchema);

module.exports = TagGroup;
