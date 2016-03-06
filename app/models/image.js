// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var imageSchema = mongoose.Schema({
	//Intial + immutable information
	creatorID: {},
	chapter: Number,
    path: String,

    //Mutable
    note: String	//If the contributor wants to leave a side explanation or note to future contributors
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Image', imageSchema);
