///<reference path='../../types/DefinitelyTyped/node/node.d.ts'/>
///<reference path='../../types/DefinitelyTyped/express/express.d.ts'/>

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
        // define the schema for our user model
        var userSchema = mongoose.Schema({
            local: {
                //immutable information
                email: String,
                password: String,
                username: String,
                contributor: Boolean,
                score: Number,     // +5 for creating comic, +2 for contributing to a comic
                
                //Editable content
                picture: String,
                description: String,
                birthday: String,
                
                //Comic arrays
                comics: Array,    // Array of comics created
                images: Array,    // Array of contributions
                favourites: Array, // Array of favourited comics
                likes: Array,      // Array of liked comics

                //Other
                following: Array,
                follows: Number,

                //Notifications
                notifications: Array 

            },
            facebook: {
                id: String,
                token: String,
                email: String,
                name: String
            },
            twitter: {
                id: String,
                token: String,
                displayName: String,
                username: String
            },
            google: {
                id: String,
                token: String,
                email: String,
                name: String
            }
        });
        // generating a hash
        userSchema.methods.generateHash = function (password) {
            return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        };
        // checking if password is valid
        userSchema.methods.validPassword = function (password) {
            return bcrypt.compareSync(password, this.local.password);
        };

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);