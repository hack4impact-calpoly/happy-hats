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
  getUserFromEmail: async (_email) => {
    const val = await User.findOne({ 
      email : _email 
    });
    return val;
  },
  addUser: async (user) => {
    const newUser = new User(user);
    const savedDoc = await newUser.save();
    return savedDoc === newUser;
  },
  getAllUsers: async () => {
    return await User.find({}).exec();
 },
 saveUserApproved: async (_id) => {
    await User.findByIdAndUpdate(_id, { 
      approved: true, 
      decisionMade: true })
    .exec();
  },
  saveUserRejected: async (_id) => {
    await User.findByIdAndUpdate(_id, { 
      approved: false, 
      decisionMade: true })
    .exec();
  }
};

module.exports = {
  User: User,
  userFns,
};
