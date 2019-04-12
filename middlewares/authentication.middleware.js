var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

/**
 * Middleware - verify token
 */
exports.verifyToken = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        var message = {};
        if (err) {
            message = {
                ok: false,
                message: 'ERROR: wrong token',
                erros: err
            };
            return messageApi(res, message, 401, '', '');
        }
        req.user = decoded.user;
        next();
    });
};

function messageApi(res, message, status, crudType, path) {
    console.log('\x1b[47m\x1b[30m%s %s status\x1b[0m \x1b[32m%s\x1b[0m', crudType, path, status);
    return res.status(status).json(message);
}