///<reference path='../../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../types/DefinitelyTyped/express/express.d.ts'/>

class ComicImage{

	constructor(){

		// load the things we need
		var mongoose = require('mongoose');

		// define the schema for our user model
		var imageSchema = mongoose.Schema({
			path: String,
			creatorID: {}
		});

		// create the model for users and expose it to our app
		module.exports = mongoose.model('Image', imageSchema);
	}


}
