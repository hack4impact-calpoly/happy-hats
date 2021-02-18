const mongoose = require('mongoose');
const {COLLECTION_NAME, volunteerSchema} = require('./models/volunteer-schema');

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
      // TODO: Save Completed Hours
   },
   saveVolunteerNotCompletedHours: async (volunteerId, hours) => {
      // TODO: Save Not Completed Hours
   },
};

module.exports = {
   Volunteer,
   volunteerFns,
};
