var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var InHouseData = mongoose.model('in-house');
// var auth = require('../auth');

router.get('/inhouse-getdata', function (req, res, next) {
    // InHouseData.find("5b5da4d3e7179a07334161d4").select({ inHouseData: { $elemMatch: { date: req.headers.date } } }).limit(10).then(function (user) {
    InHouseData.find("5b5da4d3e7179a07334161d4").limit(10).then(function (user) {
        if (!user) {
            res.status(401);
            res.json({
                'Connection': {
                    message: "DB Connection Failed!",
                    error: "Error occured while fetching data!"
                }
            });
            return res;
        }
        return res.json(user);
    }).catch(next);
});

router.post('/inhouse-savedata', function (req, res, next) {
    if (req.body && req.body.inhousedata) {
        var errMessage = null;
        req.body.inhousedata.map((obj) => {
            InHouseData.findByIdAndUpdate(
                '5b5da4d3e7179a07334161d4',
                { $push: { "inHouseData": obj } },
                { safe: true, upsert: true },
                function (err, model) {
                    if (err) {
                        errMessage = {
                            message: "Save Failed!",
                            error: err
                        };
                    }
                }
            );
        })
    }
    if (errMessage) {
        return res.status(400).json(errMessage);
    } else {
        return res.status(200).json({
            message: "Data Saved Successfully!"
        });
    }
});

module.exports = router;
