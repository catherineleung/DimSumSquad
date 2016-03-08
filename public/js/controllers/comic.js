angular.module('userController', [])

	function.controller('comicController', ['$scope','$http', function($scope, $http) {

		$scope.like = function () {
			$scope.numberOfLikes += 1;
		};

	}]