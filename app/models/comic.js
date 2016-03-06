var mongoose = require('mongoose');

// schema
var comicSchema = mongoose.Schema({
	// Immutable information
    title: String,			// Main comic title
    description: String,	// Describes the comic theme or concept
    creatorID: {},			// Sole creator

    // Mutable 
    chapters: Array			// Array of images or chapters
});

// create the model
module.exports = mongoose.model('Comic', comicSchema);

