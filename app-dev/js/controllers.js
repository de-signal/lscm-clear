'use strict';

/* Controllers */


angular.module('clearApp.controllers', [])

	.controller('UserCtrl', ['$scope', '$route', 'toaster', '$cookieStore', 'authService', '$http', 'E1', 
		function ($scope, $route, toaster, $cookieStore, authService, $http, E1) {
		var credentials;

		if ($cookieStore.get("token")) {
			credentials = $cookieStore.get("token"); 
			$http.defaults.headers.common['Authorization'] = credentials;
			$scope.loggedIn=true;
			console.log('connect from cookie: ', $http.defaults.headers.common);
			E1.get({'type': 'user'}, function(user) { 
				$scope.user = user;
			});
		} 

		$scope.login = function() {
			$http.post('../oauth/oauth.php', {ignoreAuthModule: true, login: $scope.username, password: $scope.password})
				.success(function(data, status, headers, config) {
					credentials = 'OAuth '+ data.access_token;
					$cookieStore.remove("token");
					if($scope.remember) {
						$cookieStore.put("token", credentials);
					} 
				    $http.defaults.headers.common['Authorization'] = credentials;
				    authService.loginConfirmed();
				    console.log('connect from form: ', $http.defaults.headers.common);
				    E1.get({'type': 'user'}, function(user) {
				    	toaster.pop('success', 'Welcome', user.first_name + ' ' + user.name);
				    	$scope.user = user;
				    });
				    
				})
				.error(function(data, status, headers, config) {
					toaster.pop('error', 'Error', headers("X-clear-login"));
				});
			}
		
		$scope.logout = function () {
			$http.post('../oauth/oauth.php', {action: 'logout', token: credentials})
				.success(function(data, status, headers, config) {
					$cookieStore.remove("token");
					delete $http.defaults.headers.common['Authorization'];
					$route.reload();
					$scope.loggedIn=false;
					console.log('logout: ', $http.defaults.headers.common);
					toaster.pop('success', 'Logged out');
				})
				.error(function(data, status, headers, config) {
					console.log('status error :', status, ' / logout failed');
				});
			}
		
		$scope.logoutTest = function () {
			$cookieStore.remove("token");
			$http.defaults.headers.common['Authorization'] = ''; 
			$route.reload();
			console.log('logout');
		}
	}])
	
	.controller('UserProfileCtrl', ['$scope', 'E1', function($scope, E1) {
		E1.get({'type': 'user'}, function(user) { 
			$scope.user = user;
		});
	}])
	
	.controller('DashboardCtrl', ['$location', '$scope', '$q', 'E1', 'ClearFn', function($location, $scope, $q, E1, ClearFn) {
		$scope.loaded = false;
		E1.query({'type': 'dashboard'}, function(list) {
			$scope.list= list;
			$scope.loaded = true;
		});
		E1.query({'type': 'report'}, function(docs){
			$scope.report = docs[docs.length-1];
		});
		$scope.go = ClearFn.go;
		$scope.modalConditionOpen = ClearFn.modalConditionOpen;
	}])
	
	.controller('TvCtrl', ['$interval', '$rootScope', '$scope', 'E1', 'News', 'ClearFn', function($interval, $rootScope, $scope, E1, News, ClearFn) {
		$scope.loaded = false;
		$rootScope.tvScreen = true;
		
		var listLoad = function() {
			E1.query({'type': 'dashboard'}, function(list) {
				// $scope.list = list;
				$scope.list=[];
				$interval(function() {$scope.list.push(list.shift())}, 100, list.length);
				$scope.loaded = true;
			});
		}
		var listEmpty = function() {
			if ($scope.list) {
				var n = $scope.list.length;
				$interval(function() {$scope.list.shift()}, 50, n).then(listLoad);
			}
		}	
		
		listLoad();
		$interval(listEmpty, 25000);
		
		
		var newsQty;
		var next;
		$scope.newsCurrent = 1;
		
		var newsUpdate = function() {
			
			News.query(function(news) {
				newsQty = news.length; 
				for (var i = 0; i < newsQty; i++) {
					news[i].index = i+1;
				}
				$scope.news = news;
			});
			
			if ($scope.newsCurrent < newsQty) {
				next = $scope.newsCurrent+1;
			} else {
				next = 1;
			}
			$scope.newsCurrent = 0;
			$interval(function() { $scope.newsCurrent= next}, 3000, 1);
		}
		
		
		$interval(newsUpdate, 9000);
		
		$scope.go = ClearFn.go;
		$scope.modalConditionOpen = ClearFn.modalConditionOpen; 
	}])
	
	.controller('AddOrderCtrl', function() {
	})
	
	.controller('ListCtrl', ['$scope', 'Elements', '$location', 'Utils', 'ClearFn', function($scope, Elements, $location, Utils, ClearFn) {
		$scope.loaded = false;
		$scope.loadList = function (listInit) {
		 	$scope.listInit = listInit;
			var params = Utils.collect($scope.init, listInit);
			Elements.query(params, function(list, response) {
				$scope.list = list; 
				$scope.itemsPerPage = params.limit;
				$scope.currentPage = response("X-Clear-currentPage");
				$scope.pagesCount = response("X-Clear-pagesCount");
				$scope.elementsCount =  response("X-Clear-elementsCount");
				console.log("pagesCount: " + response("X-Clear-pagesCount") + ", currentPage: " + response("X-Clear-currentPage") + ", elementsCount: " + response("X-Clear-elementsCount"));
				$scope.loaded = true;
				$scope.footerColspan = 4; 
				
				if (listInit.type === 'shipment') {
					$scope.footerColspan++
				}
				if ($scope.trackingShow) {
					$scope.footerColspan++
				}
				
			}, 
			function() {
				console.log('list not loaded');
			}); 
		}
		
		$scope.modalConditionOpen = ClearFn.modalConditionOpen; 
		$scope.trackingToggle = ClearFn.trackingToggle;
		$scope.propertySave = function(elm, property, groupName) {
			ClearFn.propertySave(elm, property, groupName);
		}
		
		$scope.loadPage = function (page) {
			$scope.listInit.page = page;
			$scope.loadList($scope.listInit);
		}
		
		$scope.go = ClearFn.go;
	}])
	
	.controller('TrackingCtrl', ['$scope', function($scope) {
		$scope.categories=[	
			{"name": "Orders", "type": "order" }, 
			{"name": "Shipments", "type": "shipment" }, 
			{"name": "Boxes", "type": "box" }, 
			{"name": "Items", "type": "item" }
		];
		
		$scope.init = { sortType: 'DESC', limit: 8, tracking: true };
		$scope.trackingShow = false;
		
	}])
	
	.controller('IndicatorsCtrl', ['$scope', 'E1', 'ChartsConfig', function($scope, E1, ChartsConfig) {
		$scope.charts = [];
		$scope.loaded = false;
		E1.query({'type': 'kpi'}, function(charts){
			for(var i = 0, len = charts.length; i < len; ++i) {
			    ChartsConfig.chartFn(charts[i]); 
			    $scope.charts[charts[i].id] = charts[i];
			}
			$scope.loaded = true;
			console.log('charts: ', charts);
		});	
		$scope.colors = ChartsConfig.colors;
		$scope.tooltips = ChartsConfig.tooltips;
	}])
	
	.controller('DetailCtrl', ['$scope', '$routeParams', '$location', '$timeout', '$anchorScroll', 'Elements', 'ColorScaleConfig', 'Utils', 'ClearFn', function($scope, $routeParams, $location, $timeout, $anchorScroll, Elements, ColorScaleConfig, Utils, ClearFn) {
		$scope.loaded = false;
		Elements.get({'type': $routeParams.type, "id": $routeParams.id }, function(elm) {
			
			for (var index in elm.charts) {
				ColorScaleConfig.assignProperties(elm.charts[index]);
			}
			
			elm = ClearFn.propertiesDate(elm);
			
		    $scope.elm = elm;
		    $scope.qrCodeGoogle = ClearFn.qrCodeGoogle(elm); 
		    $scope.charts = elm.charts;
		    var related_type = $location.search().related_type;
    		if (related_type) {
    			for (var i in elm.related) {
    				if (related_type === elm.related[i].type) {
    					$scope.relatedActiveTab[related_type] = true;
    					break;
    				}
    			}
    			$timeout(function() {
    				$anchorScroll();
    			}, 1000);
    		}
    		$scope.loaded = true;
		});	
		
		$scope.relatedActiveTab = {};
		$scope.init = { sortType: 'DESC', limit: 16 };
		$scope.trackingShow = true;
		$scope.modalConditionOpen = ClearFn.modalConditionOpen; 
		$scope.modalDeleteOpen = ClearFn.modalDeleteOpen; 
        $scope.trackingToggle = ClearFn.trackingToggle;
        $scope.propertySave = function(elm, property, groupName) {
        	ClearFn.propertySave(elm, property, groupName);
        }
        $scope.dateToTimestamp = Utils.dateToTimestamp;
		
		$scope.calOpen = function($event, propName) {
			$event.preventDefault();
		    $event.stopPropagation();
		    
		    var currentProp = function(name) {
		    	var props = $scope.elm.properties;
		    	for (var group in props) {
		    		for (var n in props[group].set) {
		    			var prop = props[group].set[n];
		    			if (prop.name === name) return prop; 
		    		}
		    	}
		    }
		    currentProp(propName).opened = true;
		    console.log('currentProp: ', currentProp(propName) );
		};	
	}])
	
	.controller('TplModalDeleteCtrl', ['$scope', '$location', 'ClearFn', '$modalInstance', 'elm', function ($scope, $location, ClearFn, $modalInstance, elm) {
		$scope.elm = elm;
	    console.log('elm: ', elm);
	    
	    $scope.deleteConfirm = function(elm) { 
	    	elm.$delete({"type": elm.type, "id": elm.id });
	    	$location.path('tracking');
	    }
	    
	    $scope.deleteClose = function() {
	    	$modalInstance.close();
	    }
	     
	    $scope.deleteCancel = function () {
	        $modalInstance.dismiss('cancel');
	    }
	}])
	
	.controller('TplModalConditionCtrl', ['$scope', 'ClearFn', '$modalInstance', 'required', 'elm', function ($scope, ClearFn, $modalInstance, required, elm) {
		$scope.required = required;
		$scope.elm = elm;
	    console.log('elm: ', elm, '/ elm.name: ', elm.name, '/ required: ', required);
	    switch (required.type) {
	    	case 'upload': 
	    		// ngUpload
				$scope.uploadUrl = '/index_rest.php/api/clear/v2/'+ elm.type + '/' + elm.id + '?required=' + required.id;
				$scope.startUploading = function() {
					$scope.uploadMessage = "Uploading in progress, please wait…";
				};
				
				$scope.complete = function (content, completed) {
					$scope.uploadMessage = 'File uploaded. Save to complete.'
				};
	    	break; 
	    	case 'checkbox': 
	    	
	    	break;
	    	case 'date':
	    		// ui-Bootstrap datepicker
	    		
	    		$scope.disabled = function(date, mode) {
	    			return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	    		};
	    		$scope.minDate = new Date();
	    		$scope.$watch('required.dt', function(newValue) { 
	    			if (newValue) $scope.required.value = Math.floor(newValue.getTime() / 1000); 
	    			console.log('required date -> name: ', $scope.required.name , '/ value: ', $scope.required.value, '/ dt: ', newValue);
	    		});
	    	break;
	    	case 'text': 
	    	
	    	break;
	    	case 'email': 
	    	
	    	break;
	    	case 'link':
	    		
	    	break;
	    }
	    
        $scope.requiredSave = function(elm, elmId) { 
        	ClearFn.requiredSave(elm, elmId);
        }
        
        $scope.requiredClose = function() {
        	$modalInstance.close();
        }
         
        $scope.requiredCancel = function () {
            $modalInstance.dismiss('cancel');
        }
        
        $scope.go = ClearFn.go;
        
	}])
	
	.controller('SearchCtrl', ['$location', '$scope', 'SearchFilters', '$timeout', 'Utils', function($location, $scope, SearchFilters, $timeout, Utils) { 
		
		var date = { milestone_start: {}, milestone_end: {}, property_start: {}, property_end: {} };
		var query = $location.search();
		
		(Utils.is_empty(query)) ? $scope.showList=false : $scope.showList=true;
		
		if (query.milestone_date_start)	date.milestone_start.value	= Utils.timestampToDate(query.milestone_date_start);
		if (query.milestone_date_end)	date.milestone_end.value	= Utils.timestampToDate(query.milestone_date_end);
		if (query.property_date_start)	date.property_start.value	= Utils.timestampToDate(query.property_date_start);
		if (query.property_date_end)	date.property_end.value		= Utils.timestampToDate(query.property_date_end);
		
		$scope.query = query;
		$scope.date = date;
		$scope.dateToTimestamp = Utils.dateToTimestamp;
		$scope.IndxOf = Utils.IndxOf;
		$scope.init = { sortType: 'DESC', limit: 24 };
		$scope.trackingShow = true;
		
		
		console.log('query: ', $scope.query, '/ showList: ', $scope.showList);
		
		$scope.search = function (query) {
			$location.search('page', null);
			for (var i in query) {
			     if (!query[i]) {
			     	if (i === 'property_name') {
						$location.search('property_value', null);
						$location.search('property_id', null);
						$location.search('property_date_start', null);
						$location.search('property_date_end', null);
			     	}	
			    	$location.search(i, null);
			    }	
			}
			$location.search(query);
			$scope.showList=true;
		};
		SearchFilters.get(function(searchFilters){ 
			$scope.filters = searchFilters;
			if($scope.query.property_id) { 
				$scope.selected = { 
					"property": searchFilters.properties[$scope.query.type][$scope.query.property_id-1]
				};
				console.log("property id: ", $scope.query.property_id);
			}
		});
			 
		$scope.queryInit = function (type) {
			$scope.query = {};
			$scope.date = { milestone_start: {}, milestone_end: {}, property_start: {}, property_end: {} };
			if ($scope.selected) $scope.selected.property = {};
			$scope.query.type = type;
		}
	
	  // Disable weekend selection
	  $scope.disabled = function(date, mode) {
	    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	  };
	
	  $scope.openCal = function(param) {
		$timeout(function() {
		  $scope.date[param].opened = true;
		});
	  };
	}])
	
	.controller('InspectionReportsCtrl', ['$location', '$scope', 'E1', '$timeout', 'Utils', 'ClearFn', function($location, $scope, E1, $timeout, Utils, ClearFn) {
		$scope.loaded = false;
		
		var date = { from: {}, to: {} };
		var query = $location.search();
		
		if (query.date_from)	date.from.value	= Utils.timestampToDate(query.date_from);
		if (query.date_to)		date.to.value	= Utils.timestampToDate(query.date_to);
		
		$scope.query = query;
		$scope.date = date;
		$scope.dateToTimestamp = Utils.dateToTimestamp;
		
		$scope.search = function (query) {
			$location.search('page', null);
			for (var i in query) {
				console.log('i: ', i, 'query[i]: ', query[i]);
				if (!query[i]) {
			    	$location.search(i, null);
			    }
			}
			if (!query.reference) { 
				$location.search('related_to', null);
			}
			$location.search(query);
		};
		
		// Disable weekend selection
		$scope.calDisabled = ClearFn.calDisabled;
		
		$scope.calOpen = function($event, param) {
			$event.preventDefault();
		    $event.stopPropagation();
		    $scope.date[param].opened = true;
		};
		
		$scope.go = ClearFn.go;
		
		$scope.badgeRemove = function(badge) {
			$location.search(ClearFn.filterRemove(badge, query));
		}  
		
		var queryType = Utils.collect({'type': 'ir'}, query);
		
		E1.query(queryType, function(docs) {
			E1.get({'type': 'ir', 'id': 'filter'}, function(filters) { 
			    $scope.filters = filters; 
			    $scope.badges = ClearFn.badgesDisplay(query, filters); 
			});
		    $scope.docs = docs; 
		    $scope.loaded = true;
		});
	}])
	
	.controller('InspectionReportCtrl', ['$scope', '$filter', '$routeParams', 'E1', function($scope, $filter, $routeParams, E1) {
		$scope.loaded = false;
		E1.get({'type': 'ir', 'id': $routeParams.id}, function(doc) {
			$scope.doc = doc;
			$scope.loaded = true;
			for(var i=0, lenI=doc.boxes.length; i < lenI;i++) {
				$scope.doc.boxes[i].itemsGroupBy4 = $filter('groupBy')(doc.boxes[i].items, 4);
			}
		});
	}])
	
	.controller('NonComplianceReportsCtrl', ['$location', '$scope', 'E1', '$timeout', 'Utils', 'ClearFn', function($location, $scope, E1, $timeout, Utils, ClearFn) {
		$scope.loaded = false;
		var date = { from: {}, to: {} };
		var query = $location.search();
		
		if (query.date_from)	date.from.value	= Utils.timestampToDate(query.date_from);
		if (query.date_to)		date.to.value	= Utils.timestampToDate(query.date_to);
		
		$scope.query = query;
		$scope.date = date;
		$scope.dateToTimestamp = Utils.dateToTimestamp;
		
		$scope.search = function (query) {
			$location.search('page', null);
			for (var i in query) {
				console.log('i: ', i, 'query[i]: ', query[i]);
				if (!query[i]) {
			    	$location.search(i, null);
			    }
			}
			if (!query.reference) { 
				$location.search('related_to', null);
			}
			console.log('query: ', query);
			$location.search(query);
		};
		
		// Disable weekend selection
		$scope.calDisabled = ClearFn.calDisabled;
		
		$scope.calOpen = function($event, param) {
			$event.preventDefault();
		    $event.stopPropagation();
		    $scope.date[param].opened = true;
		};
		
		$scope.go = ClearFn.go;
		
		$scope.badgeRemove = function(badge) {
			$location.search(ClearFn.filterRemove(badge, query));
		}
		
		var queryType = Utils.collect({'type': 'ncr'}, query);
		
		E1.query(queryType, function(docs) { 
			E1.get({'type': 'ncr', 'id': 'filter'}, function(filters) { 
			    $scope.filters = filters; 
			    $scope.badges = ClearFn.badgesDisplay(query, filters);
			});
			$scope.docs = docs;
			$scope.loaded = true;
		});
	}])
	
	.controller('NonComplianceReportCtrl', ['$scope', '$routeParams', 'E1', '$modal', function($scope, $routeParams, E1, $modal) {
		$scope.loaded = false;
		E1.get({'type': 'ncr', 'id': $routeParams.id}, function(doc) {
			$scope.doc = doc;
			$scope.loaded = true;
		});
        $scope.open = function (doc, type) {            
			if (doc.status != 'closed') {
	            var modalInstance = $modal.open({
	                templateUrl: 'partials/tplModalNcrMessage.html',
	                controller: 'TplModalNcrMessageCtrl',
	                resolve: {
	                  doc: function () {
	                    return doc;
	                  },
	                  type: function () {
	                    return type;
	                  } 
	                }
	            });
				modalInstance.result.then(function (selectedItem) {
				    $scope.selected = selectedItem;
				}, function () {
//                $log.info('Modal dismissed at: ' + new Date());
				});
			}
        }; 
	}])
	
	.controller('ProofsOfDeliveryCtrl', ['$location', '$scope', 'E1', '$timeout', 'Utils', 'ClearFn', function($location, $scope, E1, $timeout, Utils, ClearFn) {
		$scope.loaded = false;
		var date = { from: {}, to: {} };
		var query = $location.search();
		
		if (query.date_from)	date.from.value	= Utils.timestampToDate(query.date_from);
		if (query.date_to)		date.to.value	= Utils.timestampToDate(query.date_to);
		
		$scope.query = query;
		$scope.date = date;
		$scope.dateToTimestamp = Utils.dateToTimestamp;
		
		$scope.search = function (query) {
			$location.search('page', null);
			for (var i in query) {
				console.log('i: ', i, 'query[i]: ', query[i]);
				if (!query[i]) {
			    	$location.search(i, null);
			    }
			}
			if (!query.reference) { 
				$location.search('related_to', null);
			}
			console.log('query: ', query);
			$location.search(query);
		};
		
		// Disable weekend selection
		$scope.calDisabled = ClearFn.calDisabled;
		
		$scope.calOpen = function($event, param) {
			$event.preventDefault();
		    $event.stopPropagation();
		    $scope.date[param].opened = true;
		};
		
		$scope.go = ClearFn.go;
		
		$scope.badgeRemove = function(badge) {
			$location.search(ClearFn.filterRemove(badge, query));
		}
		
		var queryType = Utils.collect({'type': 'pod'}, query);
		
		E1.query(queryType, function(docs) {
			E1.get({'type': 'pod', 'id': 'filter'}, function(filters) { 
			    $scope.filters = filters; 
			    $scope.badges = ClearFn.badgesDisplay(query, filters);
			});
			$scope.docs = docs;
			$scope.loaded = true;
		});
	}])
	
	.controller('ProofOfDeliveryCtrl', ['$scope', '$routeParams', 'ClearFn', 'E1', function($scope, $routeParams, ClearFn, E1) {
		$scope.loaded = false;
		E1.get({'type': 'pod', 'id': $routeParams.id}, function(doc) {
			$scope.doc = doc;
			$scope.loaded = true;
			
		});
		$scope.go = ClearFn.go;
	}])
	
	.controller('StaticIndicatorsCtrl', ['$scope', 'StaticIndicators', 'ChartsConfig', function($scope, StaticIndicators, ChartsConfig) {
		
		$scope.loaded = false;
		
		$scope.charts = [];
		
		StaticIndicators.query(function(charts){
			for(var i = 0, len = charts.length; i < len; ++i) {
			    ChartsConfig.chartFn(charts[i]); 
			    $scope.charts[charts[i].id] = charts[i];
			}
			$scope.loaded = true;
			console.log('charts: ', charts);
		});	
		$scope.colors = ChartsConfig.colors;
		$scope.tooltips = ChartsConfig.tooltips;	
		
	}])
	
	.controller('StaticDashboardCtrl', ['$location', '$scope', 'ClearFn', 'StaticDashboardList', 'StaticGlobalReports', function($location, $scope, ClearFn, StaticDashboardList, StaticGlobalReports) {
		$scope.loaded = false;
		StaticGlobalReports.query( function(docs){
			$scope.report = docs[docs.length-1];
		});
		StaticDashboardList.query( function(list) {
			$scope.list = list;
			$scope.loaded = true;
		});
		$scope.go = ClearFn.go;
	}])
	
	.controller('StaticInspectionReportsCtrl', ['$location', '$scope', 'ClearFn', 'InspectionReports', 'InspectionReportsFilters', 'Utils', function($location, $scope, ClearFn, InspectionReports, InspectionReportsFilters, Utils) {
		$scope.loaded = false;
		
		var date = { from: {}, to: {} };
		var query = $location.search();
		
		if (query.date_from)	date.from.value	= Utils.timestampToDate(query.date_from);
		if (query.date_to)		date.to.value	= Utils.timestampToDate(query.date_to);
		
		$scope.query = query;
		$scope.date = date;
		$scope.dateToTimestamp = Utils.dateToTimestamp;
		
		$scope.search = function (query) {
			$location.search('page', null);
			for (var i in query) {
				console.log('i: ', i, 'query[i]: ', query[i]);
				if (!query[i]) {
			    	$location.search(i, null);
			    }
			}
			if (!query.reference) { 
				$location.search('related_to', null);
			}
			$location.search(query);
		};
		
		// Disable weekend selection
		$scope.calDisabled = ClearFn.calDisabled;
		
		$scope.calOpen = function($event, param) {
			$event.preventDefault();
		    $event.stopPropagation();
		    $scope.date[param].opened = true;
		};
		
		$scope.go = ClearFn.go;
		
		$scope.badgeRemove = function(badge) {
			$location.search(ClearFn.filterRemove(badge, query));
		}
		
		InspectionReports.query(function(docs) {
			InspectionReportsFilters.get(function(filters) { 
			    $scope.filters = filters; 
			    $scope.badges = ClearFn.badgesDisplay(query, filters);
			});
			$scope.docs = docs;
			$scope.loaded = true;
		});
	}])
	
	.controller('StaticInspectionReportCtrl', ['$scope', '$filter', 'InspectionReport', function($scope, $filter, InspectionReport) {
		$scope.loaded = false;
		$scope.doc = InspectionReport.get(function(doc) {
			for(var i=0, len=doc.boxes.length;i<len;i++) {
				$scope.doc.boxes[i].itemsGroupBy4 = $filter('groupBy')(doc.boxes[i].items, 4);
			}
			$scope.loaded = true;
		});
	}])
	
	.controller('StaticNonComplianceReportsCtrl', ['$location', '$scope', 'ClearFn', 'NonComplianceReports', 'NonComplianceReportsFilters', 'Utils', function($location, $scope, ClearFn, NonComplianceReports, NonComplianceReportsFilters, Utils) {
		$scope.loaded = false;
		var date = { from: {}, to: {} };
		var query = $location.search();
		
		if (query.date_from)	date.from.value	= Utils.timestampToDate(query.date_from);
		if (query.date_to)		date.to.value	= Utils.timestampToDate(query.date_to);
		
		$scope.query = query;
		$scope.date = date;
		$scope.dateToTimestamp = Utils.dateToTimestamp;
		
		$scope.search = function (query) {
			$location.search('page', null);
			for (var i in query) {
				console.log('i: ', i, 'query[i]: ', query[i]);
				if (!query[i]) {
			    	$location.search(i, null);
			    }
			}
			if (!query.reference) { 
				$location.search('related_to', null);
			}
			$location.search(query);
		};
		
		// Disable weekend selection
		$scope.calDisabled = ClearFn.calDisabled;
		
		$scope.calOpen = function($event, param) {
			$event.preventDefault();
		    $event.stopPropagation();
		    $scope.date[param].opened = true;
		};
		
		$scope.go = ClearFn.go;
		
		$scope.badgeRemove = function(badge) {
			$location.search(ClearFn.filterRemove(badge, query));
		}
		
		NonComplianceReports.query(function(docs) {
			NonComplianceReportsFilters.get(function(filters) { 
			    $scope.filters = filters; 
			    $scope.badges = ClearFn.badgesDisplay(query, filters);
			});
			$scope.docs = docs;
			$scope.loaded = true;
		});
	}])
	
	.controller('StaticNonComplianceReportCtrl', ['$location', '$scope', 'NonComplianceReport', '$modal', function($location, $scope, NonComplianceReport, $modal) {
		$scope.loaded = false;
		NonComplianceReport.get(function(doc){
			$scope.doc = doc;
			$scope.loaded = true;
		});
        $scope.open = function (doc, type) {            
			if (doc.status != 'closed') {
	            var modalInstance = $modal.open({
	                templateUrl: 'partials/tplModalNcrMessage.html',
	                controller: 'TplModalNcrMessageCtrl',
	                resolve: {
	                  doc: function () {
	                    return doc;
	                  },
	                  type: function () {
	                    return type;
	                  } 
	                }
	            });
				modalInstance.result.then(function (selectedItem) {
				    $scope.selected = selectedItem;
				}, function () {
//                $log.info('Modal dismissed at: ' + new Date());
				});
			}
        };  
	}])
	
	.controller('TplModalNcrMessageCtrl', ['$scope', '$modalInstance', 'doc', 'type', function ($scope, $modalInstance, doc, type) {
		$scope.comment = {};
		if (type=='open') $scope.title = 'Add a comment'; 
		else $scope.title = 'Close report'; 
		
	    $scope.saveNcrMessage = function () {
	    	var now = new Date();
	    	var date = Math.floor(now.getTime() / 1000);
	    	var message = $scope.comment.message;
	    	
	    	doc.comments.push({ "date": date, "status": type, "message": message}); 
	    	console.log("saved -> date", date, "/ status", type, "/ message", message); 
	        doc.$save({'type': 'ncr', 'id': doc.id, 'update':type}, function(p, response) {});
	        $modalInstance.close();
	    };
	    
	    $scope.cancel = function () {
	        $modalInstance.dismiss('cancel');
	    };
	}])
	
	.controller('StaticProofOfDeliveryCtrl', ['$location', '$scope', 'ClearFn', 'ProofOfDelivery', function($location, $scope, ClearFn, ProofOfDelivery) {
		$scope.loaded = false;
		ProofOfDelivery.get(function(doc) {
			$scope.doc = doc;
			$scope.loaded = true;
		});
		$scope.go = ClearFn.go;
	}])
	
	.controller('StaticProofsOfDeliveryCtrl', ['$location', '$scope', 'ClearFn', 'ProofsOfDelivery', 'ProofsOfDeliveryFilters', 'Utils', function($location, $scope, ClearFn, ProofsOfDelivery, ProofsOfDeliveryFilters, Utils) {
		$scope.loaded = false;
		var date = { from: {}, to: {} };
		var query = $location.search();
		
		if (query.date_from)	date.from.value	= Utils.timestampToDate(query.date_from);
		if (query.date_to)		date.to.value	= Utils.timestampToDate(query.date_to);
		
		$scope.query = query;
		$scope.date = date;
		$scope.dateToTimestamp = Utils.dateToTimestamp;
		
		$scope.search = function (query) {
			$location.search('page', null);
			for (var i in query) {
				console.log('i: ', i, 'query[i]: ', query[i]);
				if (!query[i]) {
			    	$location.search(i, null);
			    }
			}
			if (!query.reference) { 
				$location.search('related_to', null);
			}
			$location.search(query);
		};
		
		// Disable weekend selection
		$scope.calDisabled = ClearFn.calDisabled;
		
		$scope.calOpen = function($event, param) {
			$event.preventDefault();
		    $event.stopPropagation();
		    $scope.date[param].opened = true;
		};
		
		$scope.go = ClearFn.go;
		
		$scope.badgeRemove = function(badge) {
			$location.search(ClearFn.filterRemove(badge, query));
		}
		
		ProofsOfDelivery.query(function(docs) {
			ProofsOfDeliveryFilters.get(function(filters) { 
			    $scope.filters = filters; 
			    $scope.badges = ClearFn.badgesDisplay(query, filters);
			});
			$scope.docs = docs;
			$scope.loaded = true;
		});
	}])
	
	.controller('StaticListCtrl', ['$location', '$scope', 'ClearFn', 'Elms', function($location, $scope, ClearFn, Elms) {
		var list=[],elements=[],j;
		
		$scope.loadList = function (ListInit) {
			elements = Elms.query(function(datas){ 
					for (j=datas.length-1;j>=0;j--) {
						if (datas[j].type === ListInit.type) {
							if (datas[j].tracking === "tracked") list.unshift(datas[j]);
							console.log(list);
						}
					}
			});
			$scope.elementsCount = 20;
			$scope.list = list;
		}
		
		$scope.go = ClearFn.go;
	}])
	
	.controller('StaticSearchCtrl', ['$scope', 'Elms', function($scope, Elms) {
		$scope.elms = Elms.query();	
	}])
	
	.controller('GuidelinesCtrl', ['$scope', 'GuidelinesProcess', 'GuidelinesWeb', 'GuidelinesMobile', function($scope, GuidelinesProcess, GuidelinesWeb, GuidelinesMobile) {
		GuidelinesProcess.query(function(elms) {
			$scope.elmsProcess = elms;
		});
		
		GuidelinesWeb.get(function(elm) {
			$scope.elmWeb = elm;
		});
		
		GuidelinesMobile.get(function(elm) {
			$scope.elmMobile = elm; 
		});
	}])
	
	.controller('GuidelinesProcessCtrl', ['$scope', '$location', '$anchorScroll', '$timeout', 'GuidelinesProcess', function($scope, $location, $anchorScroll, $timeout, GuidelinesProcess) {
		GuidelinesProcess.query(function(elms) {
			$scope.elms = elms;
			$timeout(function() {
				$anchorScroll();
			}, 500);
		});
		
		$scope.scrollTo = function(anchor) {
			$location.hash(anchor);
			$anchorScroll();
		}
		
		$scope.types = ["order", "shipment", "box", "item"];
		
		$scope.display = {
			"downloads": true,
			"interactions": true,
			"updates": true,
			"updates_mobile": true, 
			"processing": false 
				
		}
		$scope.location = {
			"na":true,
			"vendor":true,
			"tohub":true,
			"hub":true,
			"fromhub":true,
			"port":true,
			"toclient":true,
			"client":true
		};
		  
		$scope.filterFn = function(elm) {
			if($scope.location[elm.location_id]) {
				  return true;
			}
			return false; 
		};
	}])
	
	.controller('GuidelinesWebCtrl', ['$scope', '$location', '$anchorScroll', '$timeout', 'GuidelinesWeb', function($scope, $location, $anchorScroll, $timeout, GuidelinesWeb) {
		GuidelinesWeb.get(function(elm) {
			$scope.elm = elm; 
			$timeout(function() {
				$anchorScroll();
			}, 500);
		});
		
		$scope.scrollTo = function(anchor) {
			$location.hash(anchor);
			console.log('anchor: ', anchor);
			$anchorScroll();
		}
	}])
	
	.controller('GuidelinesMobileCtrl', ['$scope', '$location', '$anchorScroll', '$timeout', 'GuidelinesMobile', function($scope, $location, $anchorScroll, $timeout, GuidelinesMobile) {
		GuidelinesMobile.get(function(elm) {
			$scope.elm = elm; 
			$timeout(function() {
				$anchorScroll();
			}, 500);
		});
		
		$scope.scrollTo = function(anchor) {
			$location.hash(anchor);
			$anchorScroll();
		}	
	}])
	
	.controller('StaticDetailCtrl', ['$scope', '$location', '$anchorScroll', 'Elm', '$modal', 'ClearFn', 'ColorScaleConfig', '$timeout', 'Utils', function($scope, $location, $anchorScroll, Elm, $modal, ClearFn, ColorScaleConfig, $timeout, Utils) {
		$scope.loaded = false;
		Elm.get(function(elm) {
			for (var index in elm.charts) {
				ColorScaleConfig.assignProperties(elm.charts[index]);
			}
			
			$scope.qrCodeGoogle = ClearFn.qrCodeGoogle(elm); 
			
			$scope.elm = elm;
			$scope.charts = elm.charts;
			var related_type = $location.search().related_type;
			if (related_type) {
				for (var i in elm.related) {
					if (related_type === elm.related[i].type) {
						$scope.relatedActiveTab[related_type] = true;
						break;
					}
				}
				$timeout(function() {
					$anchorScroll();
				}, 1000);
			}
			
			$scope.date = ClearFn.propertiesDate(elm);
			
			$scope.loaded = true;
		}); 
		
		$scope.relatedActiveTab = {};
		$scope.init = { sortType: 'DESC', limit: 16 };
		$scope.trackingShow = true;
		$scope.modalConditionOpen = ClearFn.modalConditionOpen;
		$scope.modalDeleteOpen = ClearFn.modalDeleteOpen;  
		$scope.trackingToggle = ClearFn.trackingToggle;
		$scope.propertySave = function(elm, property, groupName) {
			ClearFn.propertySave(elm, property, groupName);
		}
		$scope.dateToTimestamp = Utils.dateToTimestamp;
		
		$scope.calDisabled = ClearFn.calDisabled;
		
		$scope.calOpen = function($event, param) {
			$event.preventDefault();
		    $event.stopPropagation();
		    $scope.date[param].opened = true;
		};
	}])
	
	.controller('News', ['$scope', function($scope) {
	}]);




