const mongoose = require('mongoose');

const ReservationArchivedSchema = new mongoose.Schema({
  status: {//(1,2, 5)->active reservation (3-bought, 4-cancelledShop, 6-cancelledClient, 7-notBought...
    type: String,//8-notPickedUpArchived, 9-cancelledClientArchived
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
  oldId: {
    type: String,
    required: true
  },
});

const ReservationArchived = mongoose.model('ReservationArchived', ReservationArchivedSchema);

module.exports = ReservationArchived;
