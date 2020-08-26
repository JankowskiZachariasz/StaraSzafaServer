const mongoose = require('mongoose');

const ReservationEventSchema = new mongoose.Schema({
  status: {//1-request,2-reserved (3,4,5,6,7,8,9)-> archieved
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  reservation: {
    type: String,
    required: true
  }
});

const ReservationEvent = mongoose.model('ReservationEvent', ReservationEventSchema);

module.exports = ReservationEvent;
