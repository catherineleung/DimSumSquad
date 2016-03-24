angular.module('comicController', [])

	// inject the Todo service factory into our controller
	.controller('toggleController', ['$scope','$http', function($scope, $http) {
		$scope.editData = {};
		$scope.editToggle = false;
		$scope.toggleComment = false;


		//EDIT PROFILE =====================================================================	

		$scope.toggleEdit = function() {
			if($scope.editToggle){
				$scope.editToggle = false;
			}
			else {
				$scope.editToggle = true;
			}
		}

		// POST A COMMENT ==================================================================
		$scope.toggleComment = function() {
			if($scope.toggleComment){
				$scope.toggleComment = false;
				$scope.$apply();

			}
			else {
				$scope.toggleComment = true;
				$scope.$apply();

			}
		}
	}]);