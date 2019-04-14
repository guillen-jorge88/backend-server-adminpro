var express = require('express');

var mdAuth = require('../middlewares/authentication.middleware');

var app = express();

var Doctor = require('../models/doctor.model');

/**
 * Get all doctors
 */

app.get('/', (req, res, next) => {
    var listFrom = req.query.listFrom || 0;
    listFrom = Number(listFrom);
    Doctor.find({})
        .skip(listFrom)
        .limit(5)
        .populate('_user', 'firstname lastname email')
        .populate('_hospital')
        .exec(
            (err, doctors) => {
                if (err) {
                    return res.status(401).json({
                        ok: false,
                        message: 'ERROR: find load doctor',
                        erros: err
                    });
                }
                Doctor.count({}, (err, length) => {
                    res.status(201).json({
                        ok: true,
                        doctors,
                        length
                    });
                });
            }
        );
});


/**
 * Update doctor by DB
 */
app.put('/:id', mdAuth.verifyToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;

    Doctor.findById(id, (err, doctorFind) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR: doctor not found',
                erros: err
            });
        }
        if (!doctorFind) {
            return res.status(500).json({
                ok: false,
                message: 'doctor with the id' + id + ' does not exist',
                erros: { message: 'there is no doctor with that id' }
            });
        }

        doctorFind.firstname = body.firstname;
        doctorFind.lastname = body.lastname;
        doctorFind.user = req.user._id;
        doctorFind.hospital = body.hospital;

        doctorFind.save(
            (err, savedDoctor) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        message: 'ERROR: could not update doctor',
                        erros: err
                    });
                }
                res.status(200).json({
                    ok: true,
                    doctor: savedDoctor
                });
            });
    });
});


/**
 * Create new doctor DB
 */

app.post('/', mdAuth.verifyToken, (req, res) => {
    var body = req.body;
    var doctor = new Doctor({
        firstname: body.firstname,
        lastname: body.lastname,
        _user: req.user._id,
        _hospital: body.hospital
    });

    doctor.save(
        (err, savedDoctor) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'ERROR: doctor could not be created',
                    erros: err
                });
            }
            res.status(201).json({
                ok: true,
                doctor: savedDoctor
            });
        });
});

/**
 * Delete doctor by Id DB
 */
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Doctor.findByIdAndDelete(id, (err, deletedDoctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'ERROR: could not update doctor',
                erros: err
            });
        }
        if (!deletedDoctor) {
            return res.status(400).json({
                ok: false,
                message: 'doctor with the id' + id + ' does not exist',
                erros: { message: 'there is no doctor with that id' }
            });
        }
        res.status(200).json({
            ok: true,
            doctor: deletedDoctor
        });
    });
});

module.exports = app;