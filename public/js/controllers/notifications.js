angular.module('notificationsController', [''])

.controller('toggleNotifications', ['$scope','$http', '$window' function($scope, $http, $window) {

		$scope.read_so_far = 0;
		$scope.total = $window.total;
		$scope.exists_unread;

		// CHANGE FROM UNREAD TO READ =====================================================================	

		$scope.toggleRead = function() {
			// alert("here");

			// alert($scope.total);
			// alert($scope.read_so_far);

			// alert("updating");
			// $scope.read_so_far = $scope.total;
			// alert($scope.read_so_far);

			// if ($scope.read_so_far == $scope.total){
			// 	$scope.exists_unread = false;
			// } else {
			// 	$scope.exists_unread = true;
			// }
			// alert("exists_unread");
			// alert($scope.exists_unread);

			alert("toggleRead");

		}

		$scope.checkUnread = function() {
			// alert("in checkUnread");

			// if ($scope.read_so_far == $scope.total){
			// 	$scope.exists_unread = false;
			// } else {
			// 	$scope.exists_unread = true;
			// }
			// alert("exists_unread");
			// alert($scope.exists_unread);

			alert("checkUnread");
		}

	}]);
