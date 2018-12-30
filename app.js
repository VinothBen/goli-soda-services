var http = require('http'),
  path = require('path'),
  methods = require('methods'),
  express = require('express'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  cors = require('cors'),
  passport = require('passport'),
  errorhandler = require('errorhandler'),
  mongoose = require('mongoose');

var isProduction = process.env.NODE_ENV === 'production';
var MONGODB_URI = "mongodb://vinothben:adminben123@ds259111.mlab.com:59111/mock_db";

/* 
 * Mongoose by default sets the auto_reconnect option to true.
 * We recommend setting socket options at both the server and replica set level.
 * We recommend a 30 second connection timeout because it allows for 
 * plenty of time in most operating environments.
 */
var options = {
  server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
  replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }
};
// Create global app object
var app = express();

app.use(cors());

// Normal express config defaults
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('method-override')());
app.use(express.static(__dirname + '/public'));

app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

if (!isProduction) {
  app.use(errorhandler());
}

if (isProduction) {
  mongoose.connect(MONGODB_URI, options);
} else {
  mongoose.connect(MONGODB_URI, options).then(()=>{
    console.log("Db Connected Successfully!");
  }, (err)=>{
    console.log("Db Connection Failed!");
  });
  // var conn = mongoose.connection;
  // conn.on('error', console.error.bind(console, 'DB connection error:'));
  mongoose.set('debug', true);
}

require('./models/InHouseData');
require('./models/Users');
require('./models/SupplyData');
require('./models/BottleReturns');
// require('./models/User');
// require('./models/Article');
// require('./models/Comment');
// require('./config/passport');
app.use(require('./routes'));

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');
/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('URL Not Found!');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use(function (err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({
      'errors': {
        message: err.message,
        error: err
      }
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    'errors': {
      message: err.message,
      error: {}
    }
  });
});

// finally, let's start our server...
var server = app.listen(process.env.PORT || 3010, function () {
  console.log('Listening on port ' + server.address().port);
});
