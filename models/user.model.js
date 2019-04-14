var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} it is not a valid role'
};

var userShema = new Schema({
    firstname: { type: String, required: [true, 'The First Name is required'] },
    lastname: { type: String, required: [true, 'The Last Name is required'] },
    email: { type: String, unique: true, required: [true, 'Email is required'] },
    password: { type: String, required: [true, 'The password is required'] },
    avatar_img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: validRoles }
});

userShema.plugin(uniqueValidator, { message: '{PATH} must be unique' });

module.exports = mongoose.model('User', userShema);