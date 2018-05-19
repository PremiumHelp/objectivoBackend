const Vocab = require('../model/Vocab')

class VocabController {

    constructor(apiRouter) {


        this.basePath = '/vocab';
        //POST: for creating user : provided url + '/user/'
        apiRouter.post(this.basePath + "/", this.create.bind(this));


        // POST: for Singing in  : provided url + '/api/user/login'
        apiRouter.get(this.basePath + "/:userId", this.getAll.bind(this));
    }



    create(req, res) {
        const method = 'VocabController.create';
        const path = 'POST ' + this.basePath + '/';
        console.info(method, 'Access to', path);

        const body = req.body;
        const userId = body.UserId;
        const original = body.Original;
        const translated = body.Translated;


        const newVocab = new Vocab({
            Original: original,
            Translated: translated,
            userId: userId
        });
        newVocab.save(function (err) {
            if (err) {
                res.status(500).json({success: false, msg: 'Error saving the vocab'});
                console.log(err);
            }
            else {
                res.status(201).json({success: true, msg: 'Successful created saved.'});
            }
        });
    }


    getAll(req, res) {
        const method = 'VocabController.getAll';
        const path = 'POST ' + this.basePath + '/';
        console.info(method, 'Access to', path);

        const userId = req.params.userId;

        Vocab.find({userId:userId}, function (err, results) {
            if (err) {
                res.status(500).json({success: false, msg: 'Error getting the vocab'});
                console.log(err);
            }
            else {
                res.status(200).json({vocabs: results});

            }
        });
    }
}


module.exports = VocabController;
