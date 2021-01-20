const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const mongoose = require('mongoose')

mongoose.connect(process.env.dbUser_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const userSchema = new mongoose.Schema ({
    username: String,
    name: String,
    role: {
        type: String,
        enum: ['Administrator', 'Volunteer', 'Hospital']
    },
    googleId: String,
    secret: String
});

const User = new mongoose.model("User", userSchema);

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello world!')
})

app.listen(3001)
