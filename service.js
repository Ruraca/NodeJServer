var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('./config');

exports.createToken = function(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
       // exp: moment().add(0,0666667, "hours").unix(),
        exp: moment().add(4, "hours").unix(),
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
};
