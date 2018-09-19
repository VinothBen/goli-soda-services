var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var InHouseData = mongoose.model('in-house');
var _ = require('lodash');
// var auth = require('../auth');

router.get('/inhouse-getdata', function (req, res, next) {
    // InHouseData.find("5b5da4d3e7179a07334161d4").select({ inHouseData: { $elemMatch: { date: req.headers.date } } }).limit(10).then(function (user) {
    // InHouseData.find("5b5da4d3e7179a07334161d4").limit(10).then(function (user) {
    InHouseData.find({ "_id": "5b5da4d3e7179a07334161d4" }).then(function (user) {
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
    if (!_.isEmpty(req.body) && !_.isEmpty(req.body.inhousedata)) {
        var errMessage = null;
        req.body.inhousedata.map((obj) => {
            InHouseData.findByIdAndUpdate(
                { "_id": "5b5da4d3e7179a07334161d4" },
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

router.get('/download-search', function (req, res, next) {
    if (!_.isEmpty(req.query) && req.query.date) {
        var date = req.query.date.toString();
        InHouseData.aggregate([
            { "$match": { "inHouseData.date": date } },
            {
                "$redact": {
                    "$cond": [
                        {
                            "$eq": [{ "$ifNull": ["$date", date] },
                                date]
                        },
                        "$$DESCEND",
                        "$$PRUNE"
                    ]
                }
            }
        ], function (err, response) {
            if (!err && response.length !== 0) {
                return res.json(response);
            }
            else if (!err && response.length === 0) {
                res.status(200).json({
                    message: "No data found on this Date."
                });
            } else {
                res.status(400).json({
                    message: err
                });
            }
        });
    } else {
        res.status(400).json({
            message: "No data found."
        });
    }
});

router.get('/download-search-MDates', function (req, res, next) {
    if (!_.isEmpty(req.query)) {
        var dateValueKeys = Object.keys(req.query);
        var queryStructure = [];
        if (!_.isEmpty(dateValueKeys)) {
            dateValueKeys.map(function (obj) {
                var newObj = { "$eq": [{ "$ifNull": ["$date", req.query[obj].toString()] }, req.query[obj].toString()] };
                queryStructure.push(newObj);
            });
        }
        if (!_.isEmpty(queryStructure)) {
            InHouseData.aggregate([
                {
                    "$redact": {
                        "$cond": [
                            {
                                "$or": queryStructure
                            },
                            "$$DESCEND",
                            "$$PRUNE"
                        ]
                    }
                }
            ], function (err, response) {
                if (!err && response.length !== 0) {
                    return res.json(response);
                }
                else if (!err && response.length === 0) {
                    res.status(200).json({
                        message: "No data found on this Date."
                    });
                } else {
                    res.status(400).json({
                        message: err
                    });
                }
            });
        }

    } else {
        res.status(400).json({
            message: "No data found."
        });
    }
});

module.exports = router;
