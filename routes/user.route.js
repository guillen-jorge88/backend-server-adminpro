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
    var listFrom = req.query.listFrom || 0;
    listFrom = Number(listFrom);
    User.find({}, ' firstname lastname email avatar_img role')
        .skip(listFrom)
        .limit(5)
        .exec(
            (err, users) => {
                var message = {};
                if (err) {
                    return res.status(201).json({
                        ok: false,
                        message: 'ERROR: find load users',
                        erros: err
                    });
                }
                User.count({}, (err, length) => {
                    res.status(201).json({
                        ok: true,
                        users,
                        length
                    });
                });
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
                return res.status(500).json({
                    ok: false,
                    message: 'ERROR: User not found',
                    erros: err
                });
            }
            if (!userFind) {
                return res.status(500).json({
                    ok: false,
                    message: 'User with the id' + id + ' does not exist',
                    erros: { message: 'there is no user with that id' }
                });
            }

            userFind.firstname = body.firstname;
            userFind.lastname = body.lastname;
            userFind.email = body.email;
            userFind.role = body.role;
            userFind.save(
                (err, savedUser) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            message: 'ERROR: could not update user',
                            erros: err
                        });
                    }
                    res.status(400).json({
                        ok: false,
                        user: savedUser
                    });
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
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'ERROR: user could not be created',
                    erros: err
                });
            }
            res.status(201).json({
                ok: true,
                user: savedUser,
                user_token: req.user
            });
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
            return res.status(500).json({
                ok: false,
                message: 'ERROR: could not update user',
                erros: err
            });
        }
        if (!deletedUser) {
            return res.status(400).json({
                ok: false,
                message: 'User with the id' + id + ' does not exist',
                erros: { message: 'there is no user with that id' }
            });
        }
        res.status(200).json({
            ok: true,
            user: deletedUser
        });
    });
});

module.exports = app;