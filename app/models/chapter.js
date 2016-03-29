// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var panelSchema = mongoose.Schema({
	//Intial + immutable information
	contributors: Array,	// array of contributors to this panel
	comicID: String,    	// id of comic that the panel belongs to
	chapter: Number,
	path: String,			// path to canvas image in grid
    images: Array,			// ids of canvas component images

    //Mutable
    title: String	//Provide a title to the chapter
    note: String	//If the contributor wants to leave a side explanation or note to future contributors
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Image', imageSchema);
