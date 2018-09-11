const express = require('express');
const router = express.Router();
const Ninja = require('../models/ninja');
const User = require('../models/user');
var middleware = require('../middleware');
var service = require('../service');
var ahora = new Date();
var actualizacion = new Date();
var alarma = false;
var alarmaPulsera = false;
var signalToObjetivo = false;
var signalToVip = false;
var alarmaPulsera = false;
var tiempo_alarma = 300000;


var myInt = setInterval(function () {
    ahora = new Date();
    console.log(ahora + " " + actualizacion);
    var diffMs = (ahora - actualizacion); // milliseconds between now & Christmas
    var diffDays = Math.floor(diffMs / 86400000); // days
    var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    console.log(diffMins + " " + diffHrs);
    if (diffHrs >= 1) {
        console.log("ALARM ALARM");
        alarma = true;
    }

}, 300000);
router.put('/:name', middleware.ensureAuthenticated, function (req, res) {
    User.update(
        {name: req.params.name}, // query
        {$set: {geometry: {coordinates: [req.body.lng, req.body.lat]}}},
        function (err, object) {
            if (err) {
                console.warn(err.message);  // returns error if no matching object found
                res.json({succes: false});
            } else {
                actualizacion = new Date();
                console.log("PUT  " + req.params.name + "  " + actualizacion);
                res.json({succes: true});

                alarma = false;
            }
        });
});
router.put('/circles/:name', middleware.ensureAuthenticated, function (req, res) {
    User.update(
        {name: req.params.name}, // query
        {$set: {circles: [req.body.circles]}},
        function (err, object) {
            if (err) {
                console.warn(err.message);  // returns error if no matching object found
                res.json({succes: false});
            } else {
                console.log("Circles " + req.params.name);
                res.json({succes: true});
            }
        });
});
router.put('/warningDistance/:name', middleware.ensureAuthenticated, function (req, res) {
    User.update(
        {name: req.params.name}, // query
        {$set: {warningDistance: req.body.warningDistance}},
        function (err, object) {
            if (err) {
                console.log(req.body.warningDistance);
                console.warn(err.message);  // returns error if no matching object found
                res.json({succes: false});
            } else {
                console.log("warningDistance " + req.params.name + " " + req.body.warningDistance);
                res.json({succes: true});
            }
        });
});

router.get('/circles/:name', middleware.ensureAuthenticated, function (req, res) {
    User.findOne({name: req.params.name}, function (err, user) {
        if (err) throw err;
        if (user) {
            res.json({circles: user.circles});
        }
    });
});

router.get('/users', middleware.ensureAuthenticated, function (req, res) {
    User.find({}, function (err, users) {
        res.json(users);
    });
});

router.get('/users/:name', middleware.ensureAuthenticated, function (req, res) {
    User.findOne({name: req.params.name}, function (err, user) {
        if (err) throw err;
        if (user) {
            res.json(user.geometry.coordinates);
        }
    });
});

router.get('/warningDistance/:name', middleware.ensureAuthenticated, function (req, res) {
    User.findOne({name: req.params.name}, function (err, user) {
        if (err) throw err;
        if (user) {
            res.json(user.warningDistance);
        }
    });
});

// Route to authenticate a user (POST http://localhost:3000/api/authenticate)
router.post('/auth', function (req, res) {
    User.findOne({name: req.body.name}, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({success: false, message: 'Authentication failed. User not found.'});
        } else if (user) {

// check if password matches
            if (user.password != req.body.password) {
                res.json({success: false, message: 'Authentication failed. Wrong password.'});
            } else {
                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: service.createToken(user)
                });
            }
        }
    });
});
router.get('/private', middleware.ensureAuthenticated, function (req, res) {
    var token = req.headers.authorization.split(" ")[1];
    res.json({message: 'Estás autenticado correctamente y tu _id es:' + req.user});
});

router.post('/removeAll', function (req, res) {

    User.remove({}, function (err) {
        console.log('collection removed');
        res.json({success: true});
    });
});

