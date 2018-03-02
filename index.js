var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var port = process.env.PORT || 4200;
var UserController = require('./controllers/UserController');
var databaseConfig = require('./config/database');
const http = require('http');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// connect to MONGODB using mongoose
mongoose.connect(databaseConfig.database);


// bundle FOR MY API ROOT
var apiRoutes = express.Router();
app.use('', apiRoutes);

new UserController(apiRoutes);

http.createServer(app).listen(port);
console.log('There localhost is: http://localhost:' + port);
