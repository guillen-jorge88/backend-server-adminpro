var express = require('express');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

var mdAuth = require('../middlewares/authentication.middleware');

var app = express();

var User = require('../models/user.model');

var salt = bcrypt.genSaltSync(10);


/**
 * Get all users
 */

app.get('/', (req, res, next) => {
    User.find({}, ' firstname lastname email avatar_img role')
        .exec(
            (err, users) => {
                var message = {};
                if (err) {
                    message = {
                        ok: false,
                        message: 'ERROR: find load users',
                        erros: err
                    };
                    return messageApi(res, message, 500, 'get:', '/user');
                }
                message = {
                    ok: true,
                    users
                };
                messageApi(res, message, 201, 'post:', '/user');
            }
        );
});





/**
 * Update user by DB
 */
app.put('/:id', mdAuth.verifyToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;
    var message = {};

    User.findById(id, ' firstname lastname email avatar_img role')
        .exec((err, userFind) => {
            if (err) {
                message = {
                    ok: false,
                    message: 'ERROR: User not found',
                    erros: err
                };

                return messageApi(res, message, 500, 'post:', '/user');
            }
            if (!userFind) {
                message = {
                    ok: false,
                    message: 'User with the id' + id + ' does not exist',
                    erros: { message: 'there is no user with that id' }
                };

                return messageApi(res, message, 500, 'post:', '/user');
            }

            userFind.firstname = body.firstname;
            userFind.lastname = body.lastname;
            userFind.email = body.email;
            userFind.role = body.role;
            userFind.save(
                (err, savedUser) => {
                    if (err) {
                        message = {
                            ok: false,
                            message: 'ERROR: could not update user',
                            erros: err
                        };

                        return messageApi(res, message, 400, 'post:', '/user');
                    }
                    message = {
                        ok: true,
                        user: savedUser
                    };
                    messageApi(res, message, 200, 'post:', '/user');
                });
        });
});


/**
 * Create new user DB
 */

app.post('/', mdAuth.verifyToken, (req, res) => {
    var body = req.body;
    var user = new User({
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email,
        password: bcrypt.hashSync(body.password, salt),
        avatar_img: body.avatar_img,
        role: body.role
    });

    user.save(
        (err, savedUser) => {
            var message = {};
            if (err) {
                message = {
                    ok: false,
                    message: 'ERROR: user could not be created',
                    erros: err
                };

                return messageApi(res, message, 400, 'post:', '/user');
            }

            message = {
                ok: true,
                user: savedUser,
                user_token: req.user
            };
            messageApi(res, message, 201, 'post:', '/user');
        });
});


/**
 * Delete user by Id DB
 */
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    var message = {};

    User.findByIdAndDelete(id, (err, deletedUser) => {
        if (err) {
            message = {
                ok: false,
                message: 'ERROR: could not update user',
                erros: err
            };

            return messageApi(res, message, 500, 'post:', '/user');
        }
        if (!deletedUser) {
            message = {
                ok: false,
                message: 'User with the id' + id + ' does not exist',
                erros: { message: 'there is no user with that id' }
            };

            return messageApi(res, message, 400, 'post:', '/user');
        }
        message = {
            ok: true,
            user: deletedUser
        };
        messageApi(res, message, 200, 'post:', '/user');
    });
});

function messageApi(res, message, status, crudType, path) {
    console.log('\x1b[47m\x1b[30m%s %s status\x1b[0m \x1b[32m%s\x1b[0m', crudType, path, status);
    return res.status(status).json(message);
}

module.exports = app;