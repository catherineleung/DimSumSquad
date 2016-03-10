angular.module('comicController', [])

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
	}]);