const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GeoSchema = new Schema({
    type: {
        type: String,
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        index: '2dsphere'
    }
});

// create ninja Schema & model
const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name field is required']
    },
    password: {
        type: String,
        required: [true, 'Name field is required']
    },
    geometry: GeoSchema,
    circles: Object,
    warningDistance: {
        type: Number,
        default: 5000
    },
    bandLevelBattery: {
        type: Number,
        default: -1
    },
    phoneLevelBattery: {
        type: Number,
        default: -1
    }

});


const User = mongoose.model('user', UserSchema);

module.exports = User;
