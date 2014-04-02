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
	
	.controller('BugListCtrl', ['$scope', 'Bugs', function($scope, Bugs) {
		Bugs.query( function(bugs) { 
			$scope.bugs = bugs;
		});
	}])
	
	.controller('DashboardCtrl', ['$location', '$scope', '$timeout', 'E1', 'ClearFn', 'Utils', function($location, $scope, $timeout, E1, ClearFn, Utils) {
		
		ClearFn.listsReady('init');
		$scope.listsConfig = [{
			"resource": "1", 
			"format": "", 
			"type": "dashboard",
			"id": "dashboard",  
			"display": { 
				"filters" : false
			}, 
			"urlInit": {
				"sortBy": "status", 
				"sortOrder": "ASC", 
				"limit": 12
			}
		}]
		$timeout(function() {
			$scope.$broadcast('event:ListInit', $scope.listsConfig[0].id);
			ClearFn.listsReady('parent');
		});
		 
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			$scope.$broadcast('event:listLoad_' + $scope.listsConfig[0].id, ClearFn.listsUrlSet(urlParams, listId, $scope.listsConfig[0]));
		});
		
		E1.query({'type': 'report'}, function(docs){
			$scope.reports = docs;
		});
		
		$scope.go = ClearFn.go;
		$scope.modalConditionOpen = ClearFn.modalConditionOpen;
	}])
	
	.controller('TvCtrl', ['$interval', '$rootScope', '$scope', 'E1', 'News', 'ClearFn', function($interval, $rootScope, $scope, E1, News, ClearFn) {
		$scope.loaded = false;
		$rootScope.tvScreen = true;
		
		var listElementsLoad = function() {
			E1.query({'type': 'dashboard', "sortBy": "status", "sortOrder": "ASC", "limit": 12 }, function(list) {
				// $scope.list = list;
				$scope.list=[];
				$interval(function() {$scope.list.push(list.shift())}, 100, list.length);
				$scope.loaded = true;
			});
		}
		var listEmpty = function() {
			if ($scope.list) {
				var n = $scope.list.length;
				$interval(function() {$scope.list.shift()}, 50, n).then(listElementsLoad);
			}
		}	
		
		listElementsLoad();
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
	
	.controller('AddOrderCtrl', [ '$timeout', function($timeout) {
		$scope.buttonDisable = function () {
			$timeout(function() {
				$scope.buttonDisabled = true;
			}, 10);
		}
	}])
	
	.controller('ListCtrl', ['$scope', 'Utils', 'ClearFn', 'ClearListsFn', function($scope, Utils, ClearFn, ClearListsFn) {
		
		$scope.listInit = function(listId) {
			$scope.loaded = false; 
			$scope.$on('event:listLoad_' + listId, function(event, listConfig) {
				$scope.listLoad(listConfig);
			});
			$scope.$on('event:listReady_' + listId, function(event, listId) {
				$scope.listQuery({}, listId);
			});
			ClearFn.listsReady(listId);
		}
		
		$scope.listQuery = function(urlParams, listId) {
			ClearListsFn.listCleanUrl(urlParams); 
			$scope.$emit('event:urlSet', urlParams, listId); 
		}
		
		$scope.listLoad = function(listConfig) {
			$scope.listElementsLoad(listConfig);
			if (listConfig.display.filters) {
				$scope.listFiltersLoad(listConfig);
			} else { 
				$scope.filters = {}; 
			}
		}
		
		$scope.listElementsLoad = function(listConfig) {
			ClearListsFn.listElementsLoad(listConfig).then( function(list) {
				$scope.list = list;
				if(listConfig.type ==='shipment' || listConfig.type ==='shipmentIn' || listConfig.type ==='shipmentOut') {
					$scope.listShipment = true; 
				}
				$scope.loaded = true;
			});
		}
		
		$scope.listFiltersLoad = function(listConfig) {
			ClearListsFn.listFiltersLoad(listConfig).then( function(filters) {
				$scope.filters = filters;
				$scope.filters.tmp.ModificationsOpen = false; 
				$scope.filters.tmp.selection = [];
				$scope.filters.tmp.propertyUpdate = {};
			}); 
		}
		
		$scope.listSort = function(param) {
			delete $scope.list.urlParams.page;
			if ($scope.list.urlParams.sortBy === param) { 
				$scope.list.urlParams.sortOrder = ($scope.list.urlParams.sortOrder ==='ASC' ) ? 'DESC' : 'ASC';
			} else {
				$scope.list.urlParams.sortBy = param;
			}
			$scope.listQuery($scope.list.urlParams, $scope.list.id); 
		}
		
		$scope.propertySave = function(elm, property, groupName) {
			ClearFn.propertySave(elm, property, groupName);
		}
		
		$scope.listPaginate = function (page) {
			$scope.list.urlParams.page = page;
			$scope.listQuery($scope.list.urlParams, $scope.list.id);; 
		}

		$scope.badgeRemove = function(badge) {
			console.log ('badge remove: ', badge); 
			delete $scope.list.urlParams[badge];
			$scope.listQuery($scope.list.urlParams, $scope.list.id);; 
		}

		$scope.calOpen = function($event, param) {
			$event.preventDefault();
			$event.stopPropagation();
			$scope.filters.date[param].opened = true;
		}
		
		$scope.selectionAll = function(elms) {
			for (var i in elms) {
				var idx = $scope.filters.tmp.selection.indexOf(elms[i].id);
				if (idx === -1) {
			    	$scope.filters.tmp.selection.push(elms[i].id);
			    }
			}
		}
		
		$scope.selectionNone = function(elms) {
			for (var i in elms) {
				var idx = $scope.filters.tmp.selection.indexOf(elms[i].id);
				if (idx > -1) {
			    	$scope.filters.tmp.selection.splice(idx, 1);
			    }
			}
		}
		
		$scope.selectionInverse = function(elms) {
			for (var i in elms) {
				$scope.selectionToggle(elms[i].id);
			}
		}
		
		$scope.selectionToggle = function (id) {
			var idx = $scope.filters.tmp.selection.indexOf(id);
			if (idx > -1) { // is currently selected
				$scope.filters.tmp.selection.splice(idx, 1);
			} else { // is newly selected
				$scope.filters.tmp.selection.push(id);
			}
		};
		  
		$scope.listPropertySave = function (list, idsArray, property) {
			ClearListsFn.listPropertySave(list, idsArray, property);
			$scope.filters.tmp.ModificationsOpen = false; 
			$scope.filters.tmp.selection = [];
			$scope.filters.tmp.propertyUpdate = {};
		}
		
		$scope.stopPropagation = ClearFn.stopPropagation;
		$scope.dateToTimestamp = Utils.dateToTimestamp;
		$scope.modalConditionOpen = ClearFn.modalConditionOpen; 
		$scope.trackingToggle = ClearFn.trackingToggle;
		$scope.go = ClearFn.go;
		$scope.loaded = false;
		
		$scope.$on('event:ListInit', function(event, listId) {
			$scope.listInit(listId); 
		});
	}])
	
	.controller('TrackingCtrl', ['$scope', '$location', 'Utils', 'ClearFn', 'ElmsListsConfig', function($scope, $location, Utils, ClearFn, ElmsListsConfig){
		
		ClearFn.listsReady('init'); 
		
		$scope.types=[	
			{"name": "Orders", "id": "order", 'url': 'O' }, 
			{"name": "Shipments", "id": "shipment", 'url': 'S' }, 
			{"name": "Boxes", "id": "box", 'url': 'B'  }, 
			{"name": "Items", "id": "item", 'url': 'I'  }
		];		
		
		$scope.listsConfig = [];
		ElmsListsConfig.get( function(config) {	
			for (var i in $scope.types) {
				$scope.listsConfig[i] = Utils.clone(config);
				$scope.listsConfig[i].resource = '2'; 
				$scope.listsConfig[i].id = $scope.types[i].id; 
				$scope.listsConfig[i].type = $scope.types[i].id;
				$scope.listsConfig[i].listCode = $scope.types[i].url; 
				$scope.listsConfig[i].display.modifications = true; 
			}
			ClearFn.listsReady('parent'); 
		});
		
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			var typeIndex = Utils.objectIndexbyKey($scope.types, 'id', listId); 
			$scope.$broadcast('event:listLoad_' + listId, ClearFn.listsUrlSet(urlParams, listId, $scope.listsConfig[typeIndex])); 
		});
	}])
	
	.controller('StaticTrackingCtrl', ['$scope', '$location', 'Utils', 'ClearFn', 'ElmsListsConfig', function($scope, $location, Utils, ClearFn, ElmsListsConfig){
		
		ClearFn.listsReady('init'); 
		
		$scope.types=[	
			{"name": "Orders", "id": "order", 'url': 'O' }, 
			{"name": "Shipments", "id": "shipment", 'url': 'S' }, 
			{"name": "Boxes", "id": "box", 'url': 'B'  }, 
			{"name": "Items", "id": "item", 'url': 'I'  }
		];		
		
		$scope.listsConfig = [];
		ElmsListsConfig.get( function(config) {	
			for (var i in $scope.types) {
				$scope.listsConfig[i] = Utils.clone(config);
				$scope.listsConfig[i].id = $scope.types[i].id; 
				$scope.listsConfig[i].type = $scope.types[i].id;
				$scope.listsConfig[i].listCode = $scope.types[i].url; 
				$scope.listsConfig[i].display.modifications = true; 
				switch ($scope.types[i].id) {
					case 'order': $scope.listsConfig[i].resource = '6'; break;
					case 'shipment': $scope.listsConfig[i].resource = '7'; break;
					case 'box': $scope.listsConfig[i].resource = '8'; break;
					case 'item': $scope.listsConfig[i].resource = '9'; break;
				}
			}
			ClearFn.listsReady('parent'); 
		});
		
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			var typeIndex = Utils.objectIndexbyKey($scope.types, 'id', listId); 
			$scope.$broadcast('event:listLoad_' + listId, ClearFn.listsUrlSet(urlParams, listId, $scope.listsConfig[typeIndex])); 
		});
	}])
	
	.controller('DetailCtrl', ['$scope', '$routeParams', '$location', '$interval', '$timeout', '$anchorScroll', 'E2', 'Utils', 'ClearFn', 'ElmsListsConfig', function($scope, $routeParams, $location, $interval, $timeout, $anchorScroll, E2, Utils, ClearFn, ElmsListsConfig) {
		
		$scope.loaded = false;
		$scope.relatedActiveTab = {};
		ClearFn.listsReady('init');
		
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
		
		E2.get({'format': 'elements', 'type': $routeParams.type, "id": $routeParams.id }, function(elm) {
			
			elm.anim = true; 
			elm = ClearFn.detailUpdate(elm);
			
			$scope.elm = elm;
			
			if (elm.timeline) {
				var timelineAnim = function(i) {
					console.log('anim: ', i);
					if (elm.timeline[i].completed) elm.timeline[i].anim = true; 
				}
				var loops = 0;
				$interval(function() {timelineAnim(loops++)}, 1000, 4); 
			}
			
			if ($location.search().related_type_active) {
				for (var i in elm.related) {
					if ($location.search().related_type_active === elm.related[i].type) {
						$scope.relatedActiveTab[$location.search().related_type_active] = true;
						break;
					}
				}
				$timeout(function() {
					$anchorScroll();
				}, 1000);
			}
			
			$scope.listsConfig = [];
			ElmsListsConfig.get( function(config) {
				for (var i in elm.related) {
					$scope.listsConfig[i] = Utils.clone(config);
					$scope.listsConfig[i].urlInit.related = elm.type; 
					$scope.listsConfig[i].urlInit.related_id = elm.id; 
					$scope.listsConfig[i].type = elm.related[i].type;
					$scope.listsConfig[i].id = elm.related[i].type;
					$scope.listsConfig[i].resource = '2'; 
					switch (elm.related[i].type) {
						case 'order': $scope.listsConfig[i].listCode = 'O'; break;
						case 'shipment': $scope.listsConfig[i].listCode = 'S'; break;
						case 'box': $scope.listsConfig[i].listCode = 'B'; break;
						case 'item': $scope.listsConfig[i].listCode = 'I'; break;
					}
				}
				ClearFn.listsReady('parent'); 
			}); 
			$scope.$on('event:urlSet', function(event, urlParams, listId) {
				var typeIndex = Utils.objectIndexbyKey($scope.elm.related, 'type', listId); 
				$scope.$broadcast('event:listLoad_' + listId, ClearFn.listsUrlSet(urlParams, listId, $scope.listsConfig[typeIndex]));
			});
			
			$scope.loaded = true;
		});	
		
	}])
	
	.controller('StaticDetailCtrl', ['$scope', '$location', '$anchorScroll', '$timeout', '$interval', 'Elm', 'ElmsListsConfig', '$modal', 'ClearFn', 'Utils', function($scope, $location, $anchorScroll, $timeout, $interval, Elm, ElmsListsConfig, $modal, ClearFn, Utils) {
	
		$scope.loaded = false;
		$scope.relatedActiveTab = {};
		ClearFn.listsReady('init');
		
		$scope.modalConditionOpen = ClearFn.modalConditionOpen;
		$scope.modalDeleteOpen = ClearFn.modalDeleteOpen;  
		$scope.trackingToggle = ClearFn.trackingToggle;
		$scope.propertySave = function(elm, property, groupName) {
			ClearFn.propertySave(elm, property, groupName);
		}
		$scope.dateToTimestamp = Utils.dateToTimestamp;
		
		$scope.calOpen = function($event, param) {
			$event.preventDefault();
			$event.stopPropagation();
			$scope.date[param].opened = true;
		};
		
		Elm.get(function(elm) {
			elm.anim = true; 
			elm = ClearFn.detailUpdate(elm);
			
			$scope.elm = elm;
			
			if (elm.timeline) {
				var timelineAnim = function(i) {
					console.log('anim: ', i);
					if (elm.timeline[i].completed) elm.timeline[i].anim = true; 
				}
				var loops = 0;
				$interval(function() {timelineAnim(loops++)}, 1000, 4); 
			}

			var active = $location.search().related_type_active;
			if (active) {
				for (var i in elm.related) {
					if (active === elm.related[i].type) {
						$scope.relatedActiveTab[active] = true;
						break;
					}
				}
				$timeout(function() {
					$anchorScroll();
				}, 1000);
			}
			
			$scope.listsConfig = [];
			ElmsListsConfig.get( function(config) {
				for (var i in elm.related) {
					$scope.listsConfig[i] = Utils.clone(config);
					$scope.listsConfig[i].urlInit.related = elm.type; 
					$scope.listsConfig[i].urlInit.related_id = elm.id; 
					$scope.listsConfig[i].type = elm.related[i].type;
					$scope.listsConfig[i].id = elm.related[i].type;
					$scope.listsConfig[i].resource = '2'; 
					switch (elm.related[i].type) {
						case 'order': $scope.listsConfig[i].listCode = 'O'; break;
						case 'shipment': $scope.listsConfig[i].listCode = 'S'; break;
						case 'box': $scope.listsConfig[i].listCode = 'B'; break;
						case 'item': $scope.listsConfig[i].listCode = 'I'; break;
					}
				}
				ClearFn.listsReady('parent'); 
			}); 
			$scope.$on('event:urlSet', function(event, urlParams, listId) {
				var typeIndex = Utils.objectIndexbyKey($scope.elm.related, 'type', listId); 
				$scope.$broadcast('event:listLoad_' + listId, ClearFn.listsUrlSet(urlParams, listId, $scope.listsConfig[typeIndex]));
			});
			
			$scope.loaded = true;
		}); 
	}])
	
	.controller('SearchCtrl', ['$scope', '$location', 'ClearFn', 'Utils', 'ElmsListsConfig', function($scope, $location, ClearFn, Utils, ElmsListsConfig) {
		
		ClearFn.listsReady('init');
		
		$scope.urlSet = function(urlParams, listId) {
			var type = urlParams.type || $location.search().type;
			if (type) {
				$scope.listsConfig[0].type = type; 
				var listConfig = ClearFn.listsUrlSet(urlParams, listId, $scope.listsConfig[0]); 
				$scope.$broadcast('event:listLoad_' + listId, listConfig);
				$scope.urlPage = listConfig.urlParams;
				$scope.listShow=true;				
			} else {
				$scope.urlPage = {}; 
				$scope.listShow=false;
			}
		} 
		
		$scope.types=[	
			{"name": "Orders", "id": "order" }, 
			{"name": "Shipments in", "id": "shipmentIn" }, 
			{"name": "Shipments out", "id": "shipmentOut" }, 
			{"name": "Boxes", "id": "box" }, 
			{"name": "Items", "id": "item" }
		];		
		
		$scope.listsConfig = [];
		ElmsListsConfig.get( function(config) {
			$scope.listsConfig[0] = config; 
			$scope.listsConfig[0].id = "searchResult";
			$scope.listsConfig[0].resource = '2'; 
			$scope.$broadcast('event:ListInit', $scope.listsConfig[0].id);
			ClearFn.listsReady('parent'); 
		}); 
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			$scope.urlSet(urlParams, listId);
		});
	}])
		
	.controller('ElementsCtrl', ['$scope', '$routeParams', 'ClearFn', 'Utils', 'ElmsListsConfig', function($scope, $routeParams, ClearFn, Utils, ElmsListsConfig) {
		
		ClearFn.listsReady('init');
		var type = $routeParams.type; 
		
		switch (type) {
			case 'order': $scope.type = 'order'; $scope.name = 'Orders'; break;
			case 'shipment': $scope.type = 'shipment'; $scope.name = 'Shipments'; break;
			case 'shipmentIn': $scope.type = 'shipment'; $scope.name = 'Shipments in'; break;
			case 'shipmentOut': $scope.type = 'shipment'; $scope.name = 'Shipments out'; break;
			case 'box': $scope.type = 'box'; $scope.name = 'Boxes'; break;
			case 'item': $scope.type = 'item'; $scope.name = 'Items'; break;
		}	
		
		$scope.listsConfig = [];
		ElmsListsConfig.get( function(config) {
			$scope.listsConfig[0] = config; 
			$scope.listsConfig[0].type = type; 
			$scope.listsConfig[0].id = "elements";
			$scope.listsConfig[0].resource = '2'; 
			$scope.$broadcast('event:ListInit', $scope.listsConfig[0].id);
			ClearFn.listsReady('parent'); 
		}); 
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			$scope.$broadcast('event:listLoad_' + listId, ClearFn.listsUrlSet(urlParams, listId, $scope.listsConfig[0]));
		});
	}])
	
	.controller('DocumentsCtrl', ['$scope', '$routeParams', 'ClearFn', 'Utils', 'DocumentsConfig', function($scope, $routeParams, ClearFn, Utils, DocumentsConfig) {
		
		ClearFn.listsReady('init'); 
		
		var type = $routeParams.type; 
		
		$scope.listsConfig = [];
		DocumentsConfig.get( function(config) {
			$scope.listsConfig[0] = config; 
			$scope.listsConfig[0].resource = '2'; 
			$scope.listsConfig[0].type = type;
			$scope.listsConfig[0].id = "documents";
			$scope.$broadcast('event:ListInit', $scope.listsConfig[0].id);
			ClearFn.listsReady('parent'); 
		}); 
		
		switch (type) {
			case 'ir': $scope.page= {'name': 'Inspection reports', 'type': type }; break;
			case 'ncr': $scope.page= {'name': 'Non-conformity reports', 'type': type }; break;
			case 'pod': $scope.page= {'name': 'Proofs of delivery', 'type': type }; break;
			case 'archives': $scope.page= {'name': 'Archives', 'type': type }; break;		
		}
		
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			$scope.$broadcast('event:listLoad_' + $scope.listsConfig[0].id, ClearFn.listsUrlSet(urlParams, listId, $scope.listsConfig[0]));
		});
	}])
	
	.controller('StaticDocumentsCtrl', ['$scope', '$routeParams', 'ClearFn', 'DocumentsConfig', 'Utils', function($scope, $routeParams, ClearFn, DocumentsConfig, Utils) {
		
		ClearFn.listsReady('init'); 
		
		var type = $routeParams.type; 
		
		$scope.listsConfig = [];
		DocumentsConfig.get( function(config) {
			$scope.listsConfig[0] = config; 
			$scope.listsConfig[0].type = type;
			$scope.listsConfig[0].id = "documents";
			switch (type) {
				case 'ir': $scope.page= {'name': 'Inspection reports', 'type': type }; $scope.listsConfig[0].resource = '10'; break;
				case 'ncr': $scope.page= {'name': 'Non-conformity reports', 'type': type }; $scope.listsConfig[0].resource = '11'; break;
				case 'pod': $scope.page= {'name': 'Proofs of delivery', 'type': type }; $scope.listsConfig[0].resource = '12'; break;
				case 'archives': $scope.page= {'name': 'Archives', 'type': type }; $scope.listsConfig[0].resource = '13'; break;		
			}
			$scope.$broadcast('event:ListInit', $scope.listsConfig[0].id);
			ClearFn.listsReady('parent'); 
		}); 
		
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			$scope.$broadcast('event:listLoad_' + $scope.listsConfig[0].id, ClearFn.listsUrlSet(urlParams, listId, $scope.listsConfig[0]));
		});
		
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
	
	.controller('TplModalConditionCtrl', ['$scope', '$upload', 'ClearFn', '$modalInstance', 'required', 'elm', function ($scope, $upload, ClearFn, $modalInstance, required, elm) {
		$scope.required = required;
		console.log('requireddd: ', required); 
		$scope.elm = elm;
		console.log('elm: ', elm, '/ elm.name: ', elm.name, '/ required: ', required);
		switch (required.type) {
			case 'upload': 
				$scope.onFileSelect = function($files) {
				    for (var i = 0; i < $files.length; i++) {
				      var file = $files[i];
				      $scope.upload = $upload.upload({
				        url: '/index_rest.php/api/clear/v2/elements/'+ elm.type + '/' + elm.id + '?required=' + required.id,
				        data: {myObj: $scope.myModelObj},
				        file: file,
				      }).progress(function(evt) {
				        console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
				      }).success(function(data, status, headers, config) {
				        console.log(data);
				      });
				      //.error(...)
				      //.then(success, error, progress); 
				    }
				    // $scope.upload = $upload.upload({...}) alternative way of uploading, sends the the file content directly with the same content-type of the file. Could be used to upload files to CouchDB, imgur, etc... for HTML5 FileReader browsers. 
				  };
				
				
				// ngUpload
				$scope.uploadUrl = '/index_rest.php/api/clear/v2/'+ elm.type + '/' + elm.id + '?required=' + required.id;
				$scope.startUploading = function() {
					$scope.uploadMessage = "Uploading in progress, please wait…";
				};
				
				$scope.complete = function (content, completed) {
					$scope.uploadMessage = 'File uploaded. Save to complete.'
				};
			break;
			case 'checkbox': break;
			case 'date':
				$scope.minDate = new Date();
				$scope.$watch('required.dt', function(newValue) { 
					if (newValue) $scope.required.value = Math.floor(newValue.getTime() / 1000); 
					console.log('required date -> name: ', $scope.required.name , '/ value: ', $scope.required.value, '/ dt: ', newValue);
				});
			break;
			case 'text': break;
			case 'email': break;
			case 'link': break;
		}
		
		$scope.requiredSave = function(elm, required) { 
			ClearFn.requiredSave(elm, required);
			console.log('required: ', required, required.name); 
		}
		
		$scope.requiredClose = function() {
			$modalInstance.close();
		}
		 
		$scope.requiredCancel = function () {
			$modalInstance.dismiss('cancel');
		}
		
		$scope.go = ClearFn.go;
		
	}])
	
	.controller('InspectionReportCtrl', ['$scope', '$filter', '$routeParams', '$modal', 'E2', 'E1', function($scope, $filter, $routeParams, $modal, E2, E1) {
		$scope.loaded = false;
		E2.get({'format': 'documents', 'type': 'ir', 'id': $routeParams.id}, function(doc) {
			for(var i in doc.boxes) {
				var box = doc.boxes[i]; 
				for (var j in box.items) {
					var item = box.items[j];
					if (item.image) {
						item.image.urlResource = "/index_rest.php/api/clear/v1/file/" + item.image.url; 
						item.image.thumbResource = "/index_rest.php/api/clear/v1/file/" + item.image.thumb;
//						E1.get({'type': 'file', 'id': item.image.url}, function(img) {
//						});
					}
				}
				box.itemsGroupBy4 = $filter('groupBy')(box.items, 4);
			}
			$scope.doc = doc;
			$scope.loaded = true;
		});
		// /index_rest.php/api/clear/v1/file/301512686"
	}])
	
	.controller('StaticInspectionReportCtrl', ['$scope', '$filter', '$modal', 'IR', function($scope, $filter, $modal, IR) {
		$scope.loaded = false;
		$scope.doc = IR.get(function(doc) {
			for(var i in doc.boxes) {
				var box = doc.boxes[i]; 
				for (var j in box.items) {
					var item = box.items[j];
					if (item.image) {
						item.image.urlResource = "img/" + item.image.url;
						item.image.thumbResource = "img/" + item.image.thumb;
					}
				}
				box.itemsGroupBy4 = $filter('groupBy')(box.items, 4);
			}
			$scope.loaded = true;
		});
		$scope.open = function (item) {            
			var modalInstance = $modal.open({
				templateUrl: 'partials/tplModalIrImg.html',
				controller: 'TplModalIrImgCtrl',
				resolve: {
				  item: function () {
					return item;
				  }
				}
			});
			modalInstance.result.then(function (selectedItem) {
				$scope.selected = selectedItem;
			}, function () {
//                $log.info('Modal dismissed at: ' + new Date());
			});
		};
	}])
	
	
	.controller('TplModalIrImgCtrl', ['$scope', '$modalInstance', 'item', function ($scope, $modalInstance, item) {	
		console.log('item: ', item); 
		$scope.item = item; 
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}])
	
	.controller('NonConformityReportCtrl', ['$scope', '$routeParams', 'E2', '$modal', function($scope, $routeParams, E2, $modal) {
		$scope.loaded = false;
		E2.get({'format': 'documents', 'type': 'ncr', 'id': $routeParams.id}, function(doc) {
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
	
	.controller('StaticNonConformityReportCtrl', ['$location', '$scope', 'NCR', '$modal', function($location, $scope, NCR, $modal) {
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
			doc.$save({'type': 'ncr', 'id': doc.id, 'update':type}, function(p, response) {});
			$modalInstance.close();
		};
		
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}])
	
	.controller('ProofOfDeliveryCtrl', ['$scope', '$routeParams', 'ClearFn', 'E2', function($scope, $routeParams, ClearFn, E2) {
		$scope.loaded = false;
		E2.get({'format': 'documents', 'type': 'pod', 'id': $routeParams.id}, function(doc) {
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
		
		$scope.listElementsLoad = function (listUrl) {
			elements = Elms.query(function(datas){ 
					for (j=datas.length-1;j>=0;j--) {
						if (datas[j].type === listUrl.type) {
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
			"processing": true 
				
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
	
	.controller('GuidelinesDetailCtrl', ['$scope', '$location', '$anchorScroll', '$timeout', '$routeParams', 'GuidelinesWeb', 'GuidelinesMobile', function($scope, $location, $anchorScroll, $timeout, $routeParams, GuidelinesWeb, GuidelinesMobile) {
		
		$scope.types = ["order", "shipment", "box", "item"];
		var resource; 
		
		if ($routeParams.id === 'web') resource = GuidelinesWeb; 
		if ($routeParams.id === 'mobile') resource = GuidelinesMobile; 
		
		resource.get(function(elm) {
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
	
	.controller('News', ['$scope', function($scope) {
	}]);




