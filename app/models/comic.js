var mongoose = require('mongoose');

// schema
var comicSchema = mongoose.Schema({
    title: String,
    caption: String,
    description: String,
    creatorID: {}
});

// create the model
module.exports = mongoose.model('Comic', comicSchema);

