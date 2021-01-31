const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
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

app.get('/', (req, res) => {
  res.send('Hello world!')
})

require('./calendar/calendar-api')(app);

const PORT = Number(process.env.PORT);

(async () => {
  await MongooseConnector.connect();

  // Satisfy react default port
  app.listen(PORT, 'localhost', () => {
      console.log(`Listening on port ${PORT}`);
  });
})();
