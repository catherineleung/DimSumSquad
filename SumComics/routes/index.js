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
    };
    return User;
})();
var ImageFile = (function () {
    function ImageFile(imageFileName) {
        this.fileName = imageFileName;
    }
    ImageFile.prototype.getfileName = function () {
        return this.fileName;
    };
    return ImageFile;
})();
var Router = (function () {
    function Router() {
        var express = require('express');
        var router = express.Router();
        // tracks # of posts
        var i = 0;
        var image_file_list = new Array();
        var image_file_list_string = new Array;
        // added this in for file uploading
        var multer = require('multer');
        var storage = multer.diskStorage({
            destination: function (req, file, callback) {
                callback(null, './uploads');
            },
            filename: function (req, file, callback) {
                // callback(null, file.fieldname + '_' + Date.now());
                callback(null, file.fieldname + '_' + Date.now() + '_' + file.originalname);
                // name of the image file
                var imageFileName = file.fieldname + '_' + Date.now() + '_' + file.originalname;
                image_file_list.push(new ImageFile(imageFileName));
                // image_file_list[i] = new ImageFile(imageFileName);
                // debugging
                console.log("This is the imageFileName: " + imageFileName);
                // adds image name to the array
                image_file_list_string.push(imageFileName);
                // increment
                i++;
            }
        });
        var upload = multer({ storage: storage }).single('userPhoto');
        // end of file uploading stuff
        /* GET home page. */
        router.get('/', function (req, res, next) {
            res.render('index', { title: 'Express' });
        });
        /* GET upload page. */
        router.get('/upload', function (req, res) {
            res.sendFile(__dirname + "/upload.html");
        });
        /* POST/UPLOAD picture */
        router.post('/api/photo', function (req, res) {
            upload(req, res, function (err) {
                if (err) {
                    return res.end("Error uploading file.");
                }
                /*
                for (var IF in image_file_list_string){
                    // console.log(IF);
                    res.render('uploads', { image_name: + "/" + IF} )
                } */
                // set the collection
                var db = req.db;
                var comic_images = db.get('comic_images _collection');
                console.log("just set the collection!");
                // Need to change this later to go through the entire collection 
                var name = image_file_list_string[i - 1];
                comic_images.insert({
                    "image_Name": name
                }, function (err, doc) {
                    if (err) {
                        // If it failed, return error
                        res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        // And forward to success page
                        console.log("in here!");
                        res.redirect('/uploads');
                    }
                });
                // res.redirect('/uploads');
                /*
                router.get('/uploads', function(req, res){
                    res.render('uploads', { image_name: "/" + image_file_list_string[0]})
                });
*/
                // res.sendStatus(200);
            });
});
/* GET uploads page */
router.get('/uploads', function (req, res) {
    console.log("in get uploads call");
    console.log("first picture name: " + image_file_list_string[0]);
    res.render('uploads', { image_name: image_file_list_string[0] });
            /* for (var IF in image_file_list_string){
                console.log(IF);
                res.render('uploads', { image_name: IF})
            }
            // res.render('uploads'); */
        });






        // passport stuff
        var passport = require('passport');
        var User = require('../models/user');
        var logUserSchema = require('../models/logUser');

        var isAuthenticated = function(req, res, next) {
            // if user authenticated in the session, call next() to call next request handler
            // passport adds this method to request object. middleware allowed to add properties 
            // to request and response objects
            if (req.isAuthenticated())
                return next();
            // if user not authenticated, redirect them to login page/home page
            res.redirect('/');
        }

        function logUser(username, type) {
            var record = new logUserSchema();
            record.timestamp = Date.now();
            record.user = username;
            record.type = type;

            record.save(function(err) {
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        status: 'failure'
                    });
                }
            });
        }

        module.exports = function(passport){
        /* GET login page */
        router.get('/', function(req, res) {
            console.log("inside get login page stuff");
            // display login page with any flash msg, if any
            res.render('index', {
                message: req.flash('message')
            });
        });

        /* Handle Login POST */
        router.post('/login', passport.authenticate('login',{
            successRedirect: '/profile',
            failureRedirect: '/login',
            failureFlash: true
        }));


        }

        




        // end of passport stuff




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
