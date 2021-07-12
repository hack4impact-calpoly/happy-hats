const mongoose = require('mongoose');

const eventVolunteerSchema = new mongoose.Schema({
    start: { type: Date, required: false },
    end: { type: Date, required: false },
    volunteer: {
        type: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            email: { type: String, required: true },
            id: { type: mongoose.Types.ObjectId, required: true }
        },
        required: true,
    },
    usingDefaultTimes: { type: Boolean, required: true },
    approved: { type: Boolean, required: false },
    decisionMade: { type: Boolean, required: false, default: false },
});

module.exports = {
    eventVolunteerSchema,
}