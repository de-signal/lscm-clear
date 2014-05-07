'use strict';

/* Directives */

angular.module('clearApp.directives', [])
	.directive('clearAuth', function() {
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
	})
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
	.directive('status', function() {
		return function(scope, elem, attrs) {
			switch (attrs.status) {
				case 'processing': elem.addClass('label\-success'); break; 
			  	case 'upcoming': elem.addClass('label\-warning'); break;
			  	case 'late': elem.addClass('label\-danger'); break;
				case 'none': elem.addClass('hide'); break;
			}
		}
	})
	.directive('requiredStatus', function() {
		return function(scope, elem, attrs) {    	
			if (scope.required.completed) {
				elem.addClass('label\-success');
			}
			if (!scope.required.editable) {
				elem.removeClass('label\-warning');
				elem.removeClass('label\-danger');
			}
		}
	})
	.directive('requiredStatusBtn', function() {
		return function(scope, elem, attrs) {    	
			if (scope.required.completed) {
				elem.addClass('completed');
			}
			if (!scope.required.editable) {
				elem.addClass('btn-off');
			}
		}
	})
	.directive('stepIcon', function() {
		return function(scope, elem, attr) {
			switch (scope.milestone.step) { 
			  	case 'current': elem.addClass('i\-chevron\-big\-r'); break;
			  	case 'next': 
			  	case 'future': elem.addClass('i\-chevron\-big\-d'); elem.addClass('ultralight'); break; 
			  	default: elem.addClass('i\-chevron\-big\-d'); elem.addClass('light'); break; 
			}
	  	};
	})
	.directive('requiredIcon', function() {
		return function(scope, elem, attr) {
			switch (scope.required.type) {
				case 'upload': elem.addClass('i\-condition\-upload'); break; 
				case 'document': elem.addClass('i\-condition\-document'); break; 
			  	case 'checkbox': elem.addClass('i\-condition\-checkbox'); break;
			  	case 'date': elem.addClass('i\-condition\-date'); break;
				case 'text': elem.addClass('i\-condition\-text'); break;
				case 'email': elem.addClass('i\-condition\-email'); break;
				case 'link': elem.addClass('i\-condition\-link'); break;
				case 'scan': elem.addClass('i\-condition\-scan'); break;
				case 'imi': elem.addClass('i\-condition\-imi'); break;
			}
	  	};
	});