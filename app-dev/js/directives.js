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
	.directive('clearWarehouseMap', function() {
		return {
			templateUrl: 'partials/stock/warehouse-tpl-map.html', 
			scope: {
				a: '=areas'
			},
			link: function(scope, elem, attr) {
				scope.$watch('a', function(newValue) {
					if (newValue !== undefined) {
						console.log('a: ', scope.a);
						var areas = {}
						for (var i in scope.a) {
							areas[scope.a[i].position] = scope.a[i]; 
						}
						scope.areas = areas; 
						console.log('areas: ', areas);
					}
				});
				console.log('eleeem: ', elem[0]);
				
				scope.label = {};  
				
				scope.mouseover = function(p) {
					console.log('clicked: ', p);
					var el = window[p].getBoundingClientRect(); 
					var origin = window['areas'].getBoundingClientRect(); 
					var y = el.bottom - origin.top; 
					var x = el.left - origin.left; 
										 
					scope.label = {
						"name": scope.areas[p].name, 
						"type": scope.areas[p].type, 
						"ratio": scope.areas[p].ratio, 
						"quantity": scope.areas[p].quantity, 
						"reference": scope.areas[p].reference, 
						"visible": true, 
						"top": y + "px", 
						"left": x + "px", 
					}
					console.log('mabel: ', scope.label); 
				}
				scope.mouseleave = function(p) {
					scope.label.visible = false; 
					console.log('unclicked: ', p); 
				} 
			}
	  	};
	})
	.directive('clearItemMap', function() {
		return {
			templateUrl: 'partials/stock/item-tpl-map.html', 
			scope: {
				m: '=movements'
			},
			link: function(scope, elem, attr) {
				scope.$watch('m', function(newValue) {
					if (newValue !== undefined) {
						var movements = {}; 
						
						var positions = ["A", "B","C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]; 
						for (var i in positions) {
							movements[positions[i]] = {"color":  "#EBE8E7"};
						}
						for (var i in scope.m) {
							movements[scope.m[i].zones.dest.position] = scope.m[i].zones.dest; 
							movements[scope.m[i].zones.dest.position].step = scope.m[i].step; 
							movements[scope.m[i].zones.dest.position].color = (scope.m[i].current) ? '#FFCB32' : '#EBE8E7'; 
							
							if (scope.m[i].zones.dest.rack && scope.m[i].current) {
							  var rack = scope.m[i].zones.dest.rack; 
							  scope.rack = rack; 
							  var rackPositions = {
							  	"A": ["1", "1"], 
							  	"B": ["2", "1"], 
							  	"C": ["1", "2"], 
							  	"D": ["2", "2"], 
							  	"E": ["1", "3"], 
							  	"F": ["2", "3"]
							  }
							  rack.colors = []
							  for (var i  in rackPositions) {
							  	if (rack.bin === rackPositions[i][0] && rack.high === rackPositions[i][1] ) {
							  		rack.colors[i] = '#FFCB32'; 
							  	} else {
							  		rack.colors[i] = '#EBE8E7'; 
							  	}
								}
							}
						}
					   	scope.movements = movements;
						console.log('movements: ', movements);
					}
				});
			}
	  	};
	});