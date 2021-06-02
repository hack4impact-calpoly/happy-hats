const mongoose = require('mongoose');
const COLLECTION_NAME = 'volunteers';

const volunteerSchema = new mongoose.Schema(
   {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      completedHours: { type: Number, required: true, default: 0 },
      scheduledHours: { type: Number, required: true, default: 0 },
      nonCompletedHours: { type: Number, required: true, default: 0 },
      approved: {type: Boolean, required: true},
      decisionMade: {type: Boolean, required: true},
      userId: { type: mongoose.ObjectId, required: true },
   },
   {
      collection: COLLECTION_NAME,
   });

module.exports = {
   volunteerSchema: volunteerSchema,
   COLLECTION_NAME: COLLECTION_NAME,
};
