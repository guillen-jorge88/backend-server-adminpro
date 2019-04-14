var express = require('express');

var app = express();

var Hospital = require('../models/hospital.model');
var Doctor = require('../models/doctor.model');
var User = require('../models/user.model');

/**
 *  Search by collection
 */
app.get('/collection/:collection/:search', (req, res, netx) => {
    var collection = req.params.collection;
    var search = req.params.search;
    var regexp = new RegExp(search, 'i');
    var searches;
    var visibleFields;
    var promise;
    switch (collection) {
        case 'users':
            collection = User;
            searches = [{ firstname: regexp }, { lastname: regexp }, { email: regexp }];
            visibleFields = 'firstname lastname email role';
            break;
        case 'doctors':
            collection = Doctor;
            searches = [{ firstname: regexp }, { lastname: regexp }];
            visibleFields = '';
            break;
        case 'hospitals':
            collection = Hospital;
            searches = [{ name: regexp }];
            visibleFields = '';
            break;
        default:
            return res.status(400).json({
                ok: true,
                message: 'Valid collections are: users, doctors, hospitals.',
                error: { message: 'Invalid collection.' }
            });
    }

    genericSearch(collection, searches, visibleFields)
        .then(results => {
            res.status(200).json({
                ok: true,
                results
            });
        });
});


/**
 * General Search
 */
app.get('/all/:search', (req, res, netx) => {
    var search = req.params.search;
    var regexp = new RegExp(search, 'i');

    Promise.all([
        genericSearch(Hospital, [{ name: regexp }]),
        genericSearch(Doctor, [{ firstname: regexp }, { lastname: regexp }]),
        genericSearch(User, [{ firstname: regexp }, { lastname: regexp }, { email: regexp }], 'firstname lastname email role')
    ]).then(allAnswers => {
        res.status(200).json({
            ok: true,
            hospitals: allAnswers[0],
            doctors: allAnswers[1],
            users: allAnswers[2]
        });
    });
});

function genericSearch(modelSearch, search, visibleFields = '') {

    return new Promise((resolve, reject) => {
        modelSearch.find({}, visibleFields)
            .or(search)
            .exec((err, modelSearchs) => {
                if (err) {
                    reject('ERROR: error when loading data ', err);
                } else {
                    resolve(modelSearchs);
                }
            });
    });
}

module.exports = app;