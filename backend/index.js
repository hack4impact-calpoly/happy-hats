const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const mongoose = require('mongoose')
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

require('dotenv').config();

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.dbUser_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, () => console.log('Connected to DB...'));

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

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  })
})

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3001/auth/google/callback",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    // Use profile info to check if user is registered in DB
    //console.log(profile.id + ", " + profile.displayName)
    User.findOrCreate({ googleId: profile.id, username: profile.id }, function (err, user) {
      return cb(err, user);
    })
  }
))

app.use(bodyParser.json())


// PATHS
app.get('/', (req, res) => {
  res.send('---')
})

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
)

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:3000/failedLogin" }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect("http://localhost:3000/home")
  }
)

app.get("/logout", function(req, res){
  res.redirect("/")
})

app.get('*', (req, res) => {
  res.send('404 Page not found')
})


PORT = process.env.PORT | 3001

app.listen(PORT, ()=>console.log('Listening on port ' + PORT))
