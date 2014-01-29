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
			}
	  	};
	})
	.directive('planetary', ['$interval', function ($interval) {
		var autorotate = function (degPerSec) {
			// Planetary.js plugins are functions that take a `planet` instance
			// as an argument...
			return function(planet) {
				var lastTick = null;
				var paused = false;
				planet.plugins.autorotate = {
					pause:  function() { paused = true;  },
					resume: function() { paused = false; }
				};
				// ...and configure hooks into certain pieces of its lifecycle.
				planet.onDraw(function() {
					if (paused || !lastTick) {
						lastTick = new Date();
					} else {
						var now = new Date();
						var delta = now - lastTick;
						// This plugin uses the built-in projection (provided by D3)
						// to rotate the globe each time we draw it.
						var rotation = planet.projection.rotate();
						rotation[0] += degPerSec * delta / 1000;
						if (rotation[0] >= 180) rotation[0] -= 360;
						planet.projection.rotate(rotation);
						lastTick = now;
					}
				});
			};
		}
		
		return {
			restrict: 'A',
			scope: {
				data: '=', 
				width: '=',
				height: '='
			}, 
			link: function (scope, element, attrs) {
				var planet = planetaryjs.planet();
				
				planet.projection.scale(250).translate([250, 250]);
				planet.loadPlugin(planetaryjs.plugins.earth({
					topojson: { file: 'lib/json/world-110m.json' },
						oceans:   { fill:   '#9e9e8e' },
						land:     { fill:   '#c4c4ba' },
						borders:  { stroke: '#9e9e8e', lineWidth: 0.1 }
				}));
				planet.loadPlugin(planetaryjs.plugins.pings({color: '#82dd2a', ttl: 5000, angle: 10, lineWidth: 3}));
				planet.loadPlugin(planetaryjsDots({color: '#fff', angle: 1}));
				planet.loadPlugin(autorotate(3));
				planet.loadPlugin(planetaryjs.plugins.drag({
					onDragStart: function() {
					  this.plugins.autorotate.pause();
					},
					onDragEnd: function() {
					  this.plugins.autorotate.resume();
					}
				  }));

				var canvas = element[0];
				var parent = angular.element(canvas).parent()[0]; 
				var w = parent.clientWidth;
				var positions = [ [1,43], [0,44], [129, 35], [-2, 57], [-46, -23], [-17, 14], [-95, 29], [114, 22], [121, 31], [72, 19], [2, 6], [3, 6], [7, 4], [7, 5], [8, 4]];
				var pingsUpdate = $interval(function() {
					for (var i in positions) {
				  		planet.plugins.pings.add(positions[i][0], positions[i][1]);
				  	}
				}, 5000);

				planet.draw(canvas);
				for (var i in positions) {
					planet.plugins.dots.add(positions[i][0], positions[i][1]);
				}
				
				scope.$on("$destroy", function(){
			        $interval.cancel(pingsUpdate);
			    });
			}
		}
	}])
	.directive('graphD3', function () {
		return {
			restrict: 'A',
			scope: {
				data: '='
			},
			link: function (scope, element, attrs) {
				scope.$watch('data', function(data) {
					if(data) { 
						var values = data.datas;
						var type = data.type;
						var id = data.id;
						console.log('values: ', values, '/ type: ', type, '/ id: ', id); 
						
						if (type === 'pieChart') {
							var width = 300,
							height = 300,
							radius = Math.min(width, height) / 2;
							
							var color = d3.scale.ordinal()
								.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
							
							var arc = d3.svg.arc()
								.outerRadius(radius - 10)
								.innerRadius(0);
							
							var pie = d3.layout.pie()
								.sort(null)
								.value(function(d) { 
									return d.value; 
								});
							
							var svg = d3.select("#"+id).append("svg")
								.attr("width", width)
								.attr("height", height)
								.append("g")
								.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
							
							
							
							values.forEach(function(d) {
								d.value = +d.value;
							});
							
							var g = svg.selectAll(".arc")
								.data(pie(values))
								.enter().append("g")
								.attr("class", "arc");
							
							g.append("path")
								.attr("d", arc)
								.style("fill", function(d) { return color(d.data.label); });
							
							g.append("text")
								.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
								.attr("dy", ".35em")
								.style("text-anchor", "middle")
								.text(function(d) { return d.data.label; });
						}
					}
				})
			}
		}
	})
	.directive('graphNvd3', function () {
		return {
			restrict: 'A',
			scope: {
				data: '='
			},
			link: function (scope, element, attrs) {
				scope.$watch('data', function(data) {
					if(data) {
						var values = data.datas;
						var type = data.type;
						var id = data.id;
						console.log('values: ', values, '/ type: ', type, '/ id: ', id);
					
						if(type==='pieChart') {
							var width = 500,
								height = 500;
							
							var chart = nv.models.pieChart()
								.x(function(d) { return d.key })
								.y(function(d) { return d.y })
								.color(d3.scale.category10().range())
								.width(width)
								.height(height);
							
							d3.select("#test1")
								.datum(testdata)
								.transition().duration(1200)
								.attr('width', width)
								.attr('height', height)
								.call(chart);
							
							chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });
						}
					}
				})
			}
		}
	});