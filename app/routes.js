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
        var Comment = require('../app/models/comment.js');
        

        function getUsers(res) {
            User.find(function (err, users) {
                if (err) {
                    res.send(err);
                }
                res.json(users);
            });
        };
        module.exports = function (app, passport, gfs, fs) {

// =============================================================================
// TESTING ROUTES/FUNCTIONS ====================================================
// =============================================================================

            // USERLIST VIEW ==============================
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

            

            // test route for gridfs file deletion
            app.get('/deletefile/:filename', function(req, res) {
                gfs.remove({
                    filename: req.params.filename
                }, function(err) {
                    if (err)
                        console.error(err);
                });
                res.redirect('/');
            });


// =============================================================================
// PAGE VIEW ROUTES ============================================================
// =============================================================================

            // HOME VIEW ==============================
            app.get('/', function (req, res) {
                Comic.find({}, function(err, docs) {
                    res.render('index.ejs', {
                        user: req.user,
                        comics: docs
                    });
                });
            });

            // SEARCH VIEW ==============================
            app.get('/search', function(req, res){
                Comic.find({}, function (err, docs) {
                    res.render('search.ejs', {
                        user: req.user,
                        comics: docs,
                        query : req.query.query
                    });
                });         
            });

            // ACCESS VIEW ==============================
            app.get('/deniedAccess', function (req, res) {
                res.render('deniedAccess.ejs');
            });

            // PROFILE VIEW =========================
            app.get('/profile', isLoggedIn, function (req, res) {
                Comic.find({}, function (err, docs) {
                    res.render('profile.ejs', {
                        user: req.user,
                        comics: docs
                    });
                });
            });

            //UPLOAD VIEW ==============================
            app.get('/upload', isLoggedIn, function (req, res) {
                // can only access page if user has contributor status
                // the button is removed for non-contributors, but this is so that 
                //     typing /upload in the browser will do nothing
                if (req.user.local.contributor) {
                    Comic.find({}, function (err, docs) {
                        res.render('upload.ejs', {
                         user: req.user,
                         comics: docs,
                         id: req.params.id
                     });    
                    });
                }
                else {
                    res.redirect('/');
                }
            });

            // TOP CONTRIBUTORS =========================
            app.get('/top-contributors', function (req, res) {
                User.find({}, function (err, users) {
                        res.render('top-contributors.ejs', {
                            user: req.user,
                            users: users 
                        });
                });
            });

            // COMIC VIEW =========================
            app.get('/comics/:id', function (req, res) {
                // var hidden_value = req.getElementbyId("comic_get").innerHTML = req.getElementById("comic_get").value;
                // console.log("This should be the title of the comic");
                // console.log(hidden_value);
                Comic.findOne({_id: req.params.id}, function (err, comic) {
                    User.find({}, function (err, users) {
                        res.render('comic.ejs', {
                            user: req.user,
                            comic: comic,
                            users: users // list of all users - for commenting
                        });
                    });
                });
            });


            // BROWSE VIEW =========================
            app.get('/comics', function (req, res) {
                Comic.find({}, function (err, docs) {
                    res.render('comics.ejs', {
                        user: req.user,
                        comics: docs
                    });
                });
            });

            // TOPCOMICS VIEW ======================
            app.get('/topcomics', function (req, res) {
                Comic.find({}).sort({likes: 'desc'}).exec(function(err, docs) {
                    res.render('topcomics.ejs', {
                        user: req.user,
                        topcomics: docs
                    });
                });
            });

            // PANEL VIEW ==============================
            app.get('/comic/panel/:id', function(req, res){
                Comic.find({}, function (err, docs) {
                    res.render('panel.ejs', {
                        user: req.user,
                        comics: docs,
                    });
                });         
            });

            // ADD COMIC PANEL VIEW ==============================
            app.get('/comics/:id/addchapter', isLoggedIn, function (req, res) {
                // can only access page if user has contributor status
                // the button is removed for non-contributors, but this is so that 
                //     typing /upload in the browser will do nothing
                if (req.user.local.contributor) {
                    Comic.find({}, function (err, docs) {
                        res.render('addchapter.ejs', {
                         user: req.user,
                         comics: docs,
                         id: req.params.id
                     });    
                    });

                }
                else {
                    res.redirect('/');
                }
            });



// =============================================================================
// BASIC REQUESTS  =============================================================
// =============================================================================

// GENERAL REQUESTS ============================================================

            // LOGOUT ==============================
            app.get('/logout', function (req, res) {
                req.logout();
                res.redirect('/');
            });

// PROFILE CHANGES  ============================================================

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

            // PROFILE EDITTING/UPDATING ====================
            app.post('/profile', function (req, res) {
                var query = { 'local.username': req.user.local.username };
                if(req.body.email){
                    var newEmail = { $set: {'local.email': req.body.email}};                   
                    User.findOneAndUpdate(query, newEmail, { upsert: true }, function (err, doc) {
                        if (err)
                            return res.send(500, { error: err });
                    });
                }
                if(req.body.birthday){
                    var date = new Date(req.body.birthday);
                    var dateFormatted = date.toISOString().substr(0,10);
                    var newBirthday =  { $set: {'local.birthday': dateFormatted}}; 
                    User.findOneAndUpdate(query, newBirthday, { upsert: true }, function (err, doc) {
                        if (err)
                            return res.send(500, { error: err });
                    });
                }
                if(req.body.description){
                    var newDescription =  { $set: {'local.description': req.body.description }};  
                    User.findOneAndUpdate(query, newDescription, { upsert: true }, function (err, doc) {
                        if (err)
                            return res.send(500, { error: err });
                    });
                }
                res.redirect('/profile');
            });


            app.get('/profile/:id', function (req, res) {
                Comic.find({}, function (err, comics) {
                    User.findOne({'local.username' : req.params.id}, function (err, searchUser) {
                        console.log(req.params.id);
                        console.log(searchUser.local.username);
                        res.render('public-profile.ejs', {
                            user: req.user,
                            comics: comics,
                            displayUser: searchUser
                        });
                    });
                });
            });

            // PROFILE PICTURE UPLOAD ====================
            app.post('/uploadprofilepic', function(req, res) {
                var query = { 'local.username': req.user.local.username };
                process.nextTick(function () {
                    upload(req, res, function(err) {
                        if (err) {
                            return res.end("Error uploading file.");
                        }
                                    
                        var writestream = gfs.createWriteStream({
                            filename: imageFileName
                        });

                        var path = './public/uploads/' + imageFileName; 
                        fs.createReadStream(path).pipe(writestream);

                        User.findByIdAndUpdate(req.user._id, { $set: { 'local.picture': imageFileName }}, function(err) {
                            if (err)
                                console.log(err);
                        })

                        // waits for stream to complete
                        writestream.on('finish', function() {

                            // delete file from local storage
                            fs.unlink(path, function(err) {
                                if (err)
                                    console.log(err);
                            });

                            // refresh page
                            res.redirect('/profile');
                        });
                    });
                });
            });

            // REMOVE PROFILE PICTURE  ===================
            app.get('/removeprofilepic', function (req, res) {

                // remove photo from file system
                gfs.remove({
                    filename: req.user.local.picture
                }, function(err) {
                    if (err)
                        console.error(err);

                    // update the user's picture field
                    User.findByIdAndUpdate(req.user._id, { $unset: { 'local.picture': req.user.local.picture } }, function (err, model) {
                        if (err)
                            console.log(err);
                        
                        // refresh the profile page
                        res.redirect('/profile');
                    });
                });
            });


// COMIC CHANGES/REQUESTS ============================================================


            // CREATE A COMIC PAGE ================
            app.get('/create-comic', isLoggedIn, function (req, res) {
                // can only access page if user has contributor status
                // the button is removed for non-contributors, but this is so that 
                //     typing /upload in the browser will do nothing
                if (req.user.local.contributor) {
                    Comic.find({}, function (err, docs) {
                        res.render('create-comic.ejs', {
                         user: req.user,
                         comics: docs,
                         id: req.params.id
                     });    
                    });

                }
                else {
                    res.redirect('/');
                }
            });


            // DELETE A COMIC ====================
            app.post('/deletecomic/:id', function (req, res) {

                // find the comic to delete
                Comic.findOne({_id: req.params.id}, function (err, comic) {
                    if (err)
                        console.log(err);

                    // find the user to update
                    User.findOne({'local.username': comic.creatorID}, function (err, user) {
                        if (err)
                            console.log(err);

                        // removes comic from user's comic list
                        User.findByIdAndUpdate(user._id, { $pull: { 'local.comics': String(comic._id)}}, function (err, data) {
                            if (err)
                                console.log(err);
                        });

                        // iterate through the comic's images
                        for (i = 0; i < comic.images.length; i++) {

                            // removes image from user's image list
                            User.findByIdAndUpdate(user._id, { $pull: { 'local.images': comic.images[i]}}, function (err, data) {
                                if (err)
                                    console.log(err);
                            });

                            // removes image from the database
                            Image.remove({path: comic.images[i]}, function (err, user) {
                                if (err) 
                                    console.log(err);
                            });

                            // removes image from the file system
                            gfs.remove({filename: comic.images[i]}, function(err) {
                                if (err)
                                    console.error(err);
                            });
                        }
                    });

                    // removes comic from the favourites list of any user who favourited it
                    User.find({}, function (err, users) {
                        for (i = 0; i < users.length; i++) {
                            User.findByIdAndUpdate(users[i]._id, { $pull: { 'local.favourites': String(comic._id)}}, function (err, data) {
                                if (err)
                                    console.log(err);
                            });
                        }
                    });

                    // delete cover photo from file system, if it exists
                    if (comic.coverphoto) {
                        gfs.remove({filename: comic.coverphoto}, function(err) {
                            if (err)
                                console.error(err);
                        });
                    }

                    // removes comic from database
                    Comic.remove({_id: req.params.id}, function (err, user) {
                        if (err)
                            console.log(err);

                        // redirect to comics page
                        res.redirect('/comics');
                    });
                });
            });

            // COMIC COVER PAGE EDITTING ==============
            app.post('/comics/:id', isLoggedIn, function (req, res) {

                if (isLoggedIn) {

                    // query using id of current comic
                    var comicID = { '_id': req.params.id };

                    var newTitle = { $set: {'title': req.body.title}};  
                    var newDescription = { $set: {'description': req.body.description}};
                    var newTags = { $set: { 'tags': req.body.tags}};

                    Comic.findOneAndUpdate(comicID, newTitle, { upsert: true }, function (err, doc) {
                        if (err)
                            return res.send(500, { error: err });
                    });

                    Comic.findOneAndUpdate(comicID, newDescription, { upsert: true }, function (err, doc) {
                        if (err)
                            return res.send(500, { error: err });
                    });

                    Comic.findOneAndUpdate(comicID, newTags, { upsert: true }, function (err, doc) {
                        if (err)
                            return res.send(500, { error: err });
                    });
                    
                    Comic.find({}, function (err, docs) {
                        res.render('comic.ejs', {
                            user: req.user,
                            comics: docs,
                            id: req.params.id
                        });

                    });

                } else {
                    res.redirect('/deniedAccess');
                }
            });

            // FOLLOWING ====================
            app.post('/follow', function(req, res){

                // check first to see if you've liked the comic already
                // NEED TO WORK ON THIS

                var current_followers = req.body.followers;

                // called parseFloat to work with integers
                var new_followers = parseFloat(current_followers) + 1;

                // increase the number of followers on displayUser
                User.update({_id: req.body.follow_id}, {
                    follows: new_followers
                }, function (err, affected) {
                    console.log(err);
                });


                console.log("check");
                console.log(req.user._id);


                User.findByIdAndUpdate(req.user._id, { $push: { 'local.following': req.body.follow_id } }, { safe: true, upsert: true, new: true }, function (err, model) {
                    console.log(err);
                });

                // NEED TO FIX THIS
                res.redirect('/');
            }); 

            // FAVOURITING =========================
            app.post('/addfavourite/:id', function(req, res) {

                Comic.findOne({_id: req.params.id}, function(err, comic) {
                    if (err)
                        console.log(err);
                    var newFavourites = comic.favourites + 1;

                    Comic.findByIdAndUpdate(req.params.id, { $set: { favourites: newFavourites } }, function (err) {
                        if (err)
                            console.log(err);
                    });
                });

                User.findByIdAndUpdate(req.user._id, { $push: { 'local.favourites': req.params.id } }, { safe: true, upsert: true, new: true }, function (err, model) {
                    if (err)
                        console.log(err);
                    res.redirect('/comics/' + req.params.id);
                });
                
            });

            app.post('/removefavourite/:id', function(req, res) {

                Comic.findOne({_id: req.params.id}, function(err, comic) {
                    if (err)
                        console.log(err);
                    var newFavourites = comic.favourites - 1;

                    Comic.findByIdAndUpdate(req.params.id, { $set: { favourites: newFavourites } }, function (err) {
                        if (err)
                            console.log(err);
                    });
                });

                User.findByIdAndUpdate(req.user._id, { $pull: { 'local.favourites': req.params.id } }, function (err, data) {
                    if (err)
                        console.log(err);
                    res.redirect('/comics/' + req.params.id);
                });
            });



            // COMMENT SECTION =======================
            app.post('/comment', function (req, res) {

                    // console.log("commenting!!");

                    var newComment = new Comment({
                        user: req.user.local.username,
                        comment: req.body.comment
                    });

                    // console.log(newComment.user);
                    // console.log(newComment.comment);

                    // query using id of current comic
                    var comicID = req.body.comic_id;

                    // console.log(comicID);

                    Comic.findByIdAndUpdate(comicID, { $push: { 'comments': newComment } }, { safe: true, upsert: true, new: true }, function (err, model) {
                     console.log(err);

                     var id = comicID;

                     res.redirect('/comics/' + req.body.comic_id);

                 });
            });


// IMAGE UPLOADING =============================================================

            var imageFileName;

            var multer = require('multer');

            var storage = multer.diskStorage({
                destination: function (req, file, callback) {
                    callback(null, './public/uploads');
                },
                filename: function (req, file, callback) {
                    imageFileName = file.fieldname + '_' + Date.now() + '_' + file.originalname;

                    callback(null, imageFileName);
                }
            });

            var upload = multer({ storage: storage }).single('userPhoto');

            // ADD PANEL
            // uploads a new image to MongoDB using GridFS and adds required associations
            //
            app.post('/comics/:id/addpanel', function (req, res) {

                process.nextTick(function () {
                    upload(req, res, function (err) {
                        if (err) {
                            return res.end("Error uploading file.");
                        }
                                    
                        var writestream = gfs.createWriteStream({
                            filename: imageFileName
                        });

                        var path = './public/uploads/' + imageFileName; 
                        fs.createReadStream(path).pipe(writestream);

                        // creates a new image
                        // TODO: UPDATE IT SO THAT IT CHECKS WHAT CHAPTER THE COMIC IS CURRENTLY ON
                        var imageFilePath = new Image({ path: imageFileName, uploaderID: req.user.local.username, imageBelongsTo: req.params.id});


                        // get image name and add it to user's image array    GOOD2GO
                        User.findByIdAndUpdate(req.user._id, { $push: { 'local.images': imageFileName } }, { safe: true, upsert: true, new: true }, function (err, model) {
                            console.log(err);
                        });

                        //add image name to the comic's list of images
                        Comic.findOne({ _id : req.params.id }, function(err, obj) {
                            Comic.findByIdAndUpdate(obj._id, { $push: { 'images' : imageFileName } }, { safe: true, upsert: true, new: true }, function (err, model) {
                                console.log(err);
                            });
                        });

                        // save image path data to db
                        imageFilePath.save(function (err, imageFilePath) {
                            if (err)
                                return console.error(err);
                            console.log('photo upload successful!');
                        });

                        // waits for stream to complete
                        writestream.on('finish', function() {

                            // delete file from local storage
                            fs.unlink(path, function(err) {
                                if (err)
                                    console.log(err);
                            });

                            // refresh page
                            res.redirect('/comics/' + req.params.id);
                        });
                    });
                });
            });

            // CHANGE COVER PHOTO
            // uploads a new cover photo for a comic using GridFS
            //
            app.post('/comics/:id/changecover', function (req, res) {

                process.nextTick(function () {
                    upload(req, res, function (err) {
                        if (err) {
                            return res.end("Error uploading file.");
                        }
                                    
                        var writestream = gfs.createWriteStream({
                            filename: imageFileName
                        });

                        var path = './public/uploads/' + imageFileName; 
                        fs.createReadStream(path).pipe(writestream);

                        // delete old cover photo if it exists
                        Comic.findOne({_id: req.params.id}, function(err, comic) {
                            if (err)
                                console.log(err);
                            if (comic.coverphoto) {
                                gfs.remove({
                                    filename: comic.coverphoto
                                }, function(err) {
                                if (err)
                                    console.error(err);
                                });
                            }
                        });

                        // set comic coverphoto field to the new image path
                        Comic.findByIdAndUpdate(req.params.id, { $set: { coverphoto: imageFileName } }, function (err) {
                            if (err)
                                console.log(err);
                        });

                        // waits for stream to complete
                        writestream.on('finish', function() {

                            // delete file from local storage
                            fs.unlink(path, function(err) {
                                if (err)
                                    console.log(err);
                            });

                            // refresh page
                            res.redirect('/comics/' + req.params.id);
                        });
                    });
                });
            });

            // DISPLAY IMAGE
            // streams an image using GridFS with an associated ID
            //
            app.get('/gridfile/:id', function(req, res, next) {
                var pic_id = req.params.id;

                var readstream = gfs.createReadStream({
                    filename: pic_id
                });

                req.on('error', function(err) {
                    res.send(500, err);
                });

                readstream.on('error', function (err) {
                    res.send(500, err);
                });

                readstream.pipe(res);
            });


            // NEW COMIC
            // creates a new comic and saves the information to the database
            //
            app.post('/api/upload', function (req, res, next) {
                var newComic = new Comic({
                    title: req.body.title,
                    description: req.body.description,
                    tags: req.body.tags,
                    creatorID: req.user.local.username,
                    chapters: 1,
                    favourites: 0,
                    dateCreated: Date.now()
                });

                newComic.save(function (err, comic) {
                    if (err)
                        console.log(err);

                    User.findByIdAndUpdate(req.user._id, { $push: { 'local.comics': String(comic._id) } }, { safe: true, upsert: true, new: true }, function (err, model) {
                        if (err)
                            console.log(err);

                        res.redirect('/comics/' + comic._id);
                    });
                });
            });

            // I HAVE NO IDEA WHAT MOST OF THE THINGS UNDER ARE FOR =========================

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