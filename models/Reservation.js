const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  status: {//1-request,2-reserved (3,4,5,6,7,8,9)-> archieved
    type: String,
    required: true
  },
  cloth: {
    type: String,
    required: true
  },
  reserver: {
    type: String,
    required: true
  },
  reservee: {
    type: String,
    required: false
  },
  lastEventDate: {
    type: String,
    required: true
  },
  ExpiryDate: {
    type: String,
    required: true
  },
  shopId: {
    type: String,
    required: true
  },
});

const Reservation = mongoose.model('Reservation', ReservationSchema);

module.exports = Reservation;
