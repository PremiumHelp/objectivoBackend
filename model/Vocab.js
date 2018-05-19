var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var VocabSchema = new Schema({
    Original: {
        type: String,
        required: true
    },
    Translated: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
});




module.exports = mongoose.model('Vocab', VocabSchema);
