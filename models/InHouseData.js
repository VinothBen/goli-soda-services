var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

var InHouseDataSchema = new mongoose.Schema({
    inHouseData: [
        {
            s_no: String,
            date: String,
            day: String,
            bottle_type: String,
            rate: String,
            no_of_bottles: String,
            employee_involved: String,
            employee_cost: String,
            bottle_for_cost: String
        }
    ]
}, { timestamps: true, collection: 'in-house', _id: false });

InHouseDataSchema.plugin(uniqueValidator, { message: 'is already taken.' });

InHouseDataSchema.methods.generateJWT = function () {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
    }, secret);
};

InHouseDataSchema.methods.toAuthJSON = function () {
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
        bio: this.bio,
        image: this.image
    };
};
mongoose.model('in-house', InHouseDataSchema);
