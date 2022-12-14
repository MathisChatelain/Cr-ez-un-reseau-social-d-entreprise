const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default:"false", required: false },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('user', userSchema);