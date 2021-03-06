var mongoose = require('mongoose');
// var uniqueValidator = require('mongoose-unique-validator');
// var crypto = require('crypto');
// var jwt = require('jsonwebtoken');
// var secret = require('../config').secret;

var SupplyDataSchema = new mongoose.Schema({
    supplyData: [
        {
            id: String,
            date: String,
            day: String,
            bottle_type: String,
            total_bottles: String,
            type_of_supply: String,
            area: String,
            type_of_vehicle: String,
            fuel_cost: String,
            employee_wage: String,
            delivery_expense: String
        }
    ]
}, { timestamps: true, collection: 'supply', _id: false });

// SupplyDataSchema.plugin(uniqueValidator, { message: 'Dublicate id found.' });

// SupplyDataSchema.methods.generateJWT = function () {
//     var today = new Date();
//     var exp = new Date(today);
//     exp.setDate(today.getDate() + 60);

//     return jwt.sign({
//         id: this._id,
//         username: this.username,
//         exp: parseInt(exp.getTime() / 1000),
//     }, secret);
// };

// SupplyDataSchema.methods.toAuthJSON = function () {
//     return {
//         username: this.username,
//         email: this.email,
//         token: this.generateJWT()
//     };
// };
mongoose.model('supply', SupplyDataSchema);
