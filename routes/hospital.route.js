var express = require('express');

var mdAuth = require('../middlewares/authentication.middleware');

var app = express();

var Hospital = require('../models/hospital.model');

/**
 * Get all hospitals
 */

app.get('/', (req, res, next) => {
    var listFrom = req.query.listFrom || 0;
    listFrom = Number(listFrom);
    Hospital.find({})
        .skip(listFrom)
        .limit(5)
        .populate('_user', 'firstname lastname email')
        .exec(
            (err, hospital) => {
                if (err) {
                    return res.status(401).json({
                        ok: false,
                        message: 'ERROR: find load hospital',
                        erros: err
                    });
                }
                Hospital.count({}, (err, length) => {
                    res.status(201).json({
                        ok: true,
                        hospital,
                        length
                    });
                });
            }
        );
});


/**
 * Update hospital by DB
 */
app.put('/:id', mdAuth.verifyToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospitalFind) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR: hospital not found',
                erros: err
            });
        }
        if (!hospitalFind) {
            return res.status(500).json({
                ok: false,
                message: 'hospital with the id' + id + ' does not exist',
                erros: { message: 'there is no hospital with that id' }
            });
        }

        hospitalFind.name = body.name;
        hospitalFind.user = req.user._id;

        hospitalFind.save(
            (err, savedHospital) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        message: 'ERROR: could not update hospital',
                        erros: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    hospital: savedHospital
                });
            });
    });
});


/**
 * Create new hospital DB
 */

app.post('/', mdAuth.verifyToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        name: body.name,
        _user: req.user._id
    });

    hospital.save(
        (err, savedHospital) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'ERROR: hospital could not be created',
                    erros: err
                });
            }
            res.status(201).json({
                ok: true,
                hospital: savedHospital
            });
        });
});

/**
 * Delete hospital by Id DB
 */
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findByIdAndDelete(id, (err, deletedHospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR: could not update hospital',
                erros: err
            });
        }
        if (!deletedHospital) {
            return res.status(400).json({
                ok: false,
                message: 'hospital with the id' + id + ' does not exist',
                erros: { message: 'there is no hospital with that id' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: deletedHospital
        });
    });
});

module.exports = app;