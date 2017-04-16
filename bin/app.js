var express = require('express');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var mongoose = require('mongoose');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');

var index = require('../routes/profile');
var auth = require('../routes/auth');

// Seed the database
var Weapons = require('../models/seeds/seed.js');

var User = require('../models/users.js');
var Weapon = require('../models/weapons.js');




var passport = require('passport');
var passportConfig = require('../config/passport');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/geousers');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));



// express server initialized and setup
var app = express();
// view engine setup
app.set('views', process.cwd() + '/views');
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// remove in production
app.use(logger('dev'));
// app.use(cookieParser());   //uncomment if using cookies
app.use(express.static(process.cwd() + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));


app.use(flash());


app.use(passport.initialize());
app.use(passport.session());







app.use('/auth', auth);
app.get('/', function(req, res){
  console.log('hi')
	// if(req.isAuthenticated()){
	// 	res.redirect('/profile/locationfield');
	// }else{
		res.render('login', {title: "GeoTag"});
	// }
});
app.get('/createacct', function(req, res){
	// if(req.isAuthenticated()){
	// 	res.redirect('/profile/locationfield');
	// }else{
		res.render('createacct');
	// }
});

app.use(passportConfig.isLoggedIn);

app.use('/profile', index);
// app.get('/*', function(req, res){
// 	if(req.isAuthenticated()){
// 		res.redirect('/profile/locationfield');
// 	}else{
// 		res.redirect('/auth/login');
// 	}
// });



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
