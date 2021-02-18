const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('./.env');
const MongooseConnector = require('./db-helper');
const app = express()

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

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

mongoose.connect("mongodb+srv://anna:h4i@cluster0.omjjl.mongodb.net/happyhats?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => console.log('Connected to MongoDB'))

const announcement = require('./models/announcementSchema');

app.use(bodyParser.json())

app.use((req, res, next) => {
  req.timestamp = new Date()
  next()
})

app.get('/api/announcement', async (req, res) => {
  const date = req.query.date
  const author = req.query.author
  const title = req.query.title

  if(date !== undefined){
    let announcements = await announcement.find({date: date})
    res.status(200).json(announcements)
  }
  else if(author !== undefined){
    let announcements = await announcement.find({author: author})
    res.status(200).json(announcements)
  }
  else if(title !== undefined){
    let announcements = await announcement.find({title: title})
    res.status(200).json(announcements)
  }
  else{
    announcements = await announcement.find({})
    res.status(200).json(announcements)
  }
  
})

// app.get('/api/announcement/t/:title', async (req, res) => {
//   const title = req.params.title
//   let a = await announcement.find({title: title})
//   res.status(200).json(a)
// })

// app.get('/api/announcement/a/:author', async (req, res) => {
//   const author = req.params.author
//   let a = await announcement.find({author: author})
//   res.status(200).json(a)
// })

// app.get('/api/announcement/d/:date', async (req, res) => {
//   const date = req.params.date
//   let a = await announcement.find({date: date})
//   res.status(200).json(a)
// })

app.get('/', (req, res) => {
  res.send('Hello world!')
})

require('./calendar/calendar-api')(app);

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
