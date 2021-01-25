const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Con    tent-Type, Accept");
    next();
});

mongoose.connect("mongodb+srv://plandsman:MongoDB1122!@cluster0.omjjl.mongodb.net/happyhats?retryWrites=true&w=majority", {
useNewUrlParser: true,
 useUnifiedTopology: true,
 useFindAndModify: false,
 useCreateIndex: true
}).then(() => console.log('Connected to MongoDB'))

const annoucement = require('../model/announcementSchema');

app.use(bodyParser.json())

app.use((req, res, next) => {
    req.timestamp = new Date()
    console.log(req.timestamp)
    next()
})

const getAllAnnoucements = async (name) => {
    return await annoucement.find({})
}

const getAnnouncementByTitle = async (title) => {
    return await annoucement.find({title: title})
}

const getAnnouncementByAuthor = async (author) => {
    return await annoucement.find({author: author})
}

const getAnnouncementByDate = async (date) => {
    return await annoucement.find({date: date})
}
  
app.get('/api/announcement', async (req, res) => {
    res.status(200)
    let announcements
    announcements = await getAllAnnoucements()
    res.json(annoucements)
})

app.get('/api/recipe/:title', async (req, res) => {
    const title = req.params.title
  
    res.status(200)
    let announcement
    announcement = await getSpecifiedRecipe(title)
    res.json(announcement)
})

app.get('/api/recipe/:author', async (req, res) => {
    const author = req.params.author
  
    res.status(200)
    let announcement
    announcement = await getSpecifiedRecipe(author)
    res.json(announcement)
})

app.get('/api/recipe/:date', async (req, res) => {
    const date = req.params.date
  
    res.status(200)
    let announcement
    announcement = await getSpecifiedRecipe(date)
    res.json(announcement)
})

app.use(express.static('public'))

app.listen(3001)
