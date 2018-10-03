var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var secret = require("../config").secret;

var UsersSchema = new mongoose.Schema({
    username: {type: String, lowercase: true, unique: true, required: [true, "username can't be blank"], index: true},
    emailid: {type: String, lowercase: true, unique: true, required: [true, "emailid can't be blank"], index: true},
    lastsaveddate: String,
    lastlogindate: String,
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
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jwt.sign({
        id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
    }, secret);
};

UsersSchema.methods.toAuthJSON = function () {
    return {
        username: this.username,
        email: this.email,
        token: this.generateJWT(),
    };
};

mongoose.model('Users',UsersSchema);