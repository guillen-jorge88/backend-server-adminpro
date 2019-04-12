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
            message = {
                ok: false,
                message: 'ERROR: User search error',
                erros: err
            };

            return messageApi(res, message, 500, 'post:', '/login');
        }
        if (!userDB) {
            message = {
                ok: false,
                message: 'incorrect credentials - email',
                erros: err
            };

            return messageApi(res, message, 400, 'post:', '/login');
        }
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            message = {
                ok: false,
                message: 'incorrect credentials - password',
                erros: err
            };

            return messageApi(res, message, 400, 'post:', '/login');

        }
        userDB.password = 'esto es un password';
        var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 });
        message = {
            ok: true,
            user: userDB,
            id: userDB._id,
            token
        };
        messageApi(res, message, 201, 'post:', '/login');
    });
});

function messageApi(res, message, status, crudType, path) {
    console.log('\x1b[47m\x1b[30m%s %s status\x1b[0m \x1b[32m%s\x1b[0m', crudType, path, status);
    return res.status(status).json(message);
}

module.exports = app;