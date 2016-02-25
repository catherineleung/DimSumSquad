///<reference path='../../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../types/DefinitelyTyped/express/express.d.ts'/>

class Comic{

	constructor(){

		var mongoose = require('mongoose');

		// schema
		var imageSchema = mongoose.Schema({
			name: String,
			creationDate: Date,
			creatorID: {},

		});

		// create the model
		module.exports = mongoose.model('Image', imageSchema);

	}

}



