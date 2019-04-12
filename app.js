// require
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


// initialize variables
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// imports routes
var appRoute = require('./routes/app.route');
var userRoute = require('./routes/user.route');
var loginRoute = require('./routes/login.route');

var db = mongoose.connection;
// connection to mongodb 
mongoose.connect("mongodb://localhost:27017/hospitalDB", { useNewUrlParser: true });
//mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('connection to mongodb \x1b[32m%s\x1b[0m', 'successful');
});

// routes
app.use('/user', userRoute);
app.use('/login', loginRoute);
app.use('/', appRoute);

// listen
app.listen(3000, () => {
    console.log('Express server port \x1b[32m%s\x1b[0m', '3000');
});