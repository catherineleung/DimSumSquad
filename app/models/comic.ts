///<reference path='../../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../types/DefinitelyTyped/express/express.d.ts'/>

class Comic {

	constructor() {

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

	}

}