router.post('/setup', function (req, res) {

    User.findOne({'name': 'objetivo'}, function (err, user) {
        if (err) return handleError(err);
        if (user != null) {

            res.json({success: false});
        } else {

            var objetivo = new User({
                name: 'objetivo',
                password: 'objetivo',
                geometry: {"type": "point", "coordinates": [-80, 25.791]},
                circles: null
            });

            objetivo.save(function (err) {
                if (err) throw err;

                console.log('Objetivo User saved successfully');
            });
            var vip = new User({
                name: 'vip',
                password: 'vip',
                geometry: {"type": "point", "coordinates": [80, -25.791]},
                circles: null
            });


            vip.save(function (err) {
                if (err) throw err;

                console.log('Vip User saved successfully');

            });

            var admin = new User({
                name: 'admin',
                password: 'admin',
                geometry: null,
                circles: null
            });

            admin.save(function (err) {
                if (err) throw err;

                console.log('Admin User saved successfully');

            });

            res.json({success: true});

        }

    });


    // create a sample user

});
router.get('/alarma', middleware.ensureAuthenticated, function (req, res) {
    if (alarma) {
        var obj = {'alarma': 'true'};
        res.json(obj);
    } else {
        var obj = {'alarma': 'false'};
        res.json(obj);

    }
});

router.get('/alarmaPulsera', middleware.ensureAuthenticated, function (req, res) {
    if (alarmaPulsera) {
        var obj = {'alarmaPulsera': 'true'};
        res.json(obj);
    } else {
        var obj = {'alarmaPulsera': 'false'};
        res.json(obj);

    }
});

router.put('/alarma/:boolean', function (req, res) {
    if (req.params.boolean === "true") {
        alarma = true;
        res.json({success: true});
    } else {
        alarma = false;
        res.json({success: true});

    }
    res.json({success: false});
});

router.get('/warning/:name', middleware.ensureAuthenticated, function (req, res) {
    if (req.params.name === "objetivo") {
        res.json({signalToObjetivo: signalToObjetivo});
        signalToObjetivo=false;
    } else {
        res.json({signalToVip: signalToVip});
        signalToVip=false;
    }
    res.json({success: false});
});

router.put('/warning/:name',  function (req, res) {
    if (req.params.name === "objetivo") {
        signalToObjetivo = true;
        res.json({success: true});
    } else {
        signalToVip = true;
        res.json({success:true});
    }
    res.json({success: false});
});

router.put('/alarmaPulsera/:boolean', function (req, res) {
    if (req.params.boolean === "true") {
        alarmaPulsera = true;
        res.json({success: true});
    } else {
        alarmaPulsera = false;
        res.json({success: true});

    }
    res.json({success: false});
});
router.put('/phoneLevelBattery/:name', middleware.ensureAuthenticated, function (req, res) {
    User.update(
        {name: req.params.name}, // query
        {$set: {phoneLevelBattery: req.body.phoneLevelBattery}},
        function (err, object) {
            if (err) {
                console.warn(err.message);  // returns error if no matching object found
                res.json({succes: false});
            } else {
                console.log("phoneLevelBattery " + req.params.name + " " + req.body.phoneLevelBattery);
                res.json({succes: true});
            }
        });
});
router.put('/bandLevelBattery/:name', middleware.ensureAuthenticated, function (req, res) {
    User.update(
        {name: req.params.name}, // query
        {$set: {bandLevelBattery: req.body.bandLevelBattery}},
        function (err, object) {
            if (err) {
                console.warn(err.message);  // returns error if no matching object found
                res.json({succes: false});
            } else {
                console.log("bandLevelBattery " + req.params.name + " " + req.body.bandLevelBattery);
                res.json({succes: true});
            }
        });
});
router.get('/phoneLevelBattery/:name', middleware.ensureAuthenticated, function (req, res) {
    User.findOne({name: req.params.name}, function (err, user) {
        if (err) throw err;
        if (user) {
            res.json({phoneLevelBattery: user.phoneLevelBattery});
        }
    });
});

router.get('/bandLevelBattery/:name', middleware.ensureAuthenticated, function (req, res) {
    User.findOne({name: req.params.name}, function (err, user) {
        if (err) throw err;
        if (user) {
            res.json({bandLevelBattery: user.bandLevelBattery});
        }
    });
});

// get a list of ninjas from the db
router.post('/distancia', middleware.ensureAuthenticated, function (req, res, next) {
    /* Ninja.find({}).then(function(ninjas){
        res.send(ninjas);
    }); */
    User.geoNear(
        {type: 'Point', coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)]},
        {spherical: true}
    ).then(function (ninjas) {
        ninjas.forEach(function (entry) {

            if (entry.obj.name == 'objetivo') {
                var hora = new Date();
                console.log("POST Distancia Vip " + hora);
                res.status(200).send(entry);
            }
            console.log("distancia: " + entry.dis);
        });

        //res.send("error");

    }).catch(next);
    //res.send("nop");
});


module.exports = router;
