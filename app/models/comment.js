var mongoose = require('mongoose');

// schema
var commentSchema = mongoose.Schema({
	// Immutable information
    user: String,	    // name of commenter
    comment: String,	// content of comment
    date: Date,
    comicID: String          // date of comment

});

// create the model
module.exports = mongoose.model('Comment', commentSchema);

