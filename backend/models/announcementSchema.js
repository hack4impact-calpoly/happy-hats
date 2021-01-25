const mongoose = require('mongoose')

//change date to different data type if we find a better one
const announcementSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  date: String 
}, {collection: "announcements"})

const Announcement = mongoose.model('announcements', announcementSchema)

module.exports = Announcement
