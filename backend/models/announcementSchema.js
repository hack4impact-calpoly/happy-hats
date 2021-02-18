const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  date: Date 
}, {collection: "announcements"})

const Announcement = mongoose.model('announcements', announcementSchema)

module.exports = Announcement