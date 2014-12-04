'use strict';

/* Directives */

angular.module('clearApp.directives', [])

	.directive('clearAuth', ['$http', function($http) {
		return {
			restrict: 'A',
			link: function(scope, elem, attrs) {
				scope.$on('event:auth-loginRequired', function() {
					scope.loggedIn=false;
					console.log('interceptor loginRequired');
				});
				scope.$on('event:auth-loginConfirmed', function() {
					scope.loggedIn=true;
					console.log('interceptor loginConfirmed');
				});
			}
		}
	}])
	.directive('appVersion', ['version', function(version) {
		return function(scope, elem, attrs) {
			elem.text(version);
		};
	}])
	.directive('dateFormat', function() {
	  return {
		require: 'ngModel',
		link: function(scope, element, attr, ngModelCtrl) {
		  ngModelCtrl.$formatters.unshift(function(timestamp) {
		  	if (timestamp) return new Date( timestamp );
		  	else return "";
		  });
		  ngModelCtrl.$parsers.push(function(date) {
			if (date instanceof Date) return Math.floor( date.getTime() ); 
			else return "";
		  });
		}
	  };
	})
	
	;