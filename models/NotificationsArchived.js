const mongoose = require('mongoose');

const NotificationArchivedSchema = new mongoose.Schema({

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
});


const NotificationArchived = mongoose.model('NotificationArchived', NotificationArchivedSchema);

module.exports = NotificationArchived;
