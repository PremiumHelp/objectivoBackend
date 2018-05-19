const User = require('../model/User')

class UserController {

    constructor(apiRouter) {


        this.basePath = '/user';
        apiRouter.post(this.basePath + "/signUp", this.signUp.bind(this));


        // POST: for Singing in  : provided url + '/api/user/login'
        apiRouter.post(this.basePath + "/signIn", this.signIn.bind(this));
    }



    signUp(req, res) {
        console.log('user controller signUp' )

        if (!req.body.Email || !req.body.Password || !req.body.Name) {
            res.status(400).json({success: false, msg: 'Please pass the information'});

        } else {
            var newUser = new User({
                Name: req.body.Name,
                Email: req.body.Email,
                Password: req.body.Password,

            });
            // save the user
            console.log('create new user: ' + newUser);

            newUser.save(function (err, savedUser) {
                if (err) {
                    res.status(409).json({success: false, msg: 'Email already exists'});
                }
                else {
                    res.status(201).json({success: true, userId: savedUser._id});
                }
            });
        }
    }

    signIn(req, res) {

        console.log('in log in  + ' + req.body.Email)
        User.findOne({
            Email: req.body.Email
        }, function (err, user) {
            if (err) res.status(502).json({success: false, msg: err.message});

            if (!user) {
                return res.status(403).json({success: false, msg: 'Log in failed. Email not found.'});
            } else {
                user.comparePassword(req.body.Password, function (err, isMatch) {
                    if (isMatch && !err) {
                        res.status(200).json({success: true, userId: user._id});
                    } else {
                        return res.status(401).json({success: false, msg: 'Log in failed. Wrong password.'});
                    }
                });
            }
        });
    }

}


module.exports = UserController;