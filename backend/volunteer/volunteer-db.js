const { User } = require('../user-auth/user-auth-db');

const Volunteer = User;

/* Object containing functions we will use to interact with the DB */
const volunteerFns = {
   getVolunteer: async (volunteerId) => {
      const volunteer = await Volunteer.findById(volunteerId, 'volunteer').exec();
      return volunteer?.volunteer;
   },
   getUser: async (volunteerId) => {
      const volunteer = await Volunteer.findById(volunteerId).exec();
      return volunteer;
   },
   getAllVolunteers: async () => {
      return await Volunteer.find({}).exec();
   },
   saveVolunteerCompletedHours: async (volunteerId, hours) => {
      return Volunteer
         .findByIdAndUpdate(volunteerId, { completedHours: hours })
         .exec();
   },
   saveVolunteerNotCompletedHours: async (volunteerId, hours) => {
      return Volunteer
         .findByIdAndUpdate(volunteerId, { nonCompletedHours: hours })
         .exec();
   },
   deleteVolunteer: async (toDeleteVol) => {
      const val = await Volunteer.deleteOne({_id: toDeleteVol._id});
      return val;
    },
    postVolunteer: async (newVolunteer) => {
      const newPost = new Volunteer(newVolunteer);
      const savedDoc = await newPost.save();
      return savedDoc === newPost;
    },
    updateVolunteer: async (cognitoId, firstname, lastname) => {
      return await Volunteer.updateOne({cognito_id: cognitoId}, {$set: {firstName: firstname, lastName: lastname}})
          .exec();
    },
};

module.exports = {
   Volunteer: Volunteer,
   volunteerFns: volunteerFns,
};
