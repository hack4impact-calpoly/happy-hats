const mongoose = require('mongoose');
const { announcementSchema, COLLECTION_NAME } = require('./models/announcementSchema');

/* Create announcement model */
const Announcement = mongoose.model('Announcement', announcementSchema, COLLECTION_NAME);

/* Object containing functions we will use to interact with the DB */
const announcementFns = {
  getAllAnnouncements: async () => {
      const val = await Announcement.find({});
      return val;
  },
  getAnnouncementByDate: async (date) => {
    const val = await Announcement.find({date: date})
    return val;
  },
  getAnnouncementByAuthor: async (author) => {
    const val = await Announcement.find({author: author})
    return val;
  },
  getAnnouncementByTitle: async (title) => {
    const val = await Announcement.find({title: title})
    return val;
  },
  postAnnouncement: async (newAnnouncement) => {
    const newPost = new Announcement(newAnnouncement);
    const savedDoc = await newPost.save();
    return savedDoc === newPost;
  },
  deleteAnnouncement: async(toDelete) => {
    const val = await Announcement.remove({title: toDelete.title})
    return val;
  }
};

module.exports = {
  Announcement: Announcement,
  announcementFns: announcementFns,
}

