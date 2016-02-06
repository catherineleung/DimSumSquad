///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>

// added for file uploading from: https://codeforgeek.com/2014/11/file-uploads-using-node-js/

var multer  =   require('multer');
var storage =   multer.diskStorage({
            destination: function (req, file, callback) {
            callback(null, './uploads');
                },
            filename: function (req, file, callback) {
            callback(null, file.fieldname + '-' + Date.now());
            }
            });
var upload = multer({ storage : storage}).single('userPhoto');
// end of adding for file uploading

var Router = (function () {
    function Router() {
        var express = require('express');
        var router = express.Router();
        var User = require('../model/user.js');
        /* GET home page. */
        router.get('/', function (req, res, next) {
            res.render('index', { title: 'Express' });
        });

        /* GET upload page. */

        router.get('/upload',function(req,res){
            res.sendFile(__dirname + "/upload.html");
        });

        /* POST/UPLOAD picture */

        router.post('/api/photo',function(req,res){
            upload(req,res,function(err) {
            if(err) {
                return res.end("Error uploading file.");
            }
            res.end("File is uploaded");
            res.redirect('/upload');
            });
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
                "confirmpassword": userConfirmPassword
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
