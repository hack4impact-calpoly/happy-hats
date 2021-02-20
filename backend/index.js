const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
const MongooseConnector = require('./db-helper');
const app = express()
const mongoose = require('mongoose')
<<<<<<< HEAD
const bodyParser = require('body-parser')
=======


// Load .env into environment
dotenv.config();

app.use((req, res, next) => {
  bodyParser.json()(req, res, err => {
      if (err) {
          console.log('Bad JSON formatting for body');
          return res.sendStatus(400); // Bad request
      }

      next();
  });
});
>>>>>>> 9c9934c4f8fa3cc9015a733248e25f382dfc28a8

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

<<<<<<< HEAD
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
  
=======
require('./user-auth/user-auth-api')(app);
require('./calendar/calendar-api')(app);

app.get('*', (req, res) => {
  res.send('404 Page not found')
>>>>>>> 9c9934c4f8fa3cc9015a733248e25f382dfc28a8
})

const PORT = Number(process.env.PORT);
if (!PORT) {
  console.error('No PORT environment var found... add it to your .env file!');
  process.exit(1);
}

(async () => {
  await MongooseConnector.connect();

  // Satisfy react default port
  app.listen(PORT, 'localhost', () => {
      console.log(`Listening on port ${PORT}`);
  });
})();
