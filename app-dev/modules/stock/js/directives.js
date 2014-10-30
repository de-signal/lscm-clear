'use strict';

/* Directives */

angular.module('clearApp.directivesStock', [])

	.directive('clearWarehouseMap', function() {
		return {
			templateUrl: 'modules/stock/html/warehouse-tpl-map.html', 
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
			templateUrl: 'modules/stock/html/item-tpl-map.html', 
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
	})
	
	;