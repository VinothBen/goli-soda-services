var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var secret = require("../config").secret;
var moment = require("moment");

var UsersSchema = new mongoose.Schema({
    username: {type: String, lowercase: true, unique: true, required: [true, "username can't be blank"], index: true},
    emailid: {type: String, lowercase: true, unique: true, required: [true, "emailid can't be blank"], index: true},
    lastSavedDateForInhouse: String,
    lastSavedDateForSupply: String,
    lastSavedDateForBottleReturns: String,
    lastLogindDate: String,
    hash: String,
    salt: String
}, { timestamps: true, collection: "user-details", _id: true });

UsersSchema.plugin(uniqueValidator, { message: 'is already taken.' });

UsersSchema.methods.validPassword = function (password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};

UsersSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UsersSchema.methods.generateJWT = function () {
    // var today = new Date();
    // var exp = new Date(today);
    // exp.setMinutes(today.getMinutes() + 60);
    return jwt.sign({
        id: this._id,
        username: this.username,
    }, secret, {expiresIn: '1h'});
};

UsersSchema.methods.toAuthJSON = function () {
    return {
        username: this.username,
        email: this.emailid,
        lastSavedDateForInhouse: this.lastSavedDateForInhouse,
        lastSavedDateForSupply: this.lastSavedDateForSupply,
        lastSavedDateForBottleReturns: this.lastSavedDateForBottleReturns,
        lastLogindDate: moment().format("MM-DD-YY"),
        token: this.generateJWT(),
    };
};

mongoose.model('Users',UsersSchema);