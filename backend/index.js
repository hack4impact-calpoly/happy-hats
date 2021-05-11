const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
const MongooseConnector = require('./db-helper');
// const COGNITO_URL = `https://cognito-idp.${awsconfig.aws_project_region}.amazonaws.com/`;
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

// app.use((req, res, next) => { //added code -- stack overflow
//   try {
//     const accessToken = req.headers.authorization.split(" ")[1];

//     const { data } = await axios.post(
//         COGNITO_URL,
//         {
//             AccessToken: accessToken
//         },
//         {
//             headers: {
//                 "Content-Type": "application/x-amz-json-1.1",
//                 "X-Amz-Target": "AWSCognitoIdentityProviderService.GetUser"
//             }
//         }
//     )

//     req.user = data;
//     next();
//   } catch (error) {
//       return res.status(401).json({
//           message: 'Auth failed'
//       });
//   }
// });

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
  res.send('Hello world!')
})

require('./user-auth/user-auth-api')(app); 
require('./calendar/calendar-api')(app);
require('./announcement/announcement-api')(app);
require('./volunteer/volunteer-api')(app);


app.get('*', (req, res) => {
  res.send('404 Page not found')
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
