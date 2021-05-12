const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const userSchema = require('./models/user-auth-schema');
const {User} = require('./user-auth-db');
const {isUserAuthenticated} = require('../middleware');

require('dotenv').config();
module.exports = (app) => {
   app.use(
      session({
         secret: process.env.SESSION_SECRET,
         resave: false,
         saveUninitialized: false,
      })
   );

   app.use(passport.initialize());
   app.use(passport.session());

   passport.use(User.createStrategy());

   passport.serializeUser(function (user, done) {
      done(null, user.id);
   });

   passport.deserializeUser(function (id, done) {
      User.findById(id, function (err, user) {
         done(err, user);
      });
   });

   passport.use(
      new GoogleStrategy(
         {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL:
               'http://localhost:${process.env.PORT}/auth/google/callback',
            userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
         },
         function (accessToken, refreshToken, profile, cb) {
            // Use profile info to check if user is registered in DB
            User.findOrCreate(
               { googleId: profile.id, username: profile.id },
               function (err, user) {
                  return cb(err, user);
               }
            );
         }
      )
   );

   // PATHS
   app.get('/', (req, res) => {
      res.send('---');
   });

   app.get(
      '/auth/google',
      passport.authenticate('google', { scope: ['profile'] })
   );

   app.get(
      '/auth/google/callback',
      passport.authenticate('google', {
         failureRedirect: 'http://localhost:3000/failedLogin',
      }),
      function (req, res) {
         // Successful authentication, redirect secrets.
         res.redirect('http://localhost:3000/home');
      }
   );

   app.get('/logout', function (req, res) {
      res.redirect('http://localhost:3000/');
   });
};

