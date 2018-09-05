var dotenv = require('dotenv').config(); // Use environment variables
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

//Set up the server to use mySQL locally & Jaws once deployed
const Sequelize = require('sequelize');

if (process.env.JAWSDB_URL){
  connection = new Sequelize(process.env.JAWSDB_URL);
} else{
  connection = new Sequelize('tomcariello', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    freezeTableName: true,
    port:'3306'
  })
}

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(cookieParser()); 
app.use(bodyParser.urlencoded({ 
	extended: false
}));

app.use(session({ secret: 'tomtest',
  resave: true,
  saveUninitialized: true
})); // session secret

//Handelbars configuration
var exphbs = require('express-handlebars'); 
app.engine('handlebars', exphbs({
	defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

//Passport configuration
require('./config/passportConfig.js');
require('./config/passportConfig.js')(passport);

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//Routes
var routes = require('./controllers/route_controller.js');
app.use('/', routes);

//Launch
var PORT = 3000;
app.listen(process.env.PORT || PORT);
