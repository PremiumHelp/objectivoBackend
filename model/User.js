var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');


// set up a mongoose model for our database  note: the model has already implemented functions which i will use
var UserSchema = new Schema({
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        unique : true,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    savedVocab:
        {
            type: [String]
        },

});

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('Password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.Password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.Password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.Password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};


module.exports = mongoose.model('User', UserSchema);