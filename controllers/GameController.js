var listOfUsers = [];
var allUsers = [];
var Q = require("q");

const GameSchema = require('../model/Game')
const UserSchema = require('../model/User')

class GameController {
    constructor(apiRouter) {

        this.basePath = '/game';

        apiRouter.post(this.basePath + "/newGame/", this.create.bind(this));
        apiRouter.put(this.basePath + "/:gameId", this.changeResults.bind(this));
        apiRouter.post(this.basePath + "/getResults/:gameId", this.getResults.bind(this));


    }

    create(req, res) {
        const method = 'GameEndpoint.create ';
        const path = 'POST ' + this.basePath + '/';
        console.info(method, 'Access to', path);
        let self = this;
        const body = req.body;
        const firstPlayerId = body.FirstPlayerId;

        self.searchingForPlayer(firstPlayerId).then((respond) => {
            self.CreateNewGame(firstPlayerId, respond, self).then((game) => {
                res.status(200).send(game);
            }).catch((error) => {
                console.log('error in creating the game' + error);
                res.status(500).send(error);
            })
            //})

        }).catch((error) => {
            console.log('error in searching for players' + error);
            res.status(500).send(error);
        });


        listOfUsers = []

    };

    changeStatus(id, status, callback) {

        UserSchema.findOneAndUpdate({
            _id: id
        }, {$set: {status: status}}, callback);

    }

    promiseWhile(condition, body) {
        var done = Q.defer();

        function loop() {
            // When the result of calling `condition` is no longer true, we are
            // done.
            if (!condition()) return done.resolve();
            // Use `when`, in case `body` does not return a promise.
            // When it completes loop again otherwise, if it fails, reject the
            // done promise
            Q.when(body(), loop, done.reject);
        }

        // Start running the loop in the next tick so that this function is
        // completely async. It would be unexpected if `body` was called
        // synchronously the first time.
        Q.nextTick(loop);

        // The promise
        return done.promise;
    }

    cleanUsers(firstPlayer, users) {
        listOfUsers = [];
        for (var i = 0; i < users.length; i++) {
            if (firstPlayer != users[i]._id && users[i].status != 'playing') {
                listOfUsers.push(users[i]);
            }
        }

    }

    findUser(firstPlayer, self) {
        UserSchema.find({
            status: 'searching for game'
        }, function (err, users) {
            allUsers = users;
            self.cleanUsers(firstPlayer, users)
        });

    }

    searchingForPlayer(firstPlayerId) {
        const currentTime = Date.now();

        return new Promise((resolve, reject) => {
            listOfUsers = [];
            let self = this;
            self.changeStatus(firstPlayerId, 'searching for game', function (err, user) {
                if (err || !user) {
                    reject({success: false, err: err})
                    console.log(err + ' and this is the user id ' + firstPlayerId);
                } else {
                    self.promiseWhile(function () {
                        return Date.now() - currentTime < 6000 && listOfUsers.length == 0;
                    }, function () {
                        setTimeout(self.findUser, 2000, firstPlayerId, self);
                        return Q.delay(500);
                    }).then(function () {
                        if ((listOfUsers.length == 0)) {
                            self.changeStatus(firstPlayerId, 'nothing', function (err, user) {
                                if (err) reject({success: false, err: err});
                                else {
                                    reject({success: false, msg: 'Request timeout.'});
                                }
                            });
                        }
                        else {
                            self.cleanUsers(firstPlayerId, allUsers);
                            var secondPlayerId = listOfUsers[0]._id;
                            self.changeStatus(firstPlayerId, 'playing', function (err, user) {
                                if (err) reject({success: false, err: err});
                                else {
                                    self.changeStatus(secondPlayerId, 'playing', function (err, user) {
                                        if (err) reject({success: false, err: err});
                                        else {
                                            return resolve({success: true, player1: firstPlayerId, player2: secondPlayerId});
                                        }
                                    });
                                }
                            });
                        }
                    }).done();
                }
            });
        });

    }

    isPlayerInGame(playerId) {

        return new Promise((resolve, reject) => {
            GameSchema.findOne({
                $or: [{secondPlayerId: playerId}, {firstPlayerId: playerId + "a"}]
            }, function (err, game) {
                if (err) {
                    reject(err);
                }
                else if (game) {
                    resolve(game);
                }
                else {
                    console.log('this player is not involved in a game');
                    resolve(null);
                }
            });
        });

    }

    changeResults(req, res) {
        const method = 'GameEndpoint.changeResults ';
        const path = 'POST ' + this.basePath + '/';
        console.info(method, 'Access to', path);
        const body = req.body;
        const playerId = body.PlayerId;
        const score = body.Score;
        const gameId = req.params.gameId;

        GameSchema.findOne({
            _id: gameId
        }, function (err, game) {
            if (err) {
                res.status(500).send(err);
            }
            else if (game) {
                let update = {}
                if (playerId == game.firstPlayerId) {
                    update = {$set: {firstPlayerScore: score}};
                }
                else {
                    update = {$set: {secondPlayerScore: score}};

                }
                GameSchema.findOneAndUpdate({_id: gameId}, update, {new: true}, (err, doc) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send(err);
                    }
                    res.status(200).json({sucess: true});
                });
            }
        });


    };

    getResults(req, res) {
        const method = 'GameEndpoint.get ';
        const path = 'POST ' + this.basePath + '/getResults';
        console.info(method, 'Access to', path);
        const gameId = req.params.gameId;
        const playerId = req.body.playerId;

        GameSchema.findOne({
            _id: gameId
        }, function (err, game) {
            if (err) {
                res.status(500).send(err);
            }
            else if (game) {
                UserSchema.findOne({
                    _id: game.firstPlayerId
                }, function (err, firstUser) {
                    if (err) {
                        res.status(500).send(err);
                    }
                    else if (firstUser) {
                        UserSchema.findOne({
                            _id: game.secondPlayerId
                        }, function (err, secondUser) {
                            if (err) {
                                res.status(500).send(err);
                            }
                            else if (secondUser) {
                                let message = {};
                                if (playerId == game.firstPlayerId) {
                                    message = {
                                        currentUser: firstUser.Name, otherUser: secondUser.Name,
                                        currentUserScore: game.firstPlayerScore, otherUserScore: game.secondPlayerScore
                                    }
                                }
                                else {
                                    message = {
                                        currentUser: secondUser.Name, otherUser: firstUser.Name,
                                        currentUserScore: game.secondPlayerScore, otherUserScore: game.firstPlayerId
                                    }
                                }
                                res.status(200).send(message);
                            }
                        });
                    }
                });
            }
        });


    };

    CreateNewGame(firstPlayerId, respond, self) {

        return new Promise((resolve, reject) => {
            self.isPlayerInGame(firstPlayerId).then((game) => {
                if (game) {
                    resolve(game);
                }
                else {
                    const newGame = new GameSchema({
                        firstPlayerId: respond.player1,
                        secondPlayerId: respond.player2,
                        firstPlayerScore: 0,
                        secondPlayerScore: 0,
                    });
                    newGame.save(function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(newGame);
                        }
                    });
                }
            }).catch((error) => {
                reject(error);
            });
        });

    }


}

module.exports = GameController;
