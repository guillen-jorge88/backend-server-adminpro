var express = require('express');
const path = require('path');
const fs = require('fs');

var app = express();

app.get('/:collection/:img', (req, res, netx) => {
    var collection = req.params.collection;
    var img = req.params.img;

    var pathImg = path.resolve(__dirname, `../uploads/${collection}/${img}`);
    var pathNoImg = path.resolve(__dirname, `../assets/no-img.jpg`);
    //console.log(pathImg);
    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        res.sendFile(pathNoImg);
    }
});
module.exports = app;