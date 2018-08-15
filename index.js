const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var config = require('./config');
const User = require('./models/user');
var methodOverride = require("method-override");
var fs = require('fs');
var https = require('https');
var tls = require('tls');

var options = {
    key  : fs.readFileSync('server.key'),
    cert : fs.readFileSync('server.crt')
};
// set up express app
const app = express();

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');

    	// Request methods you wish to allow
    	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

    	// Request headers you wish to allow
    	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	next();
 
});
app.use(express.bodyParser({limit: '50mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(methodOverride());


// connect to mongodb
mongoose.connect('mongodb://localhost/ninjago',function(err, res) {
    if(err) throw err;
    console.log('Connected to Database');
});
mongoose.Promise = global.Promise;

app.set('superSecret', config.secret); // secret variable
// use body-parser middleware

// initialize routes
app.use('/api', require('./routes/api'));


// error handling middleware
/*app.use(function(err, req, res, next){
	console.log(err); // to see properties of message in our console
    	res.status(422).send({error: err.message});
});*/

/*app.put('/objetivo',setInterval(function () {
    console.log("Hello");
}, 500));*/


// listen for requests
app.listen(process.env.port || 3000, function(){
    console.log('now listening for requests without SSL');
});
/*var httpsServer = https.createServer(options, app);
httpsServer.listen(process.env.port || 3000, function(){
    console.log('now listening for requests');
});*/
/*https.createServer(options, function (req, res) {
    console.log(new Date()+' '+
        req.connection.remoteAddress+' '+
        req.method+' '+req.url);
    res.writeHead(200);
    res.end("hello world\n");
}).listen(3000);*/
