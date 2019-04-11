// require
var express = require('express');
var mongoose = require('mongoose');


// initialize variables
var app = express();
var db = mongoose.connection;
// connection to mongodb 
mongoose.connect("mongodb://localhost:27017/hospitalDB", { useNewUrlParser: true });
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('connection to mongodb \x1b[32m%s\x1b[0m', 'successful');
});

// routes
app.get('/', (req, res, netx) => {
    res.status(200).json({
        ok: true,
        message: 'correctly executed request'
    });

});

// listen
app.listen(3000, () => {
    console.log('Express server port \x1b[32m%s\x1b[0m', '3000');
});