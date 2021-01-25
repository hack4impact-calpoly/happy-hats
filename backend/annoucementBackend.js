const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Con    tent-Type, Accept");
    next();
});

mongoose.connect("mongodb+srv://mreed:<password>@cluster0.omjjl.mongodb.net/<happyhats?retryWrites=true&w=majority", {
useNewUrlParser: true,
 useUnifiedTopology: true,
 useFindAndModify: false,
 useCreateIndex: true
}).then(() => console.log('Connected to MongoDB'))

const recipe = require('../model/announcementSchema');

app.use(bodyParser.json())

app.use((req, res, next) => {
    req.timestamp = new Date()
    console.log(req.timestamp)
    next()
})