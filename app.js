
var express = require('express');
var path = require('path');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var user = require('./routes/user');
var auth = require('./routes/auth');
var login= require('./routes/login');

const passport    = require('passport');

require('./passport');

var app = express();

const mustache = require('mustache-express');
app.engine('mustache', mustache());
app.set('view engine', 'mustache');


const public = path.join(__dirname,'public');
app.use(express.static(public));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); 

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',  index);
app.use('/login', login);
app.use('/user', passport.authenticate('jwt', { session: false }), user);
app.use('/auth', auth);

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
  res.render('error',{message:"error page"});
});

const port = 3000;
app.listen(port, () => console.log(`Server started on port ${port}. Ctrl^c to quit.`));

module.exports = app;

