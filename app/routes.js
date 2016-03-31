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
        var Chapter = require('../app/models/chapter.js');
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
                User.find({}, function(err, docs2){
                    Comic.find({}, function(err, docs) {
                    res.render('index.ejs', {
                        user: req.user,
                        comics: docs,
                        users: docs2
                    });
                });
                });
            });

            // ABOUT VIEW ==============================
            app.get('/about', function (req, res) {
                res.render('about.ejs', {
                    user: req.user,
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
                User.find({}).sort({'local.score': 'desc'}).exec(function(err, users) {
                    res.render('top-contributors.ejs', {
                        user: req.user,
                        users: users
                    });
                });
            });

            // COMIC VIEW =========================
            app.get('/comics/:id', function (req, res) {
                Comic.findByIdAndUpdate(req.params.id, { $inc: { views: 1 }}, function (err) {
                    if (err)
                        console.log(err);

                    Comic.findOne({_id: req.params.id}, function (err, comic) {
                        if (err)
                            console.log(err);

                        User.find({}, function (err, users) {
                            if (err)
                                console.log(err);

                            Chapter.find({}, function (err, chapters) {
                                if (err)
                                    console.log(err);

                                var filteredChapters = chapters.filter(function (chapter) {
                                    return chapter.comicID == req.params.id;
                                });

                                res.render('comic.ejs', {
                                    user: req.user,
                                    comic: comic,
                                    users: users,
                                    chapters: filteredChapters
                                });
                            });
                        });
                    });
                });
            });

            // CHAPTER VIEW =========================
            app.get('/comics/:id/chapters/:chapter/:panel', function (req, res) {
                Comic.findByIdAndUpdate(req.params.id, { $inc: { views: 1 }}, function (err) {
                    if (err)
                        console.log(err);

                    Comic.findOne({_id: req.params.id}, function (err, comic) {
                        if (err)
                            console.log(err);

                        Chapter.findOne({_id: req.params.chapter}, function (err, chapter) {
                            if (err)
                                console.log(err);

                            if (chapter.images[req.params.panel]) {
                                Image.findOne({_id: chapter.images[req.params.panel]}, function (err, image) {
                                    if (err)
                                        console.log(err);

                                    res.render('chapter.ejs', {
                                        user: req.user,
                                        comic: comic,
                                        chapter: chapter,
                                        panel: req.params.panel,
                                        valid: true,
                                        imagePath: image.path
                                    });
                                });
                            } else {
                                res.render('chapter.ejs', {
                                    user: req.user,
                                    comic: comic,
                                    chapter: chapter,
                                    panel: req.params.panel,
                                    valid: false
                                });
                            }
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


// =============================================================================
// BASIC REQUESTS  =============================================================
// =============================================================================

// GENERAL REQUESTS ============================================================

            // LOGOUT ==============================
            app.get('/logout', function (req, res) {
                req.logout();
                var url = req.header('Referer');
                res.redirect(url);
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

            // DELETE OWN ACCOUNT ===========================
            app.get('/deleteaccount', function (req, res) {
               User.remove({
                _id: req.user._id
               }, function (err) {
                    if (err)
                        console.log(err);
               });
               res.redirect('/');
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

                        // removes comic from user's comic list, decrements user's score by 5
                        User.findByIdAndUpdate(user._id, { 
                            $pull: { 'local.comics': String(comic._id) },
                            $inc: { 'local.score': -5 }
                        }, function (err) {
                            if (err)
                                console.log(err);
                        });

                        // iterate through the comic's chapters
                        for (i = 0; i < comic.chapters.length; i++) {

                            // find the chapter
                            Chapter.findOne({_id: comic.chapters[i]}, function (err, chapter) {
                                if (err)
                                    console.log(err);

                                // iterate through the chapter's images
                                for (j = 0; j < chapter.images.length; j++) {

                                    // find the image
                                    Image.findOne({_id: chapter.images[j]}, function (err, image) {
                                        if (err)
                                            console.log(err);

                                        // update the user who uploaded the image:
                                        // - decrement user's score by 2
                                        // - remove image from user's image list
                                        //
                                        User.findOne({'local.username': image.uploaderID}, function (err, imageUser) {
                                            if (err)
                                                console.log(err);

                                            User.findByIdAndUpdate(imageUser._id, { 
                                                $inc: { 'local.score': -2 },
                                                $pull: { 'local.images': String(image._id) }
                                            }, function (err) {
                                                if (err)
                                                    console.log(err);
                                            });
                                        });
                                        
                                        // removes image from the file system
                                        gfs.remove({filename: image.path}, function (err) {
                                            if (err)
                                                console.error(err);
                                        });

                                        // removes image from the database
                                        Image.remove({_id: image._id}, function (err) {
                                            if (err) 
                                                console.log(err);
                                        });
                                    });
                                }

                                Chapter.remove({_id: chapter._id}, function (err) {
                                    if (err)
                                        console.log(err);
                                });
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
            app.post('/comics/:id', function (req, res) {

                Comic.findByIdAndUpdate(req.params.id, { 
                    $set: {title: req.body.title, description: req.body.description, tags: req.body.tags}
                }, function (err) {
                    if (err)
                        console.log(err);
                    res.redirect('/comics/' + req.params.id);
                });
            });

            // FOLLOWING ====================
            // adds the user to the displayuser's follower list and the displayuser to the user's following list
            //
            app.post('/follow/:id', function(req, res){
                User.findByIdAndUpdate(req.user._id, { $push: { 'local.following': req.params.id }}, { safe: true, upsert: true, new: true }, function(err) {
                    if (err)
                        console.log(err);
                    User.findByIdAndUpdate(req.params.id, { $push: { 'local.followers': String(req.user._id), 'local.notifications': {acting_username: req.user.local.username, read: false, acting_event: String("following") }}}, { safe: true, upsert: true, new: true }, function(err) {
                        if (err)
                            console.log(err);
                        User.findOne({_id: req.params.id}, function (err, user) {
                            if (err)
                                console.log(err);
                            res.redirect('/profile/' + user.local.username);
                        });
                    });
                });
            });

            // UNFOLLOWING ====================
            // removes the user from the displayuser's follower list and the displayuser from the user's following list
            //
            app.post('/unfollow/:id', function(req, res) {
                User.findByIdAndUpdate(req.user._id, { $pull: { 'local.following': req.params.id }}, function(err) {
                    if (err)
                        console.log(err);
                    User.findByIdAndUpdate(req.params.id, { $pull: { 'local.followers': String(req.user._id) }}, function(err) {
                        if (err)
                            console.log(err);
                        User.findOne({_id: req.params.id}, function (err, user) {
                            if (err)
                                console.log(err);
                            res.redirect('/profile/' + user.local.username);
                        });
                    });
                });
            });

            // FAVOURITING =========================
            app.post('/addfavourite/:id', function(req, res) {
                console.log("checking creator_username");
                console.log(req.body.creator_username);

                Comic.findOne({_id: req.params.id}, function(err, comic) {
                    if (err)
                        console.log(err);

                    Comic.findByIdAndUpdate(req.params.id, { $inc: { favourites: 1 } }, function (err) {
                        if (err)
                            console.log(err);

                        User.findByIdAndUpdate(req.user._id, { $push: { 'local.favourites': req.params.id } }, { safe: true, upsert: true, new: true }, function (err, model) {
                            if (err)
                                console.log(err);

                            User.findOneAndUpdate({'local.username' : req.body.creator_username}, 
                                { $push: { 'local.notifications': { acting_username: req.user.local.username, read: false, acting_event: String("favourited"), acting_comic_id: req.params.id} }}, 
                                { safe: true, upsert: true, new: true }, 
                                function (err, model) {
                                if (err)
                                    console.log(err);

                            res.redirect('/comics/' + req.params.id);
                        });
                    });
                });
            });
        });

            app.post('/removefavourite/:id', function(req, res) {

                Comic.findOne({_id: req.params.id}, function(err, comic) {
                    if (err)
                        console.log(err);

                    Comic.findByIdAndUpdate(req.params.id, { $inc: { favourites: -1 } }, function (err) {
                        if (err)
                            console.log(err);
                        
                        User.findByIdAndUpdate(req.user._id, { $pull: { 'local.favourites': req.params.id } }, function (err, data) {
                            if (err)
                                console.log(err);
                            res.redirect('/comics/' + req.params.id);
                        });
                    });
                });
            });



            // COMMENT SECTION =======================
            app.post('/comment', function (req, res) {

                    // console.log("commenting!!");

                    var newComment = new Comment({
                        user: req.user.local.username,
                        comment: req.body.comment,
                        date: Date.now()
                    });

                    // console.log(newComment.user);
                    // console.log(newComment.comment);

                    // query using id of current comic
                    var comicID = req.body.comic_id;

                    // console.log(comicID);

                    Comic.findByIdAndUpdate(comicID, { $push: { 'comments': newComment } }, { safe: true, upsert: true, new: true }, function (err, model) {
                     console.log(err);

                     var id = comicID;

                     User.findOneAndUpdate({'local.username' : req.body.creator_username}, 
                                { $push: { 'local.notifications': { acting_username: req.user.local.username, read: false, acting_event: String("commenting"), acting_comic_id: comicID} }}, 
                                { safe: true, upsert: true, new: true }, 
                                function (err, model) {
                                if (err)
                                    console.log(err);

                            res.redirect('/comics/' + req.body.comic_id);
                        });

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
            app.post('/comics/:id/chapters/:chapter/addpanel', function (req, res) {

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
                        var imageFilePath = new Image({ 
                            path: imageFileName, 
                            uploaderID: req.user.local.username, 
                            chapter: req.params.chapter
                        });

                        // save image path data to db
                        imageFilePath.save(function (err, imageFilePath) {
                            if (err)
                                return console.error(err);

                            // add user to comic contributors
                            Comic.findByIdAndUpdate(req.params.id, { $addToSet: { contributors: String(req.user._id) }}, function (err) {
                                if (err)
                                    console.log(err);
                            })

                            // add image id to user's list of images, increment score by 2
                            User.findByIdAndUpdate(req.user._id, { 
                                $push: { 'local.images': String(imageFilePath._id) },
                                $inc: { 'local.score': 2 } 
                            }, { safe: true, upsert: true, new: true }, function (err, model) {
                                if (err)
                                    console.log(err);
                            });

                            // add image id to chapter
                            Chapter.findByIdAndUpdate(req.params.chapter, { 
                                $push: { images: String(imageFilePath._id) }
                            }, { safe: true, upsert: true, new: true }, function (err, chapter) {
                                if (err)
                                    console.log(err);

                                // waits for stream to complete
                                writestream.on('finish', function() {

                                    // delete file from local storage
                                    fs.unlink(path, function(err) {
                                        if (err)
                                            console.log(err);
                                    });

                                    // refresh page
                                    res.redirect('/comics/' + req.params.id + '/chapters/' + req.params.chapter + '/' + (chapter.images.length - 1));
                                });
                            });
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

            app.post('/comics/:id/deletecover', function (req, res) {

                // remove cover photo from the filesystem
                Comic.findOne({_id: req.params.id}, function (err, comic) {
                    if (err)
                        console.log(err);

                    gfs.remove({
                        filename: comic.coverphoto
                    }, function(err) {
                    if (err)
                        console.error(err);
                    });
                });

                // clear the coverphoto field
                Comic.findByIdAndUpdate(req.params.id, { $unset: { coverphoto: "" } }, function (err) {
                    if (err)
                        console.log(err);

                    res.redirect('/comics/' + req.params.id);
                });
            });

            app.post('/comics/:id/addchapter', function (req, res) {

                var newChapter = new Chapter({
                    chapter: req.body.chapterNumber,
                    title: req.body.chapterTitle,
                    comicID: req.params.id,
                    dateCreated: new Date(),
                    images: []
                });

                newChapter.save(function (err, chapter) {
                    if (err)
                        console.log(err);

                    Comic.findByIdAndUpdate(req.params.id, { 
                        $push: { chapters: String(chapter._id) },
                        $addToSet: { contributors : String(req.user._id) }
                    }, { safe: true, upsert: true, new: true }, function (err) {
                        if (err)
                            console.log(err)

                        res.redirect('/comics/' + req.params.id);
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
                    favourites: 0,
                    dateCreated: Date.now(),
                    views: 0,
                    chapters: [],
                    contributors: [String(req.user._id)]
                });

                newComic.save(function (err, comic) {
                    if (err)
                        console.log(err);

                    User.findByIdAndUpdate(req.user._id, { $inc: { 'local.score': 5 }}, function(err) {
                            if (err)
                                console.log(err);
                        });

                    User.findByIdAndUpdate(req.user._id, { $push: { 'local.comics': String(comic._id) } }, { safe: true, upsert: true, new: true }, function (err, model) {
                        if (err)
                            console.log(err);

                        if(req.user.local.followers.length != 0){
                            for (i = 0; i < req.user.local.followers.length; i++){
                                User.findByIdAndUpdate(req.user.local.followers[i], { $push: { 'local.notifications': {acting_username: req.user.local.username, acting_comic_id: comic._id, read: false, acting_event: String("created") }}}, { safe: true, upsert: true, new: true }, function(err) {
                                if (err)
                                    console.log(err);
                            });
                        }
                    }

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
            app.get('/login', isLoggedOut, function (req, res) {
                res.render('login.ejs', { message: req.flash('loginMessage'), user: req.user });
            });
            // process the login form
            app.post('/login', passport.authenticate('local-login', {
                failureRedirect: '/login',
                failureFlash: true // allow flash messages
                }), 
            function (req, res) { 
                    if (req.user) {res.redirect('back');}
                }
            );

            // SIGNUP =================================
            // show the signup form
            app.get('/signup', function (req, res) {
                res.render('signup.ejs', { message: req.flash('signupMessage'), user: req.user });
            });
            // process the signup form
            app.post('/signup', passport.authenticate('local-signup', {
                successRedirect: '/',
                // all errors get caught in the sign-up form anyways
                failureRedirect: '/',
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

        // route middleware to ensure user is logged out
        function isLoggedOut(req, res, next) {
            if (!req.isAuthenticated())
                return next();
            res.redirect('/');
        }

    } // END CONSTRUCTOR
    return Router;
}()); // END ROUTER CLASS
var router = new Router();