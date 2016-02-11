var mongoose = require('mongoose');

// schema
var imageSchema = mongoose.Schema({
    name: String,
    creationDate: Date,
    creatorID: {},
    
});

// create the model
module.exports = mongoose.model('Image', imageSchema);
