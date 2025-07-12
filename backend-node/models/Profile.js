const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  location: { type: String },
  skillsOffered: [{ type: String }],
  skillsWanted: [{ type: String }],
  availability: { type: String },
  public: { type: Boolean, default: true },
  photo: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema); 