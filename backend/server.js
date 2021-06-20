const express = require('express')
const dotenv = require('dotenv');
const MongooseConnector = require('./db-helper');
const app = express()
// Load .env into environment
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.get('/test/get', (req, res) => {
  res.send('Hello world!')
})

require('./user-auth/user-auth-api')(app); 
require('./calendar/calendar-api')(app);
require('./announcement/announcement-api')(app);
require('./volunteer/volunteer-api')(app);

app.get('*', (req, res) => {
  res.status(400).send('Page not found');
});

(async () => {
  await MongooseConnector.connect();

  // Satisfy react default port
  if (process.argv.includes('dev')) {
    const PORT = Number(process.env.PORT);
    if (!PORT) {
      console.error('No PORT environment var found... add it to your .env file!');
      process.exit(1);
    }

    app.listen(PORT, () => console.log(`server running on port ${PORT}`));
  }
})();

module.exports = app;
