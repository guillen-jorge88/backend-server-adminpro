var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    name: { type: String, unique: true, required: [true, 'name is required'] },
    avatar_img: { type: String, required: false },
    _user: { type: Schema.Types.ObjectId, ref: 'User' }
}, { collection: 'hospitals' });

hospitalSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' });

module.exports = mongoose.model('Hospital', hospitalSchema);