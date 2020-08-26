const mongoose = require('mongoose');

const ClothSchema = new mongoose.Schema({
  status: {//1-beingAdded, 2-forSale, 3-reserved, (it should never be '4')4-archieved 
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
  dateAdded: {
    type: String,
    required: true
  },
});

const Cloth = mongoose.model('Cloth', ClothSchema);

module.exports = Cloth;
