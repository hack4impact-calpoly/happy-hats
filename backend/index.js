const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Con    tent-Type, Accept");
  next();
});

mongoose.connect("mongodb+srv://parker:h4i@cluster0.omjjl.mongodb.net/happyhats?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => console.log('Connected to MongoDB'))

const announcement = require('./models/announcementSchema');

app.use(bodyParser.json())

app.use((req, res, next) => {
  req.timestamp = new Date()
  console.log(req.timestamp)
  next()
})

app.get('/', (request, response) => {
  response.status(200)
  response.send('Hello from Announcement')
  
})

app.get('/api/announcement', async (req, res) => {
  res.status(200)
  a = await announcement.find({})
  console.log(a)
  res.json(a)
})

app.get('/api/announcement/t/:title', async (req, res) => {
  const title = req.params.title
  res.status(200)
  let a = await announcement.find({title: title})
  console.log(a)
  res.json(a)
})

app.get('/api/announcement/a/:author', async (req, res) => {
  const author = req.params.author

  res.status(200)
  let a = await announcement.find({author: author})
  console.log(a)
  res.json(a)
})

app.get('/api/announcement/d/:date', async (req, res) => {
  const date = req.params.date
  res.status(200)
  let a = await announcement.find({date: date})
  console.log(a)
  res.json(a)
})

app.post('/api/announcement', async (request, response) => {  
  const t = request.body.title
  const c = request.body.content
  const a = request.body.author
  const d = request.body.date
  
  response.status(200)

  announcement.create({title: t, content: c, author: a, date: d});

  console.log("New announcement " + t + " posted by " + a)
  response.send("New announcement " + t + " posted by " + a)
})

app.use(express.static('public'))

app.listen(3001)
