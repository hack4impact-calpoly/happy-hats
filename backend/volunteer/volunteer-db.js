const { User } = require("../user-auth/user-auth-db");

const Volunteer = User;

/* Object containing functions we will use to interact with the DB */
const volunteerFns = {
  getVolunteer: async (volunteerId) => {
    const volunteer = await Volunteer.findById(volunteerId, "volunteer").exec();
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
    return Volunteer.findByIdAndUpdate(volunteerId, {
      completedHours: hours,
    }).exec();
  },
  saveVolunteerNotCompletedHours: async (volunteerId, hours) => {
    return Volunteer.findByIdAndUpdate(volunteerId, {
      nonCompletedHours: hours,
    }).exec();
  },
  deleteVolunteer: async (toDeleteVol) => {
    const val = await Volunteer.deleteOne({ _id: toDeleteVol._id });
    return val;
  },
  postVolunteer: async (newVolunteer) => {
    const newPost = new Volunteer(newVolunteer);
    const savedDoc = await newPost.save();
    return savedDoc === newPost;
  },
  updateVolunteer: async (cognitoId, firstname, lastname) => {
    return await Volunteer.updateOne(
      { cognito_id: cognitoId },
      { $set: { firstName: firstname, lastName: lastname } }
    ).exec();
  },
  saveVolunteerDisabled: async (_id) => {
    return await User.findByIdAndUpdate(
      _id,
      {
        approved: false,
        decisionMade: true,
      },
      {
        new: true,
      }
    ).exec();
  },
  addDefaultScheduledHoursToVolunteer: async (vId, hours) => {
    return await Volunteer.findByIdAndUpdate(
      vId,
      {
        $inc: {
          scheduledHours: hours,
        }
      }
    ).exec();
  },
  addCustomScheduledHoursToVolunteer: async (vId, originalHours, hours) => {
    return await Volunteer.findByIdAndUpdate(
      vId,
      {
        $set: {
          scheduledHours: scheduledHours - originalHours + hours,
        }
      }
    ).exec();
  },
  subtractCompletedHoursFromVolunteer: async (vId, hours) => {
    const decrementHours = hours * -1
    return await Volunteer.findByIdAndUpdate(
      vId,
      {
        $inc: {
          scheduledHours: decrementHours,
        },
        $inc: {
          nonCompletedHours: hours,
        }
      }
    ).exec();
  },
  reapproveNonCompletedHoursFromVolunteer: async (vId, hours) => {
    const decrementHours = hours * -1
    return await Volunteer.findByIdAndUpdate(
      vId,
      {
        $inc: {
          scheduledHours: hours,
        },
        $inc: {
          nonCompletedHours: decrementHours,
        }
      }
    ).exec();
  },
  addCompletedHoursToVolunteers: async (volunteerIdAndHours) => {
    const promises = volunteerIdAndHours.map(([vId, hours]) => {
      const decrementHours = hours * -1
      return Volunteer.findByIdAndUpdate(
        vId,
        {
          $inc: {
            completedHours: hours,
          },
          $inc: {
            scheduledHours: decrementHours,
          }
        }
      ).exec();
    });

    const settledPromises = await Promise.allSettled(promises);

    const successfulIds = [];
    const failedIds = [];
    settledPromises.forEach((prom, idx) => {
      const vId = volunteerIdAndHours[idx][0];
      if (prom.status === 'fulfilled' && prom.value) {
        successfulIds.push(vId);
      } else {
        failedIds.push(vId);
      }
    });

    return [successfulIds, failedIds];
  },
};

module.exports = {
  Volunteer: Volunteer,
  volunteerFns: volunteerFns,
};
