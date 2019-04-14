var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var Hospital = require('../models/hospital.model');
var Doctor = require('../models/doctor.model');
var User = require('../models/user.model');

var app = express();

// default options
app.use(fileUpload());

app.put('/:collection/:id', (req, res, netx) => {
    var collection = req.params.collection;
    var id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: true,
            message: 'Did not select a file.',
            error: { message: 'a file is required to upload.' }
        });
    }
    // Get file name
    var file = req.files.image;
    var arrayFileName = file.name.split('.');
    var fileExtension = arrayFileName[arrayFileName.length - 1];

    //valid collections
    var validCollections = ['doctors', 'users', 'hospitals'];

    if (validCollections.indexOf(collection) < 0) {
        return res.status(400).json({
            ok: true,
            message: 'Colletion is not valid.',
            error: { message: 'The valid colections are: ' + validCollections.join(', ') + '.' }
        });
    }

    //valid extensions
    var validExtensions = ['png', 'jpg', 'jpeg', 'gif'];

    if (validExtensions.indexOf(fileExtension) < 0) {
        return res.status(400).json({
            ok: true,
            message: 'Extecion is not valid.',
            error: { message: 'The valid extensions are: ' + validExtensions.join(', ') + '.' }
        });
    }

    // New name File
    var newFileName = `${id}-${new Date().getMilliseconds()}.${fileExtension}`;

    // move file from the temporary folder of a specific address
    var imagePath = `./uploads/${collection}/${newFileName}`;

    file.mv(imagePath, err => {
        if (err) {
            return res.status(500).json({
                ok: true,
                message: 'Error moving file.',
                error: err
            });
        }

        uploadByColection(collection, id, newFileName, res);
    });
});


function uploadByColection(collection, id, newFileName, res) {
    switch (collection) {
        case 'users':
            User.findById(id, (err, foundUser) => {
                if (!foundUser) {
                    return res.status(400).json({
                        ok: false,
                        message: 'User does not exist',
                        err
                    });
                }

                var olddPath = `./uploads/users/${foundUser.avatar_img}`;

                if (fs.existsSync(olddPath)) {
                    fs.unlink(olddPath, (err) => {
                        if (err) throw err;
                        console.log(olddPath + ' was deleted');
                    });
                }
                foundUser.avatar_img = newFileName;

                foundUser.save((err, userSaved) => {
                    userSaved.password = '.';
                    return res.status(200).json({
                        ok: true,
                        message: 'updated user',
                        userSaved
                    });
                });
            });
            break;
        case 'doctors':
            Doctor.findById(id, (err, foundDoctor) => {
                if (!foundDoctor) {
                    return res.status(400).json({
                        ok: false,
                        message: 'Doctor does not exist',
                        err
                    });
                }

                var olddPath = `./uploads/doctors/${foundDoctor.avatar_img}`;

                if (fs.existsSync(olddPath)) {
                    fs.unlink(olddPath, (err) => {
                        if (err) throw err;
                        console.log(olddPath + ' was deleted');
                    });
                }
                foundDoctor.avatar_img = newFileName;

                foundDoctor.save((err, doctorSaved) => {
                    doctorSaved.password = '.';
                    return res.status(200).json({
                        ok: true,
                        message: 'updated doctor',
                        doctorSaved
                    });
                });
            });
            break;
        case 'hospitals':
            Hospital.findById(id, (err, foundHospital) => {
                if (!foundHospital) {
                    return res.status(400).json({
                        ok: false,
                        message: 'Hospital does not exist',
                        err
                    });
                }
                var olddPath = `./uploads/hospitals/${foundHospital.avatar_img}`;

                if (fs.existsSync(olddPath)) {
                    fs.unlink(olddPath, (err) => {
                        if (err) throw err;
                        console.log(olddPath + ' was deleted');
                    });
                }
                foundHospital.avatar_img = newFileName;

                foundHospital.save((err, hospitalSaved) => {
                    if (!foundDoctor) {
                        return res.status(400).json({
                            ok: false,
                            message: 'Doctor does not exist',
                            err
                        });
                    }
                    hospitalSaved.password = '';
                    return res.status(200).json({
                        ok: true,
                        message: 'updated hospital',
                        hospitalSaved
                    });
                });
            });
            break;

        default:
            break;
    }
}

module.exports = app;