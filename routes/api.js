const express = require ('express');
const router = express.Router();
const Ninja = require('../models/ninja');
const User = require('../models/user');
var middleware = require('../middleware');
var service = require('../service');
var ahora = new Date();
var actualizacion = new Date();
var alarma=false;
var tiempo_alarma=300000;


var myInt = setInterval(function () {
    ahora = new Date();
    console.log(ahora+" "+actualizacion);
    var diffMs = (ahora - actualizacion); // milliseconds between now & Christmas
    var diffDays = Math.floor(diffMs / 86400000); // days
    var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    console.log(diffMins+" "+diffHrs);
    if(diffHrs>= 1){
        console.log("ALARM ALARM");
        alarma=true;
    }

}, 300000);
router.put('/:name',middleware.ensureAuthenticated, function(req, res) {
    User.update(
        {name: req.params.name}, // query
        {$set: {geometry:{coordinates:[req.body.lng,req.body.lat] }}},
        function(err, object) {
            if (err){
                console.warn(err.message);  // returns error if no matching object found
                res.json({succes:false});
            }else{
                actualizacion = new Date();
                console.log("PUT Objetivo "+actualizacion);
                res.json({succes:true});

                alarma=false;
            }
        });
});
router.put('/circles/:name', function(req, res) {
    User.update(
        {name: req.params.name}, // query
        {$set: {circles:[req.body.circles] }},
        function(err, object) {
            if (err){
                console.warn(err.message);  // returns error if no matching object found
                res.json({succes:false});
            }else{
                console.log("Circles "+req.params.name);
                res.json({succes:true});
            }
        });
});

router.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        res.json(users);
    });
});

router.get('/users/:name',middleware.ensureAuthenticated, function(req, res) {
    User.findOne({name: req.params.name}, function (err, user) {
        if (err) throw err;
        if (user) {
            res.json(user.geometry.coordinates);
        }
    });
});

// Route to authenticate a user (POST http://localhost:3000/api/authenticate)
router.post('/auth', function(req, res) {
    User.findOne({ name: req.body.name }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {

// check if password matches
            if (user.password != req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
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
router.get('/private',middleware.ensureAuthenticated, function(req, res){
var token = req.headers.authorization.split(" ")[1];
    res.json({ message: 'Estás autenticado correctamente y tu _id es:'+req.user });
});

router.post('/removeAll', function(req, res) {

        User.remove({}, function(err) { 
   		console.log('collection removed');
		 res.json({ success: true });
	});
});

router.post('/setup', function(req, res) {

        User.findOne({ 'name': 'objetivo' }, function (err, user) {
            if (err) return handleError(err);
            if(user != null){

                res.json({ success: false });
            }else{

                var objetivo = new User({
                    name: 'objetivo',
                    password: 'objetivo',
                    geometry:{"type": "point", "coordinates": [-80, 25.791]},
		circles:null
                });
		
                objetivo.save(function(err) {
                    if (err) throw err;

                    console.log('Objetivo User saved successfully');
                });
                var vip = new User({
                    name: 'vip',
                    password: 'vip',
                    geometry:{"type": "point", "coordinates": [80, -25.791]},
		    circles:null
                });


                vip.save(function(err) {
                    if (err) throw err;

                    console.log('Vip User saved successfully');

                });

		var admin = new User({
                    name: 'admin',
                    password: 'admin',
                    geometry:null,
			circles:null
                });

		 admin.save(function(err) {
                    if (err) throw err;

                    console.log('Admin User saved successfully');

                });

                res.json({ success: true });

            }

        });




    // create a sample user

});
router.get('/alarma',middleware.ensureAuthenticated, function(req, res) {
    if (alarma) {
        var obj = {'alarma': 'true'};
        res.json(obj);
    } else {
        var obj = {'alarma': 'false'};
        res.json(obj);

    }
});
// get a list of ninjas from the db
router.post('/distancia',middleware.ensureAuthenticated, function(req, res, next){
    /* Ninja.find({}).then(function(ninjas){
        res.send(ninjas);
    }); */
    User.geoNear(
        {type: 'Point', coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)]},
        { spherical: true}
    ).then(function(ninjas){
        ninjas.forEach(function(entry) {

            if(entry.obj.name =='objetivo'){
                var hora=new Date();
                console.log("POST Distancia Vip "+hora);
                res.status(200).send(entry);
            }

        });

        //res.send("error");
        //console.log("distancia: "+entry.dis);
    }).catch(next);
    //res.send("nop");
});


module.exports = router;
