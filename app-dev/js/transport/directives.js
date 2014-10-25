'use strict';

/* Directives */

angular.module('clearApp.directivesTransport', [])

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
	
	.directive('conditionStatus', function() {
		return function(scope, elem, attrs) {    	
			if (scope.condition.completed) {
				elem.addClass('label\-success');
			}
			if (!scope.condition.editable) {
				elem.removeClass('label\-warning');
				elem.removeClass('label\-danger');
			}
		}
	})
	
	.directive('conditionStatusBtn', function() {
		return function(scope, elem, attrs) {    	
			if (scope.condition.completed) {
				elem.addClass('completed');
			}
			if (!scope.condition.editable) {
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
	
	.directive('conditionIcon', function() {
		return function(scope, elem, attr) {
			switch (scope.condition.type) {
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
	})
	
	;