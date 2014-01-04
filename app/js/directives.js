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
	          	case 'late': elem.addClass('label\-important'); break;
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
	    		elem.removeClass('label\-important');
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
	          	case 'current': elem.addClass('fa\-chevron\-right'); break;
	          	case 'next': 
	          	case 'future': elem.addClass('fa\-chevron\-down'); elem.addClass('ultralight'); break; 
	          	default: elem.addClass('fa\-chevron\-down'); elem.addClass('light'); break; 
			}
	  	};
	})
	.directive('requiredIcon', function() {
		return function(scope, elem, attr) {
			switch (scope.required.type) {
	        	case 'upload': elem.addClass('fa\-file'); break; 
	          	case 'checkbox': elem.addClass('fa\-check\-square\-o'); break;
	          	case 'date': elem.addClass('fa\-calendar'); break;
				case 'text': elem.addClass('fa\-pencil\-square\-o'); break;
				case 'email': elem.addClass('fa\-envelope'); break;
				case 'link': elem.addClass('fa\-link'); break;
				case 'scan': elem.addClass('fa\-qrcode'); break;
			}
	  	};
	})
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