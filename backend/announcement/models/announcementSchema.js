const mongoose = require("mongoose");
const COLLECTION_NAME = "announcements";

const announcementSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    author: String,
    date: Date,
  },
  { collection: COLLECTION_NAME }
);

module.exports = {
  announcementSchema: announcementSchema,
  COLLECTION_NAME: COLLECTION_NAME,
};
