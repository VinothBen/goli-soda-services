var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('Users');
var CryptoJS = require("crypto-js");
var secret = require('../config').secret;

passport.use(new LocalStrategy({
  usernameField: 'user[username]',
  passwordField: 'user[password]'
}, function (username, password, done) {
  var bytes = CryptoJS.AES.decrypt(password, secret);
  var passwordDecrypted = bytes.toString(CryptoJS.enc.Utf8);
  User.findOne({ username: username }).then(function (user) {
    if (!user || !user.validPassword(passwordDecrypted)) {
      return done(null, false, { errors: { message: 'Username or Password is invalid' } });
    }
    return done(null, user);
  }).catch(done);
}));

