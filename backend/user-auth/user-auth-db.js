const mongoose = require('mongoose'); 
const userSchema = require('./models/user-auth-schema');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

module.exports = {
  User: User,
};
