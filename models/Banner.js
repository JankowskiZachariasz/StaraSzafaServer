const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({

  destinationTag: {
    type: String,
    required: true
  },
  firstLine: {
    type: String,
    required: true
  },
  SecondLine: {
    type: String,
    required: false
  },
});


const Banner = mongoose.model('Banner', BannerSchema);

module.exports = Banner;
