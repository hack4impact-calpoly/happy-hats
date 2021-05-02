const mongoose = require('mongoose');

const eventVolunteerSchema = new mongoose.Schema({
    start: { type: Date, required: false },
    end: { type: Date, required: false },
    volunteer: { type: mongoose.ObjectId, required: true },
    usingDefaultTimes: { type: Boolean, required: true },
    approved: { type: Boolean, required: false },
    decisionMade: { type: Boolean, required: false, default: false },
});

module.exports = {
    eventVolunteerSchema,
}