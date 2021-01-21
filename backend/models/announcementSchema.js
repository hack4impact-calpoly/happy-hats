const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema({
  title: String,
  content: String,
  id: String,
  author: String,
  data: String
}, {collection: "announcements"})

const Announcement = mongoose.model('announcements', announcementSchema)

module.exports = Announcement
