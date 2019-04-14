var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user.model');


app.post('/', (req, res) => {
    var body = req.body;
    User.findOne({ email: body.email }, (err, userDB) => {
        var message = {};
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR: User search error',
                erros: err
            });
        }
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                message: 'incorrect credentials - email',
                erros: err
            });
        }
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                message: 'incorrect credentials - password',
                erros: err
            });

        }
        userDB.password = 'esto es un password';
        var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 });
        res.status(201).json({
            ok: true,
            user: userDB,
            id: userDB._id,
            token
        });
    });
});

module.exports = app;