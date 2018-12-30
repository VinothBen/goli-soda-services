var mongoose = require('mongoose');
var router = require('express').Router();
var InHouseData = mongoose.model('in-house');
var _ = require('lodash');
var auth = require('../auth');
var moment = require('moment');
var UserModel = mongoose.model("Users");

// router.get('/inhouse-getdata', auth.required, function (req, res, next) {
//     // InHouseData.find("5b5da4d3e7179a07334161d4").select({ inHouseData: { $elemMatch: { date: req.headers.date } } }).limit(10).then(function (user) {
//     // InHouseData.find("5b5da4d3e7179a07334161d4").limit(10).then(function (user) {
//     InHouseData.find({ "_id": "5b5da4d3e7179a07334161d4" }).then(function (user) {
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

router.post('/inhouse-savedata', auth.required, function (req, res, next) {
    if (!_.isEmpty(req.body) && !_.isEmpty(req.body.inhousedata)) {
        var errMessage = null;
        InHouseData.findOneAndUpdate({ "_id": "5b5da4d3e7179a07334161d4" },
            {
                $push: { "inHouseData": { $each: req.body.inhousedata } },
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
                    if(req.body.username){
                        var errorDate = {};
                        UserModel.findOneAndUpdate({ "username": req.body.username },
                        { $set: { "lastSavedDateForInhouse": moment().format("MM-DD-YY") } }).then(
                            () => {
                                errorDate.message = "Last save date success."
                            }
                        ).catch(() => { errorDate.message = "Last save date failed." });
                        return res.status(200).json({ message: "Saved Successfully.", errorDate });
                    }
                }
            }).catch(next);
    } else {
        return res.status(500).json({
            message: "No data available."
        });
    }
});

// router.post('/inhouse-savedata', auth.required, function (req, res, next) {
//     if (!_.isEmpty(req.body) && !_.isEmpty(req.body.inhousedata)) {
//         var errMessage = null;
//         req.body.inhousedata.map((obj) => {
//             InHouseData.findOneAndUpdate(
//                 { "_id": "5b5da4d3e7179a07334161d4" },
//                 { $push: { "inHouseData": obj } },
// {safe: true, upsert: true},
//                 function (err, model) {
//                     if (err) {
//                         errMessage = {
//                             message: "Save Failed.",
//                             error: err
//                         };
//                     }
//                 }
//             );
//         });
//         if (errMessage) {
//             return res.status(400).json(errMessage);
//         } else {
//             return res.status(200).json({
//                 message: "Data Saved Successfully."
//             });
//         }
//     } else {
//         return res.status(500).json({
//             message: "No data available."
//         });
//     }

// });

router.get('/inhouse-getdata', auth.required, function (req, res, next) {
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

router.get('/download-search', auth.required, function (req, res, next) {
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

router.get('/download-search-MDates', auth.required, function (req, res, next) {
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
                if (!err && !_.isEmpty(response) && !_.isEmpty(response[0].inHouseData)) {
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
