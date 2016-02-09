///<reference path='../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../types/DefinitelyTyped/express/express.d.ts'/>

class ImageFile {
    
    private fileName: string;
    
    constructor(imageFileName: string) {
        this.fileName = imageFileName;
    }
    
    getfileName() {
        return this.fileName;
    }
}

class Router {

    constructor() {

        module.exports = function(app, passport) {

            // normal routes ===============================================================

            // show the home page (will also have our login links)
            app.get('/', function(req, res) {
                res.render('index.ejs', {
                    user: req.user
                });
            });

            // PROFILE SECTION =========================
            app.get('/profile', isLoggedIn, function(req, res) {
                res.render('profile.ejs', {
                    user: req.user
                });
            });

            // UPLOAD SECTION =========================
            app.get('/upload', isLoggedIn, function(req, res) {
                res.render('upload.ejs', {
                    user: req.user
                });
            });

            // LOGOUT ==============================
            app.get('/logout', function(req, res) {
                req.logout();
                res.redirect('/');
            });

            // =============================================================================
            // IMAGE UPLOADING =============================================================
            // =============================================================================

            // tracks # of posts
            var i = 0;
            var image_file_list = new Array;
            var image_file_list_string = new Array;
                
            // added this in for file uploading
            var multer = require('multer');
            var storage = multer.diskStorage({
                destination: function(req, file, callback) {
                    callback(null, './uploads');
                },
                filename: function(req, file, callback) {
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

            // POST/UPLOAD PICTURE ========================================

            app.post('/api/photo', function(req, res) {
                upload(req, res, function(err) {
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
                    var comic_images = db.get('comic_images_collection');
                    console.log("just set the collection!");
                    // Need to change this later to go through the entire collection 
                    var name = image_file_list_string[i - 1];
                    comic_images.insert({
                        "image_name": name
                    }, function(err, doc) {
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
                    // res.rediect('/uploads');
                    /*
                   router.gt('/uploads', function(req, res){
                        res.render('uploads', { image_name: "/" + image_file_list_string[0]})
                    });
                    */
                    // res.sendStatus(200);
                });
            });



            // =============================================================================
            // AUTHENTICATE (FIRST LOGIN) ==================================================
            // =============================================================================

            // locally --------------------------------
            // LOGIN ===============================
            // show the login form
            app.get('/login', function(req, res) {
                res.render('login.ejs', { message: req.flash('loginMessage'), user: req.user });
            });

            // process the login form
            app.post('/login', passport.authenticate('local-login', {
                successRedirect: '/profile', // redirect to the secure profile section
                failureRedirect: '/login', // redirect back to the signup page if there is an error
                failureFlash: true // allow flash messages
            }));

            // SIGNUP =================================
            // show the signup form
            app.get('/signup', function(req, res) {
                res.render('signup.ejs', { message: req.flash('signupMessage'), user: req.user });
            });

            // process the signup form
            app.post('/signup', passport.authenticate('local-signup', {
                successRedirect: '/', // redirect to index
                failureRedirect: '/signup', // redirect back to the signup page if there is an error
                failureFlash: true // allow flash messages
            }));

            // facebook -------------------------------

            // send to facebook to do the authentication
            app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

            // handle the callback after facebook has authenticated the user
            app.get('/auth/facebook/callback',
                passport.authenticate('facebook', {
                    successRedirect: '/profile',
                    failureRedirect: '/'
                }));

            // twitter --------------------------------

            // send to twitter to do the authentication
            app.get('/auth/twitter', passport.authenticate('twitter', { scope: 'email' }));

            // handle the callback after twitter has authenticated the user
            app.get('/auth/twitter/callback',
                passport.authenticate('twitter', {
                    successRedirect: '/profile',
                    failureRedirect: '/'
                }));


            // google ---------------------------------

            // send to google to do the authentication
            app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

            // the callback after google has authenticated the user
            app.get('/auth/google/callback',
                passport.authenticate('google', {
                    successRedirect: '/profile',
                    failureRedirect: '/'
                }));

            // =============================================================================
            // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
            // =============================================================================

            // locally --------------------------------
            app.get('/connect/local', function(req, res) {
                res.render('connect-local.ejs', { message: req.flash('loginMessage') });
            });
            app.post('/connect/local', passport.authenticate('local-signup', {
                successRedirect: '/profile', // redirect to the secure profile section
                failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
                failureFlash: true // allow flash messages
            }));

            // facebook -------------------------------

            // send to facebook to do the authentication
            app.get('/connect/facebook', passport.authorize('facebook', { scope: 'email' }));

            // handle the callback after facebook has authorized the user
            app.get('/connect/facebook/callback',
                passport.authorize('facebook', {
                    successRedirect: '/profile',
                    failureRedirect: '/'
                }));

            // twitter --------------------------------

            // send to twitter to do the authentication
            app.get('/connect/twitter', passport.authorize('twitter', { scope: 'email' }));

            // handle the callback after twitter has authorized the user
            app.get('/connect/twitter/callback',
                passport.authorize('twitter', {
                    successRedirect: '/profile',
                    failureRedirect: '/'
                }));


            // google ---------------------------------

            // send to google to do the authentication
            app.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));

            // the callback after google has authorized the user
            app.get('/connect/google/callback',
                passport.authorize('google', {
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
            app.get('/unlink/local', isLoggedIn, function(req, res) {
                var user = req.user;
                user.local.email = undefined;
                user.local.password = undefined;
                user.save(function(err) {
                    res.redirect('/profile');
                });
            });

            // facebook -------------------------------
            app.get('/unlink/facebook', isLoggedIn, function(req, res) {
                var user = req.user;
                user.facebook.token = undefined;
                user.save(function(err) {
                    res.redirect('/profile');
                });
            });

            // twitter --------------------------------
            app.get('/unlink/twitter', isLoggedIn, function(req, res) {
                var user = req.user;
                user.twitter.token = undefined;
                user.save(function(err) {
                    res.redirect('/profile');
                });
            });

            // google ---------------------------------
            app.get('/unlink/google', isLoggedIn, function(req, res) {
                var user = req.user;
                user.google.token = undefined;
                user.save(function(err) {
                    res.redirect('/profile');
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

} // END ROUTER CLASS

var router = new Router();