var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// The schema defines how the players are going to be saved in the Mongo database
var GameSchema=new Schema({

    firstPlayerId: {
        type: String,
        required: true
    },
    secondPlayerId: {
        type: String,
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
