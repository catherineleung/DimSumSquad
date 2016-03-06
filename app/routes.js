///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>
var ImageFile = (function () {
    function ImageFile(imageFileName) {
        this.fileName = imageFileName;
    }
    ImageFile.prototype.getfileName = function () {
        return this.fileName;
    };
    return ImageFile;
}());
var Router = (function () {
    function Router() {
        var Image = require('../app/models/image');
        var User = require('../app/models/user');
        var Comic = require('../app/models/comic.js');
        function getUsers(res) {
            User.find(function (err, users) {
                if (err) {
                    res.send(err);
                }
                res.json(users);
            });
        }
        ;
        module.exports = function (app, passport) {
            // normal routes ===============================================================
            // show the home page (will also have our login links)
            app.get('/', function (req, res) {
                res.render('index.ejs', {
                    user: req.user
                });
            });
            app.get('/angular', function (req, res) {
                res.render('angular.ejs', {
                    user: req.user
                });
            });
            // show the userlist page
            app.get('/userlist', function (req, res) {
                User.find(function (err, users) {
                    if (err)
                        res.send(err);
                    //res.json(users)
                    res.render('userlist', {
                        userlist: users,
                        user: req.user
                    });
                });
            });
            // PROFILE SECTION =========================
            app.get('/profile', isLoggedIn, function (req, res) {
                Image.find({}, function (err, docs) {
                    res.render('profile.ejs', {
                        user: req.user,
                        images: docs
                    });
                });
            });
            // UPLOAD SECTION =========================
            app.get('/upload', isLoggedIn, function (req, res) {
                // can only access page if user has contributor status
                // the button is removed for non-contributors, but this is so that 
                //     typing /upload in the browser will do nothing
                if (req.user.local.contributor) {
                    res.render('upload.ejs', {
                        user: req.user
                    });
                }
                else {
                    res.redirect('/');
                }
            });
            // LOGOUT ==============================
            app.get('/logout', function (req, res) {
                req.logout();
                res.redirect('/');
            });
            // COMICS ==============================
            app.get('/comics', function (req, res) {
                Image.find({}, function (err, docs) {
                    res.render('comics.ejs', {
                        user: req.user,
                        images: docs
                    });
                });
            });
            // BECOMING A CONTRIBUTOR ==============
            app.get('/contribute', function (req, res) {
                var query = { 'local.username': req.user.local.username };
                var newData = { $set: { 'local.contributor': true } };
                User.findOneAndUpdate(query, newData, { upsert: false }, function (err, doc) {
                    if (err)
                        return res.send(500, { error: err });
                    res.redirect('/profile');
                });
            });
            // =============================================================================
            // IMAGE UPLOADING =============================================================
            // =============================================================================
            // tracks # of posts
            var i = 0;
            var image_file_list = new Array;
            var image_file_list_string = new Array;
            var imageFileName;
            // added this in for file uploading
            var multer = require('multer');
            var storage = multer.diskStorage({
                destination: function (req, file, callback) {
                    callback(null, './public/uploads');
                },
                filename: function (req, file, callback) {
                    var uploadDate = Date.now();
                    // callback(null, file.fieldname + '_' + Date.now());
                    callback(null, file.fieldname + '_' + uploadDate + '_' + file.originalname);
                    // name of the image file
                    imageFileName = file.fieldname + '_' + uploadDate + '_' + file.originalname;
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
            // POST/UPLOAD PICTURE ========================================
            app.post('/api/photo', function (req, res) {
                process.nextTick(function () {
                    upload(req, res, function (err) {
                        if (err) {
                            return res.end("Error uploading file.");
                        }
                        var imageFilePath = new Image({ path: imageFileName, creatorID: req.user._id });
                        // add image ID to the creator's list of uploaded images
                        User.findByIdAndUpdate(req.user._id, { $push: { 'local.images': imageFileName } }, { safe: true, upsert: true, new: true }, function (err, model) {
                            console.log(err);
                        });
                        // save image path data to db
                        imageFilePath.save(function (err, imageFilePath) {
                            if (err)
                                return console.error(err);
                            console.log('photo upload successful!');
                            res.redirect('/');
                        });
                    });
                });
            });
            // saves title, description, caption, tags =====================
            app.post('/api/upload', function (req, res, next) {
                var newComic = new Comic({
                    title: req.body.title,
                    caption: req.body.caption,
                    description: req.body.description
                });
                console.log(req.body.title);
                console.log(req.body.caption);
                console.log(req.body.description);
                newComic.save(function (err, comic) {
                    if (err)
                        return next(err);
                    res.redirect('/');
                });
            });
            // =============================================================================
            // AUTHENTICATE (FIRST LOGIN) ==================================================
            // =============================================================================
            // locally --------------------------------
            // LOGIN ===============================
            // show the login form
            app.get('/login', function (req, res) {
                res.render('login.ejs', { message: req.flash('loginMessage'), user: req.user });
            });
            // process the login form
            app.post('/login', passport.authenticate('local-login', {
                successRedirect: '/',
                failureRedirect: '/login',
                failureFlash: true // allow flash messages
            }));
            // SIGNUP =================================
            // show the signup form
            app.get('/signup', function (req, res) {
                res.render('signup.ejs', { message: req.flash('signupMessage'), user: req.user });
            });
            // process the signup form
            app.post('/signup', passport.authenticate('local-signup', {
                successRedirect: '/',
                failureRedirect: '/signup',
                failureFlash: true // allow flash messages
            }));
            // facebook -------------------------------
            // send to facebook to do the authentication
            app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));
            // handle the callback after facebook has authenticated the user
            app.get('/auth/facebook/callback', passport.authenticate('facebook', {
                successRedirect: '/profile',
                failureRedirect: '/'
            }));
            // twitter --------------------------------
            // send to twitter to do the authentication
            app.get('/auth/twitter', passport.authenticate('twitter', { scope: 'email' }));
            // handle the callback after twitter has authenticated the user
            app.get('/auth/twitter/callback', passport.authenticate('twitter', {
                successRedirect: '/profile',
                failureRedirect: '/'
            }));
            // google ---------------------------------
            // send to google to do the authentication
            app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
            // the callback after google has authenticated the user
            app.get('/auth/google/callback', passport.authenticate('google', {
                successRedirect: '/profile',
                failureRedirect: '/'
            }));
            // =============================================================================
            // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
            // =============================================================================
            // locally --------------------------------
            app.get('/connect/local', function (req, res) {
                res.render('connect-local.ejs', { message: req.flash('loginMessage') });
            });
            app.post('/connect/local', passport.authenticate('local-signup', {
                successRedirect: '/profile',
                failureRedirect: '/connect/local',
                failureFlash: true // allow flash messages
            }));
            // facebook -------------------------------
            // send to facebook to do the authentication
            app.get('/connect/facebook', passport.authorize('facebook', { scope: 'email' }));
            // handle the callback after facebook has authorized the user
            app.get('/connect/facebook/callback', passport.authorize('facebook', {
                successRedirect: '/profile',
                failureRedirect: '/'
            }));
            // twitter --------------------------------
            // send to twitter to do the authentication
            app.get('/connect/twitter', passport.authorize('twitter', { scope: 'email' }));
            // handle the callback after twitter has authorized the user
            app.get('/connect/twitter/callback', passport.authorize('twitter', {
                successRedirect: '/profile',
                failureRedirect: '/'
            }));
            // google ---------------------------------
            // send to google to do the authentication
            app.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));
            // the callback after google has authorized the user
            app.get('/connect/google/callback', passport.authorize('google', {
                successRedirect: '/profile',
                failureRedirect: '/'
            }));
            // =============================================================================
            // UNLINK ACCOUNTS =============================================================
            // =============================================================================
            // used to unlink accounts. for social accounts, just remove the token
            // for local account, remove email and password
            // user account will stay active in case they want to reconnect in the future
            // local -----------------------------------
            app.get('/unlink/local', isLoggedIn, function (req, res) {
                var user = req.user;
                user.local.email = undefined;
                user.local.password = undefined;
                user.save(function (err) {
                    res.redirect('/profile');
                });
            });
            // facebook -------------------------------
            app.get('/unlink/facebook', isLoggedIn, function (req, res) {
                var user = req.user;
                user.facebook.token = undefined;
                user.save(function (err) {
                    res.redirect('/profile');
                });
            });
            // twitter --------------------------------
            app.get('/unlink/twitter', isLoggedIn, function (req, res) {
                var user = req.user;
                user.twitter.token = undefined;
                user.save(function (err) {
                    res.redirect('/profile');
                });
            });
            // google ---------------------------------
            app.get('/unlink/google', isLoggedIn, function (req, res) {
                var user = req.user;
                user.google.token = undefined;
                user.save(function (err) {
                    res.redirect('/profile');
                });
            });
            // =============================================================================
            // ANGULARJS ROUTES ============================================================
            // =============================================================================
            app.get('/api/users', function (req, res) {
                getUsers(res);
            });
            app.post('/api/users', function (req, res) {
                var newUser = new User();
                newUser.local.email = req.body.email;
                newUser.local.password = newUser.generateHash(req.body.password);
                newUser.local.username = req.body.username;
                // check to see if they checked off the contributor box
                // need true and false case because req.body.contributor does not produce boolean
                newUser.local.contributor = req.body.contributor ? true : false;
                newUser.save(function (err) {
                    if (err)
                        res.send(err);
                    getUsers(res);
                });
            });
            app.delete('/api/users/:user_id', function (req, res) {
                User.remove({
                    _id: req.params.user_id
                }, function (err, user) {
                    if (err) {
                        res.send(err);
                    }
                    getUsers(res);
                });
            });
        };
        // route middleware to ensure user is logged in
        function isLoggedIn(req, res, next) {
            if (req.isAuthenticated())
                return next();
            res.redirect('/');
        }
    } // END CONSTRUCTOR
    return Router;
}()); // END ROUTER CLASS
var router = new Router();
