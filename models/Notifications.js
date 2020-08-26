const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({


  read: {
    type: Boolean,
    required: true
    },
  userId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  reservationId: {
    type: String,
    required: true
  },
});


const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
