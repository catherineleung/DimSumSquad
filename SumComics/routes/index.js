///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
var User = (function () {
    function User(username, email, password, confirmpassword) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.confirmpassword = confirmpassword;
    }
    User.prototype.getName = function () {
        return this.username;
    };
    User.prototype.getEmail = function () {
        return this.email;
    };
    User.prototype.getPassword = function () {
        return this.password;
    };
    User.prototype.getConfirmPassword = function () {
        return this.confirmpassword;
    }
    return User;
})();
var Router = (function () {
    function Router() {
        var express = require('express');
        var router = express.Router();
        /* GET home page. */
        router.get('/', function (req, res, next) {
            res.render('index', { title: 'Express' });
        });
        /* GET Userlist page. */
        router.get('/userlist', function (req, res) {
            var db = req.db;
            var collection = db.get('usercollection');
            collection.find({}, {}, function (e, docs) {
                res.render('userlist', {
                    "userlist": docs
                });
            });
        });
        /* GET New User page. */
        router.get('/newuser', function (req, res) {
            res.render('newuser', {
                title1: 'Registration'
            });
        });
        /* POST to Add User Service */
        router.post('/adduser', function (req, res) {
            // Set our internal DB variable
            var db = req.db;
            // Get our form values. These rely on the "name" attributes
            var user = new User(req.body.username, req.body.useremail, req.body.userpassword, req.body.userconfirmpassword);
            var userName = user.getName();
            var userEmail = user.getEmail();
            var userPassword = user.getPassword();
            var userConfirmPassword = user.getConfirmPassword();
            // Set our collection
            var collection = db.get('usercollection');
            // Submit to the DB
            collection.insert({
                "username": userName,
                "email": userEmail,
                "password": userPassword,
                "userconfirmpassword": userConfirmPassword
            }, function (err, doc) {
                if (err) {
                    // If it failed, return error
                    res.send("There was a problem adding the information to the database.");
                }
                else {
                    // And forward to success page
                    res.redirect("userlist");
                }
            });
        });
        // Remove all users
        router.post('/removeallusers', function (req, res) {
            var db = req.db;
            var collection = db.get('usercollection');
            collection.remove({});
            res.redirect("userlist");
        });
        // Remove user
        router.post('/removeuser', function (req, res) {
            var db = req.db;
            var userName = req.body.username;
            var collection = db.get('usercollection');
            collection.remove({ "username": { $eq: userName } }, function (err, doc) {
                if (err) {
                    // If it failed, return error
                    res.send("There was a problem removing the information to the database.");
                }
                else {
                    // And forward to success page
                    res.redirect("userlist");
                }
            });
        });
        module.exports = router;
    }
    return Router;
})();
var router = new Router();
