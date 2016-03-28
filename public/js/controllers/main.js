angular.module('userController', [])

	// inject the Todo service factory into our controller
	.controller('mainController', ['$scope','$http','Users', function($scope, $http, Users) {
		$scope.formData = {};
		$scope.loading = true;

		// GET =====================================================================
		// when landing on the page, get all todos and show them
		// use the service to get all the todos

		Users.get()
			.success(function(data) {
				$scope.users = data;
				$scope.loading = false;
			});

		// CREATE ==================================================================
		// when submitting the add form, send the text to the node API
		$scope.createUser = function() {

			if ($scope.formData.email == undefined || 
				$scope.formData.password == undefined || 
				$scope.formData.passwordConfirm == undefined || 
				$scope.formData.username == undefined)
					return;

			if ($scope.formData.email.length == 0 || 
				$scope.formData.password.length == 0 || 
				$scope.formData.passwordConfirm.length == 0 || 
				$scope.formData.username.length == 0)
					return;

			$scope.loading = true;

			// clear errors
			$scope.emailFlash = false;
			$scope.emailInvalid = false;
			$scope.passwordFlash = false;
			$scope.usernameFlash = false;
			$scope.termsFlash = false;
			$scope.emailError = "";
			$scope.passwordError = "";
			$scope.usernameError = "";

			// check for existing emails
			for (i = 0; i < $scope.users.length; i++) {
				if ($scope.users[i].local.email == $scope.formData.email) {
					$scope.loading = false;
					$scope.emailFlash = true;
					$scope.emailError = "has-error";
				}
			}

			// check if given email address is legit
			var pattern = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
			if (!(pattern.test($scope.formData.email))) {
				$scope.loading = false;
				$scope.emailInvalid = true;
				$scope.emailError = "has-error";
			}

			// check for matching passwords
			if ($scope.formData.password != $scope.formData.passwordConfirm) {
				$scope.loading = false;
				$scope.passwordFlash = true;
				$scope.passwordError = "has-error";
			}

			// check for existing usernames
			for (i = 0; i < $scope.users.length; i++) {
				if ($scope.users[i].local.username == $scope.formData.username) {
					$scope.loading = false;
					$scope.usernameFlash = true;
					$scope.usernameError = "has-error";
				}
			}

			// check that the user agreed to terms and conditions
			if (!$scope.formData.terms) {
				$scope.loading = false;
				$scope.termsFlash = true;
			}

			// if no errors, then proceed with user creation
			if(!$scope.emailFlash && !$scope.passwordFlash && !$scope.usernameFlash && !$scope.termsFlash && !$scope.emailInvalid) {
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
		$scope.deleteUser = function(id) {
			$scope.loading = true;

			Users.delete(id)
				// if successful creation, call our get function to get all the new todos
				.success(function(data) {
					$scope.loading = false;
					$scope.users = data; // assign our new list of todos
				});
		};

	}]);