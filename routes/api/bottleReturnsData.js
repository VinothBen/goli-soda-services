var mongoose = require('mongoose');
var router = require('express').Router();
// var passport = require('passport');
var BottleReturnsData = mongoose.model('bottle-returns');
var _ = require('lodash');
var auth = require('../auth');
var moment = require('moment');
var UserModel = mongoose.model("Users");

// router.get('/getBottleReturnsData', auth.required, function (req, res, next) {
//     BottleReturnsData.find({ "_id": "5c271f0dfb6fc00eee882906" }).then(function (user) {
//         if (!user) {
//             res.status(401);
//             res.json({
//                 'Connection': {
//                     message: "DB Connection Failed.",
//                     error: "Error occured while fetching data."
//                 }
//             });
//             return res;
//         }
//         return res.json(user);
//     }).catch(next);
// });

router.get('/getBottleReturnsData', function (req, res, next) {
    if (!_.isEmpty(req.query) && req.query.date) {
        var date = req.query.date.toString();
        BottleReturnsData.aggregate([
            { "$match": { "BottleReturnsData.date": date } },
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

router.post('/bottleReturns-saveData', auth.required, function (req, res, next) {
    if (!_.isEmpty(req.body) && !_.isEmpty(req.body.bottleReturnsData)) {
        var errMessage = null;
        BottleReturnsData.findOneAndUpdate({ "_id": "5c271f0dfb6fc00eee882906" },
            {
                $push: { "BottleReturnsData": { $each: req.body.bottleReturnsData } },
                function(err, model) {
                    if (err) {
                        errMessage = {
                            message: "Save Failed.",
                            error: err
                        };
                    }
                }
            })
            //    InHouseData.aggregate([
            //         { $project: { inHouseData: { $concatArrays: [ "$inHouseData", req.body.inhousedata ] } } }
            //      ])
            .then(function (err) {
                if (!_.isEmpty(errMessage) || !err) {
                    res.status(400);
                    res.json({
                        'Connection': {
                            message: "Save failed.",
                            error: "Error occured while saving data."
                        }
                    });
                    return res;
                } else {
                    if (req.body.username) {
                        var errorDate = {};
                        UserModel.findOneAndUpdate({ "username": req.body.username },
                            { $set: { "lastSavedDateForBottleReturns": moment().format("MM-DD-YY") } }).then(
                                () => {
                                    errorDate.message = "Last save date success."
                                }
                            ).catch(() => { errorDate.message = "Last save date failed." });
                        return res.status(200).json({ message: "Saved Successfully." });
                    }
                }
            }).catch(next);
    } else {
        return res.status(500).json({
            message: "No data available."
        });
    }
});

router.get('/download-search-br', auth.required, function (req, res, next) {
    if (!_.isEmpty(req.query) && req.query.date) {
        var date = req.query.date.toString();
        BottleReturnsData.aggregate([
            { "$match": { "BottleReturnsData.date": date } },
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

router.get('/download-search-br-MDates', auth.required, function (req, res, next) {
    if (!_.isEmpty(req.query)) {
        // var dateValueKeys = Object.keys(req.query);
        // var queryStructure = [];
        // if (!_.isEmpty(dateValueKeys)) {
        //     dateValueKeys.map(function (obj) {
        //         var newObj = { "$eq": [{ "$ifNull": ["$date", req.query[obj].toString()] }, req.query[obj].toString()] };
        //         queryStructure.push(newObj);
        //     });
        // }
        var dateArray = [];
        var queryStructure = [];
        try {
            var startDate = _.cloneDeep(moment(req.query.start));
            var endDate = moment(req.query.end);
            while (startDate <= endDate) {
                dateArray.push(startDate.format("MM-DD-YY"));
                startDate = moment(startDate).add('1', "days");
            }
        } catch (error) {
            res.status(400).json({
                message: error.message
            });
        }
        if (!_.isEmpty(dateArray)) {
            dateArray.map(function (obj) {
                var newObj = { "$eq": [{ "$ifNull": ["$date", obj] }, obj] };
                queryStructure.push(newObj);
            });
            BottleReturnsData.aggregate([
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
                if (!err && !_.isEmpty(response) && !_.isEmpty(response[0].BottleReturnsData)) {
                    return res.json(response);
                }
                else if (!err && response.length === 0) {
                    res.status(200).json({
                        message: "No data found on this Date."
                    });
                } else {
                    res.status(200).json({
                        message: "No data found on this Date."
                    });
                }
            });
        }

    } else {
        res.status(400).json({
            message: "Something went wrong please try again."
        });
    }
});

module.exports = router;
