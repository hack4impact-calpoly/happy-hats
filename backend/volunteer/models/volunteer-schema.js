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
   },
   {
      collection: COLLECTION_NAME,
   });

module.exports = {
   volunteerSchema,
   COLLECTION_NAME,
};
