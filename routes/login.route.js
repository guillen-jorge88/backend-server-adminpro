var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

//imports Google
var { CLIENT_ID } = require('../config/config');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user.model');

/**
 * authentication Google
 */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        firstname: payload.given_name,
        lastname: payload.family_name,
        email: payload.email,
        img: payload.picture,
        google: true,
        payload
    }
}
app.post('/google', async(req, res) => {
    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                message: "Invalid token"
            });
        });

    User.findOne({ email: googleUser.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR: User search error',
                erros: err
            });
        }

        if (userDB) {
            if (userDB.google === false) {
                return res.status(500).json({
                    ok: false,
                    message: 'ERROR: you must use the authentication by email and password'
                });
            } else {
                var serveToken = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 });
                res.status(201).json({
                    ok: true,
                    user: userDB,
                    id: userDB._id,
                    token: serveToken
                });
            }
        } else {
            var user = new User();

            user.firstname = googleUser.firstname;
            user.lastname = googleUser.lastname;
            user.email = googleUser.email;
            user.avatar_img = googleUser.img;
            user.google = true;
            user.password = 'googleUser-password';

            console.log(user);
            user.save((err, userDB) => {
                var serveToken = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 });

                res.status(201).json({
                    ok: true,
                    user: userDB,
                    id: userDB._id,
                    token: serveToken
                });
            });
        }
    });

    // res.status(200).json({
    //     ok: true,
    //     message: "successful",
    //     googleUser
    // });
});


/**
 * authentication
 */
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