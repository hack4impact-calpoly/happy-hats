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
};

module.exports = {
   Volunteer,
   volunteerFns,
};
