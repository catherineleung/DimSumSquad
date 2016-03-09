angular.module('userController', [])

	// inject the Todo service factory into our controller
	.controller('mainController', ['$scope','$http','Users', function($scope, $http, Users) {
		$scope.formData = {};
		$scope.loading = true;


		// CREATE ==================================================================
		// when submitting the add form, send the text to the node API
		$scope.createComic = function() {

			if ($scope.formData.title == undefined || 
				$scope.formData.description == undefined || 
				$scope.formData.tags == undefined)
					return;

			if ($scope.formData.title.length == 0 || 
				$scope.formData.description.length == 0 || 
				$scope.formData.tags.length == 0)
					return;

			// clear errors
			$scope.titleFlash = false;
			$scope.descriptionFlash = false;
			$scope.tagsFlash = false;
			$scope.titleError = "";

			// check for existing title
			for (i = 0; i < $scope.comics.length; i++) {
				if ($scope.comics[i].title == $scope.formData.title) {
					$scope.titleFlash = true;
					$scope.titleError = "has-error";
				}
			}



			// if no errors, then proceed with user creation
			if(!$scope.emailFlash && !$scope.passwordFlash && !$scope.usernameFlash && !$scope.termsFlash) {
				// call the create function from our service (returns a promise object)
				Users.create($scope.formData)

					// if successful creation, call our get function to get all the new todos
					.success(function(data) {
						$scope.loading = false;
						$scope.formData = {}; // clear the form so our user is ready to enter another
						$scope.users = data; // assign our new list of todos

						// clear errors
						$scope.emailError = "";
						$scope.passwordError = "";
						$scope.usernameError = "";

					});
			}
		}

		// DELETE ==================================================================
		// delete a todo after checking it
		// $scope.deleteUser = function(id) {
		// 	$scope.loading = true;

		// 	Users.delete(id)
		// 		// if successful creation, call our get function to get all the new todos
		// 		.success(function(data) {
		// 			$scope.loading = false;
		// 			$scope.users = data; // assign our new list of todos
		// 		});
		// };

	}]);