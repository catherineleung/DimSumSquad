// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var chapterSchema = mongoose.Schema({
	//Intial + immutable information
	chapter: Number,
	title: String,
	comicID: String,
	dateCreated: Date,
	images: Array // array of image id's
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Chapter', chapterSchema);
