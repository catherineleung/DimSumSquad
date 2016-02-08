var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
 
var userSchema = new Schema({
	username: String,
	password: String
})

module.exports = mongoose.model('User', userSchema);