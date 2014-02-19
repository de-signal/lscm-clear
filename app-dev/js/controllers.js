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
	
	.controller('DashboardCtrl', ['$location', '$scope', 'E1', 'ClearFn', 'Utils', function($location, $scope, E1, ClearFn, Utils) {
		$scope.listLoad = function(listInit) {
			var config = {'resource': E1}; 
			$scope.listInit = Utils.collect($scope.init, listInit);
			var list = ClearFn.listLoad($scope.listInit, config);
			
			list.then(function(list) {
				$scope.listConfig = list.listConfig;
				$scope.elements = list.elements;
				$scope.loaded = true;
			});
		}
		
		$scope.pageLoad = function (page) {
			$scope.listInit.page = page;
			$scope.listLoad($scope.listInit);
		}
		
		$scope.listSort = function(type) {
			delete $scope.listInit.page;
			if ($scope.listInit.sortBy === type) { 
				($scope.listInit.sortOrder ==='ASC' ) ? $scope.listInit.sortOrder = 'DESC': $scope.listInit.sortOrder = 'ASC';
			} else {
				$scope.listInit.sortBy = type;
			}
			$scope.listLoad($scope.listInit);
		}
		
		E1.query({'type': 'report'}, function(docs){
			$scope.report = docs[docs.length-1];
		});
		
		$scope.init = { sortBy: 'status', sortOrder: 'ASC', limit: 8, tracking: true };
		$scope.loaded = false;
		$scope.listLoad({'type': 'dashboard'}); 
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
	
	.controller('ListCtrl', ['$scope', 'E2', '$location', 'Utils', 'ClearFn', function($scope, E2, $location, Utils, ClearFn) {
		
		$scope.listSort = function(type) {
			delete $scope.listInit.page;
			if ($scope.listInit.sortBy === type) { 
				($scope.listInit.sortOrder ==='ASC' ) ? $scope.listInit.sortOrder = 'DESC': $scope.listInit.sortOrder = 'ASC';
			} else {
				$scope.listInit.sortBy = type;
			}
			$scope.listLoad($scope.listInit);
		}
		
		$scope.propertySave = function(elm, property, groupName) {
			ClearFn.propertySave(elm, property, groupName);
		}
		
		$scope.pageLoad = function (page) {
			$scope.listInit.page = page;
			$scope.listLoad($scope.listInit);
		}
		
		$scope.listLoad = function(listInit) {
			var config = {'resource': E2}; 
			$scope.listInit = Utils.collect($scope.init, listInit);
			var list = ClearFn.listLoad($scope.listInit, config);
			
			list.then( function(list) {
				$scope.listConfig = list.listConfig;
				$scope.elements = list.elements;
				$scope.loaded = true;
				
				$scope.columns=4;
				if (listInit.type === 'shipment') {
					$scope.columns++
					$scope.colmunChrono = true;
				}
				if ($scope.trackingShow) {
					$scope.columns++
				}
			});
		}
		
		$scope.modalConditionOpen = ClearFn.modalConditionOpen; 
		$scope.trackingToggle = ClearFn.trackingToggle;
		$scope.loaded = false;
		$scope.go = ClearFn.go;
	}])
	
	.controller('TrackingCtrl', ['$scope', function($scope) {
		$scope.categories=[	
			{"name": "Orders", "type": "order" }, 
			{"name": "Shipments", "type": "shipment" }, 
			{"name": "Boxes", "type": "box" }, 
			{"name": "Items", "type": "item" }
		];
		
		$scope.init = { sortBy: 'status', sortOrder: 'ASC', limit: 8, tracking: true };
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
	
	.controller('DetailCtrl', ['$scope', '$routeParams', '$location', '$timeout', '$anchorScroll', 'E2', 'ColorScaleConfig', 'Utils', 'ClearFn', function($scope, $routeParams, $location, $timeout, $anchorScroll, E2, ColorScaleConfig, Utils, ClearFn) {
		$scope.loaded = false;
		$scope.relatedActiveTab = {};
		$scope.init = { sortBy: 'status', sortOrder: 'ASC', limit: 16 };
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
		
		E2.get({'type': $routeParams.type, "id": $routeParams.id }, function(elm) {
			
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
	
	.controller('SearchCtrl', ['$location', '$scope', 'E3', '$timeout', 'Utils', function($location, $scope, E3, $timeout, Utils) { 
		
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
		
		E3.get({"type": "core", 'id': 'filter' }, function(searchFilters){ 
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
	
	  $scope.openCal = function(param) {
		$timeout(function() {
		  $scope.date[param].opened = true;
		});
	  };
	  
	  var date = { milestone_start: {}, milestone_end: {}, property_start: {}, property_end: {} };
	  var query = $location.search();
	  
	  (Utils.is_empty(query)) ? $scope.showList=false : $scope.showList=true;
	  
	  if (query.milestone_date_start)	date.milestone_start.value	= Utils.timestampToDate(query.milestone_date_start);
	  if (query.milestone_date_end)		date.milestone_end.value	= Utils.timestampToDate(query.milestone_date_end);
	  if (query.property_date_start)	date.property_start.value	= Utils.timestampToDate(query.property_date_start);
	  if (query.property_date_end)		date.property_end.value		= Utils.timestampToDate(query.property_date_end);
	  
	  $scope.query = query;
	  $scope.date = date;
	  $scope.dateToTimestamp = Utils.dateToTimestamp;
	  $scope.IndxOf = Utils.IndxOf;
	  $scope.init = { sortBy: 'status', sortOrder: 'ASC', limit: 12 };
	  $scope.trackingShow = true;

	  console.log('query: ', $scope.query, '/ showList: ', $scope.showList);
	  
	}])
	
	.controller('DocumentsCtrl', ['$location', '$scope', '$routeParams', '$timeout', 'E1', 'Utils', 'ClearFn', function($location, $scope, $routeParams, $timeout, E1, Utils, ClearFn) {
		
		$scope.search = function (query) {
			$location.search('page', null);
			for (var i in query) {
				console.log('i: ', i, 'query[i]: ', query[i]);
				if (query[i]===null || (i === 'reference' && !query[i])) {
			    	$location.search(i, null);
			    }
			}
			if (!query.hasOwnProperty('reference')) { 
				$location.search('related_to', null);
			}
			$location.search(query);
		};
		
		$scope.calOpen = function($event, param) {
			$event.preventDefault();
		    $event.stopPropagation();
		    $scope.date[param].opened = true;
		};
				
		$scope.badgeRemove = function(badge) {
			$location.search(ClearFn.filterRemove(badge, query));
		}
		
		$scope.listLoad = function(listInit) {
			var config = {
				'resource': E1, 
				'filters': { 'resource': E1, 'type': listInit.type, 'id': 'filter' }
			}; 
			$scope.listInit = Utils.collect($scope.init, listInit);
			var list = ClearFn.listLoad($scope.listInit, config);
			
			list.then(function(list) {
				$scope.listConfig = list.listConfig;
				$scope.docs = list.elements;
				$scope.loaded = true;
			});
		}
		
		$scope.pageLoad = function (page) {
			$scope.listInit.page = page;
			$scope.listLoad($scope.listInit);
		}
		
		var type = $routeParams.type;
		var query = $location.search();
		var queryType = Utils.collect({'type': type}, query);
		var date = { from: {}, to: {} };
		
		if (query.date_from)	date.from.value	= Utils.timestampToDate(query.date_from);
		if (query.date_to)		date.to.value	= Utils.timestampToDate(query.date_to);
		
		$scope.loaded = false;
		
		switch (type) {
			case 'ir': $scope.page= {'name': 'Inspection reports', 'type': type }; break;
			case 'ncr': $scope.page= {'name': 'Non compliance reports', 'type': type }; break;
			case 'pod': $scope.page= {'name': 'Proofs of delivery', 'type': type }; break;	
		}
		 
		$scope.query = query;
		$scope.date = date;
		$scope.dateToTimestamp = Utils.dateToTimestamp;
		
		$scope.go = ClearFn.go;
		$scope.init = { limit: 8, tracking: true };
		$scope.listLoad(queryType);
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
	
	.controller('StaticDocumentsCtrl', ['$location', '$scope', '$routeParams', 'ClearFn', 'IRs', 'NCRs', 'PODs', 'IRsFilters', 'NCRsFilters', 'PODsFilters', 'Utils', function($location, $scope, $routeParams, ClearFn, IRs, NCRs, PODs, IRsFilters, NCRsFilters, PODsFilters, Utils) {
		
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
		
		$scope.calOpen = function($event, param) {
			$event.preventDefault();
		    $event.stopPropagation();
		    $scope.date[param].opened = true;
		};
		
		$scope.badgeRemove = function(badge) {
			$location.search(ClearFn.filterRemove(badge, query));
		}
		
		var date = { from: {}, to: {} };
		var query = $location.search();
		
		if (query.date_from)	date.from.value	= Utils.timestampToDate(query.date_from);
		if (query.date_to)		date.to.value	= Utils.timestampToDate(query.date_to);
		
		var type = $routeParams.type;
		switch (type) {
			case 'ir': 
				$scope.page= {'name': 'Inspection reports', 'type': type }; 
				var datas = {'resource': IRs, 'filtersResource': IRsFilters};
				break;
			case 'ncr': 
				$scope.page= {'name': 'Non compliance reports', 'type': type }; 
				var datas = {'resource': NCRs, 'filtersResource': NCRsFilters};
				break;
			case 'pod': 
				$scope.page= {'name': 'Proofs of delivery', 'type': type };
				var datas = {'resource': PODs, 'filtersResource': PODsFilters}; 
				break;	
		}
		
		console.log('datas: ', datas); 
		$scope.go = ClearFn.go;
		$scope.loaded = false;
		$scope.query = query;
		$scope.date = date;
		$scope.dateToTimestamp = Utils.dateToTimestamp;
		datas.resource.query(function(docs) {
			datas.filtersResource.get(function(filters) { 
			    $scope.config.filters = filters; 
			    $scope.config.badges = ClearFn.badgesDisplay(query, filters);
			});
			$scope.docs = docs;
			$scope.loaded = true;
		});
		
		
	}])
	
	.controller('StaticInspectionReportCtrl', ['$scope', '$filter', 'IR', function($scope, $filter, IR) {
		$scope.loaded = false;
		$scope.doc = IR.get(function(doc) {
			for(var i=0, len=doc.boxes.length;i<len;i++) {
				$scope.doc.boxes[i].itemsGroupBy4 = $filter('groupBy')(doc.boxes[i].items, 4);
			}
			$scope.loaded = true;
		});
	}])
	
	.controller('StaticNonComplianceReportCtrl', ['$location', '$scope', 'NCR', '$modal', function($location, $scope, NCR, $modal) {
		$scope.loaded = false;
		NCR.get(function(doc){
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
	
	.controller('StaticProofOfDeliveryCtrl', ['$location', '$scope', 'ClearFn', 'POD', function($location, $scope, ClearFn, POD) {
		$scope.loaded = false;
		POD.get(function(doc) {
			$scope.doc = doc;
			$scope.loaded = true;
		});
		$scope.go = ClearFn.go;
	}])
	
	.controller('StaticListCtrl', ['$location', '$scope', 'ClearFn', 'Elms', function($location, $scope, ClearFn, Elms) {
		var list=[],elements=[],j;
		
		$scope.listLoad = function (ListInit) {
			elements = Elms.query(function(datas){ 
					for (j=datas.length-1;j>=0;j--) {
						if (datas[j].type === ListInit.type) {
							if (datas[j].tracking === "tracked") list.unshift(datas[j]);
							console.log(list);
						}
					}
			});
			$scope.elementsCount = 20;
			$scope.elements = list;
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
	
	.controller('StaticDetailCtrl', ['$scope', '$location', '$anchorScroll', '$timeout', '$interval', 'Elm', '$modal', 'ClearFn', 'ColorScaleConfig', 'Utils', function($scope, $location, $anchorScroll, $timeout, $interval, Elm, $modal, ClearFn, ColorScaleConfig, Utils) {
		$scope.loaded = false;
		
		Elm.get(function(elm) {
			var timelineAnim = function(index) {
				console.log('anim: ', index);
				if (elm.timeline[index].completed) $scope.elm.timeline[index].anim = true; 
			}
			
			for (var index in elm.charts) {
				ColorScaleConfig.assignProperties(elm.charts[index]);
			}
			
			
			$scope.qrCodeGoogle = ClearFn.qrCodeGoogle(elm); 
			
			$scope.elm = elm;
			
			var timelineIndex = 0;
			$interval(function() {timelineAnim(timelineIndex++)}, 1200, 4); 

			
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
		$scope.init = { sortOrder: 'ASC', limit: 16 };
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




