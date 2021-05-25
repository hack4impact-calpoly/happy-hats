const mongoose = require('mongoose'); 
const userSchema = require('./models/user-auth-schema');

const User = mongoose.model('User', userSchema, 'users');

const userFns = {
  getUserFromCognitoId: async (cognitoId) => {
    const val = await User.findOne({
      cognito_id: cognitoId,
    });
    return val;
  },
  addUser: async (user) => {
    const newUser = new User(user);
    const savedDoc = await newUser.save();
    return savedDoc === newUser;
  },
};

module.exports = {
  User: User,
  userFns,
};
