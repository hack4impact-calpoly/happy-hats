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
  getAnnouncementByDate: async () => {
    const val = await Announcement.find({date: date})
    return val;
  },
  getAnnouncementByAuthor: async () => {
    const val = await Announcement.find({author: author})
    return val;
  },
  getAnnouncementByTitle: async () => {
    const val = await Announcement.find({title: title})
    return val;
  },
  postAnnouncement: async (newAnnouncement) => {
    const newPost = new Announcement(newAnnouncement);
    const savedDoc = await newPost.save();
    return savedDoc === newPost;
  },
};

module.exports = {
  Announcement: Announcement,
  announcementFns: announcementFns,
}

