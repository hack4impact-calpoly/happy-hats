const mongoose = require('mongoose');
const {
   COLLECTION_NAME,
   volunteerSchema
} = require('./models/volunteer-schema');

/* Create calendar model */
const Volunteer = mongoose.model('Volunteer', volunteerSchema, COLLECTION_NAME);

/* Object containing functions we will use to interact with the DB */
const volunteerFns = {
   getVolunteer: async (volunteerId) => {
      const volunteer = await Volunteer.findById(volunteerId, 'volunteer').exec();
      return volunteer?.volunteer;
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
   deleteVolunteer: async(toDeleteVol) => {
      const val = await Volunteer.remove({_id: toDeleteVol._id});
      return val;
    },
    postVolunteer: async (newVolunteer) => {
      const newPost = new Volunteer(newVolunteer);
      const savedDoc = await newPost.save();
      return savedDoc === newPost;
    },
    updateVolunteer: async (aData) => {
       console.log("in updateVolunteer");
       console.log(Volunteer.find({cognito_id: aData.id}))
       return Volunteer.updateOne({cognito_id: aData.id}, {$set: {firstName: aData.firstName}})
            .updateOne({cognito_id: aData.id}, {$set: {lastName: aData.lastName}})
            .exec();
    }
};

module.exports = {
   Volunteer: Volunteer,
   volunteerFns: volunteerFns,
};
