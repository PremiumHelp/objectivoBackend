var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');


// The schema defines how the players are going to be saved in the Mongo database
var GameSchema=new Schema({

    firstPlayerId: {
        type: String,
        unique: true,
        required: true
    },
    secondPlayerId: {
        type: String,
        unique : true,
        required: true
    },

    firstPlayerScore:{
        type: Number,
        required: true
    },

    secondPlayerScore:{
        type: Number,
        required: true

    }

});



module.exports = mongoose.model('Game', GameSchema);