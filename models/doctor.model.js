var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var doctorSchema = new Schema({
    firstname: { type: String, required: [true, 'The First Name is a required field'] },
    lastname: { type: String, required: [true, 'The Last Name is a required field'] },
    avatar_img: { type: String, required: false },
    _user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    _hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'The hospital id is a required field'] }
});

module.exports = mongoose.model('Doctor', doctorSchema);