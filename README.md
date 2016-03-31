#DimSumSquad

Visit <a href="https://sumcomics.herokuapp.com/">https://sumcomics.herokuapp.com/</a> for the most recently deployed web build!

##Getting Started

* Install application dependencies: `npm install` <br>
* Install typescript: `npm install -g typescript` <br>
* Navigate to: /types/ <br>
* Initialize Git repo in /types/: `git init` <br>
* Clone typescript header files: `git clone https://github.com/borisyankov/DefinitelyTyped` <br>
* Navigate back to the main directory: / <br>
* Start the application: `npm start` <br>

##Class associations
* Refer to the UML.pdf

##Important Files/Folders

* /app: contains /models/ and routes.js (which contains the AJAX routing calls).
* /config: contains backend javascript files that handle the user login and sign up system and holds the database route.
* /app/models: contains the implemented schemas for the program.
* /public: contains files and javascript files that interact and are used by the application
* /public/js: contains angularjs controllers and services 
* /public/app_images: generic web app pictures
* /public/uploads: temporary upload storage for files which are then streamed to mongodb
* /public/bootstrap & /public/bootstrap-tagsinput: bootstrap src files
* /views: contains all website pages viewable by the user
* /server.js: handles setting up global variables and establishes the database connection
* /package.json: lists the application dependencies
* /integration-test.coffee: automated selenium black-box tests
