var mongoose = require('mongoose');
// var uniqueValidator = require('mongoose-unique-validator');
// var crypto = require('crypto');
// var jwt = require('jsonwebtoken');
// var secret = require('../config').secret;

var BottleReturnsDataSchema = new mongoose.Schema({
    BottleReturnsData: [
        {
            id: String,
            date: String,
            day: String,
            area: String,
            bottle_type: String,
            empty_bottles_count: String,
            delivered_bottles: String,
            return_bottles: String
        }
    ]
}, { timestamps: true, collection: 'bottle-returns', _id: false });

// BottleReturnsDataSchema.plugin(uniqueValidator, { message: 'Dublicate id found.' });

// BottleReturnsDataSchema.methods.generateJWT = function () {
//     var today = new Date();
//     var exp = new Date(today);
//     exp.setDate(today.getDate() + 60);

//     return jwt.sign({
//         id: this._id,
//         username: this.username,
//         exp: parseInt(exp.getTime() / 1000),
//     }, secret);
// };

// BottleReturnsDataSchema.methods.toAuthJSON = function () {
//     return {
//         username: this.username,
//         email: this.email,
//         token: this.generateJWT()
//     };
// };
mongoose.model('bottle-returns', BottleReturnsDataSchema);
