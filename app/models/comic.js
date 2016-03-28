var mongoose = require('mongoose');

// schema
var comicSchema = mongoose.Schema({
	// Immutable information
    title: String,			// Main comic title
    description: String,	// Describes the comic theme or concept
    tags: String,           // Tags ... list of Strings (e.g. "Funny,Sad,Happy")
    creatorID: String,	    // Sole creator ... this is the username
    contributors: {},
    chapters: Number,       // Number of chapters the comic has
    favourites: Number,
    comments: Array,        // list of comments
    dateCreated: Date,

    // Mutable 
    images: Array,			// Array of images or chapters
    coverphoto: String      // file path of cover photo
});

// create the model
module.exports = mongoose.model('Comic', comicSchema);

