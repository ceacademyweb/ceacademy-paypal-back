const mongoose = require('mongoose');
const dayjs = require('dayjs');

const now = dayjs();
const until = now.add(1, 'month');

const usersubsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  telegram: {
    type: String,
    required: false,
    unique: true,
  },
  subscribed: {
    type: Boolean,
    default: false,
  },
  subscribedAt: {
    type: Date,
    default: now,
  },
  subscribedUntil: {
    type: Date,
    default: until,
  },
  payId: {
    type: String,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

const Usersubs = mongoose.model('Usersubs', usersubsSchema);

module.exports = Usersubs;
