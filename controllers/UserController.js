const User = require('../model/User')

class UserController {

    constructor(apiRouter) {


        this.basePath = '/user';
        //POST: for creating user : provided url + '/user/'
        apiRouter.post(this.basePath + "/", this.signUp.bind(this));
        // GET: for signing out The user : provided url + '/api/user/123abc' where 123abc is The id of The user to sign out
        apiRouter.get(this.basePath + "/signOut", this.signOut.bind(this));
        // POST: for Singing in  : provided url + '/api/user/login'
        apiRouter.post(this.basePath + "/signIn", this.signIn.bind(this));
    }

    signOut(req, res) {

        var name = req.params.name;
        return res.status(200).json({success: true, msg: 'Signed out successfully'});

    }

    signUp(req, res) {
        console.log('user controller signUp')

        if (!req.body.email || !req.body.password || !req.body.name) {
            res.status(400).json({success: false, msg: 'Please pass the information'});

        } else {
            var newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,

            });
            // save the user
            console.log('create new user: ' + newUser);

            newUser.save(function (err) {
                if (err) {
                    res.status(409).json({success: false, msg: 'Email already exists'});
                }
                else {
                    res.status(201).json({success: true, msg: 'Successful created new user.'});
                }
            });
        }
    }

    signIn(req, res) {

        User.findOne({
            email: req.body.email
        }, function (err, user) {
            if (err) res.status(502).json({success: false, msg: err.message});

            if (!user) {
                return res.status(403).json({success: false, msg: 'Sign in failed. Email not found.'});
            } else {
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch && !err) {
                        res.status(200).json({success: true, name: user.name});
                    } else {
                        return res.status(401).json({success: false, msg: 'Sign in failed. Wrong password.'});
                    }
                });
            }
        });
    }
}


module.exports = UserController;