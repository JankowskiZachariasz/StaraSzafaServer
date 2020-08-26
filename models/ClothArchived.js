const mongoose = require('mongoose');

const ClothArchivedSchema = new mongoose.Schema({
  status: {//(1,2,3)-> active (it should always be '4')4-archieved 
  type: String,
  required: true
},
photos: {
  type: Array,
  required: true
},
tags: {
  type: Array,
  required: true
},
name: {
  type: String,
  required: true
},
price: {
  type: String,
  required: true
},
code: {
  type: String,
  required: true
},
size: {
  type: String,
  required: false
},
brand: {
  type: String,
  required: false
},
fabric: {
  type: String,
  required: false
},
shopId: {
  type: String,
  required: true
},
reservationId: {
  type: String,
  required: false
},
});

const ClothArchived = mongoose.model('ClothArchived', ClothArchivedSchema);

module.exports = ClothArchived;
