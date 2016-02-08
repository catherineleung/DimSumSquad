///<reference path='types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='types/DefinitelyTyped/express/express.d.ts'/> 
var Application = (function () {
    function Application() {
        var express = require('express');
        var path = require('path');
        var favicon = require('serve-favicon');
        var logger = require('morgan');
        var cookieParser = require('cookie-parser');
        var bodyParser = require('body-parser');
        var mongoose = require('mongoose');
        //mongoose
        mongoose.connect('mongodb://kathyskrafts:dimsumsquad@ds059185.mongolab.com:59185/heroku_f0bt5b2s');
        mongoose.connection.on("open", function() {
            console.log("connection to database done!");
        });

        mongoose.connection.on("error", function() {
            console.log("error");
        });
        // Mongo code
        var mongo = require('mongodb');
        var monk = require('monk');
        var uri = 'mongodb://kathyskrafts:dimsumsquad@ds059185.mongolab.com:59185/heroku_f0bt5b2s';
        var db = monk(uri);
        var routes = require('./routes/index');
        var users = require('./routes/users');
        var app = express();
        // Make our db accessible to our router
        app.use(function (req, res, next) {
            req.db = db;
            next();
        });
        // view engine setup
        app.set('views', path.join(__dirname, 'views'));
        app.engine('html', require('ejs').renderFile);
        app.set('view engine', 'html');
        // uncomment after placing your favicon in /public
        //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        app.use(logger('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, 'public')));
        // added static route for uploads folder
        app.use(express.static(path.join(__dirname, 'uploads')));
        app.use('/', routes);
        app.use('/users', users);

        // configuring passport
        var passport = require('passport');
        var LocalStrategy = require('passport-local').Strategy;
        var User = require('./models/user');
        var bCrypt = require('bcrypt-nodejs');
        var expressSession = require('express-session');
        app.use(expressSession({secret:'mySecret', resave: false, saveUninitialized: false}));
        app.use(passport.initialize());
        app.use(passport.session());

        var flash = require('connect-flash');
        app.use(flash());

        // initialize passport
        var initPassport = require('./passport/init');
        initPassport(passport);
        console.log("passport initialized!");



        // catch 404 and forward to error handler
        app.use(function (req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });
        // error handlers
        // development error handler
        // will print stacktrace
        if (app.get('env') === 'development') {
            app.use(function (err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        }
        // production error handler
        // no stacktraces leaked to user
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: {}
            });
        });
        module.exports = app;
    }
    return Application;
})();
var application = new Application();
