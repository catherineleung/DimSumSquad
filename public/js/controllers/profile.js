angular.module('profileController', [])

	// inject the Todo service factory into our controller
	.controller('toggleController', ['$scope','$http', function($scope, $http) {
		$scope.editData = {};
		$scope.editToggle = false;


		//EDIT PROFILE =====================================================================	

		$scope.toggleEdit = function() {
			if($scope.editToggle){
				$scope.editToggle = false;
			}
			else {
				$scope.editToggle = true;
			}
		}


/*
		$scope.editUser = function(user) {

			if ($scope.editData.birthday == undefined || 
				$scope.editData.description == undefined || 
				$scope.editData.email == undefined)
				return;

			if ($scope.editData.birthday.length == 0 || 
				$scope.editData.description.length == 0 || 
				$scope.editData.email.length == 0)
				return;

			$scope.loading = true;

			// clear errors
			$scope.emailFlash = false;
			$scope.emailError = "";

			// check for existing emails
			for (i = 0; i < $scope.users.length; i++) {
				if ($scope.users[i].local.email == $scope.editData.email) {
					$scope.loading = false;
					$scope.emailFlash = true;
					$scope.emailError = "has-error";
				}
			}

			// if no errors, then proceed with user creation
			if(!$scope.emailFlash ) {
				// call the create function from our service (returns a promise object)
				var db = url;
				var Schema = mongoose.Schema;

				mongoose.connect('url');


					// if successful creation, call our get function to get all the new todos
					.success(function(data) {
						$scope.loading = false;
						$scope.editData = {}; // clear the form so our user is ready to enter another

						// clear errors
						$scope.emailError = "";
						$scope.passwordError = "";
						$scope.usernameError = "";

					});
				}
			}
*/
		}]);