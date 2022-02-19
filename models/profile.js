const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user_id: {
    type: String,
    unique: true,
    required: true
  },
  elo: {
    type: Number,
    default: 800
  }
}, { timestamps: true });

profileSchema.index({ email: 1, password: 1 });

mongoose.pluralize(null);
const model = mongoose.model('Profile', profileSchema);

module.exports = model;