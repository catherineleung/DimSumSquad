// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var imageSchema = mongoose.Schema({
	//Intial + immutable information
	path: String,

	//for canvas manipulations
    height: int,
    weidth: int,
	x: int, 
	y: int
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Image', imageSchema);
