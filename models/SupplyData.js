var mongoose = require('mongoose');
// var uniqueValidator = require('mongoose-unique-validator');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

var SupplyDataSchema = new mongoose.Schema({
    SupplyData: [
        {
            id: Number,
            date: String,
            day: String,
            bottle_type: String,
            total_bottles: Number,
            type_of_supply: String,
            area: String,
            type_of_vehicle: String,
            fuel_cost: Number,
            employee_wage: Number,
            delivery_expense: Number
        }
    ]
}, { timestamps: true, collection: 'supply', _id: false });

// InHouseDataSchema.plugin(uniqueValidator, { message: 'Dublicate id found.' });

// InHouseDataSchema.methods.generateJWT = function () {
//     var today = new Date();
//     var exp = new Date(today);
//     exp.setDate(today.getDate() + 60);

//     return jwt.sign({
//         id: this._id,
//         username: this.username,
//         exp: parseInt(exp.getTime() / 1000),
//     }, secret);
// };

// InHouseDataSchema.methods.toAuthJSON = function () {
//     return {
//         username: this.username,
//         email: this.email,
//         token: this.generateJWT()
//     };
// };
mongoose.model('supply', SupplyDataSchema);
