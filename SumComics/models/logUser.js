var mongoose = require('mongoose');

module.exports = mongoose.model('loguser', {
	timestamp: Date,
	user: String,
	type: String
});