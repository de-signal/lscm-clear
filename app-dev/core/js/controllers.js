'use strict';

/* Controllers */

angular.module('clearApp.controllers', [])

	.controller('MainCtrl', ['$scope', '$route', 'toaster', '$cookieStore', 'authService', '$http', '$q', 'E1', 'ClearToken', function ($scope, $route, toaster, $cookieStore, authService, $http, $q, E1, ClearToken) {
		
		var token; 
		$scope.menu = {
			"sub": {}, 
			"current": ""
		};
		var sectionCurrent; 
		
		$scope.$on('loginAuto', function(event, data) { 
			$scope.login(); 
		});
		
		$scope.$on('event:sectionUpdate', function(event, section) { 
			sectionCurrent = section; 
			$scope.menu.sub.height = ($scope.menu.sub.visible && section != 'sans') ? true : false;
			$scope.menu.current = $scope.menu.sub.visible ? section : $scope.menu.current; 
		});
		
		if ($cookieStore.get("token")) {
			token = $cookieStore.get("token"); 
			ClearToken.updateToken(token.replace('OAuth ',''));
			$http.defaults.headers.common['Authorization'] = token;
			$scope.loggedIn=true;
			console.log('connect from cookie: ', $http.defaults.headers.common);
			E1.get({'type': 'user'}, function(user) { 
				$scope.user = user;
				menusetup(user); 
			});
		} 

		$scope.login = function() {
			$cookieStore.remove("token");
			$http.post('../oauth/oauth.php', {ignoreAuthModule: true, login: $scope.username, password: $scope.password})
				.success(function(data, status, headers, config) {
					ClearToken.updateToken(data.access_token);
					token = 'OAuth '+ data.access_token;
					if($scope.remember) {
						$cookieStore.put("token", token);
					} 
					$http.defaults.headers.common['Authorization'] = token;
					console.log('connect from form: ', $http.defaults.headers.common);
					E1.get({'type': 'user'}, function(user) {
						var httpConfig = function(req) {
							req.headers.Authorization = token;
							return req;
						};
						var userName = user.first_name + ' ' + user.last_name;
						toaster.pop('success', 'Welcome', userName);
						$scope.user = user;
						authService.loginConfirmed(userName, httpConfig);
						menusetup(user); 
					});
				})
				.error(function(data, status, headers, config) {
					toaster.pop('error', 'Error', headers("X-clear-login"));
				});
			}
		
		$scope.logout = function () {
			$http.post('../oauth/oauth.php', {action: 'logout', token: token})
				.success(function(data, status, headers, config) {
					$cookieStore.remove("token");
					delete $http.defaults.headers.common['Authorization'];
					$route.reload();
					console.log('logout: ', $http.defaults.headers.common);
					toaster.pop('success', 'Logged out');
				})
				.error(function(data, status, headers, config) {
					console.log('status error :', status, ' / logout failed');
				});
			}
		
		var menusetup = function(user) {
			$scope.sections = user.sections;
			var sectionsVisible = 0; 
			for (var i in $scope.sections) {
				if ($scope.sections[i]) {
					sectionsVisible++
					$scope.menu.current = i; 
				}
			}
			$scope.menu.sub.visible = (sectionsVisible > 1) ? true : false; 
			$scope.$emit("event:sectionUpdate", sectionCurrent);
		}	
			
	}])
	
	.controller('UserDetailCtrl', ['$scope', 'E1', function($scope, E1) {
		
		$scope.$emit("event:sectionUpdate", "sans");
		
		E1.get({'type': 'user'}, function(user) { 
			$scope.user = user;
		});
	}])
	
	.controller('DashboardCtrl', ['$scope', '$location', 'E1', function($scope, $location, E1) {
		
		$scope.$emit("event:sectionUpdate", "sans");
		
		if ($scope.menu.current === 'transport') {
			$location.path('/transport/dashboard'); 
		} else if ($scope.menu.current === 'stock') {
			$location.path('/stock/warehouse'); 
		}
		
		E1.get({'type': 'user'}, function(user) { 
			$scope.user = user;
		});
	}])
	
	.controller('ListCtrl', ['$scope', 'Utils', 'ClearUrl', 'TransportElement', 'ClearList', function($scope, Utils, ClearUrl, TransportElement, ClearList) {
	
		var list = {}; 
		
		$scope.listInit = function(id) {
			$scope.loaded = false;  
			list.id = id; 
			$scope.$on('event:listReady_' + list.id, function(event, conf) {
				list.conf = conf; 
				$scope.listQuery({});
			});
			ClearUrl.listReady('id', list);
		}
		
		$scope.listQuery = function(urlParams) {
			$scope.loaded = false;
			ClearList.listCleanUrl(urlParams); 
			ClearUrl.listsUrlSet(urlParams, list.conf);
			$scope.listLoad(list.conf);
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
			ClearList.listElementsLoad(listConfig).then( function(list) {
				$scope.list = list;
				if(listConfig.type ==='shipment' || listConfig.type ==='shipmentIn' || listConfig.type ==='shipmentOut') {
					$scope.listShipment = true; 
				}
				$scope.loaded = true;
			});
		}
		
		$scope.listFiltersLoad = function(listConfig) {
			ClearList.listFiltersLoad(listConfig).then( function(filters) {
				$scope.filters = filters;
				$scope.filters.tmp.ModificationsOpen = false; 
				$scope.filters.tmp.ids = [];
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
			TransportElement.propertySave(elm, property, groupName);
		}
		
		$scope.listPaginate = function (page) {
			$scope.list.urlParams.page = page;
			$scope.listQuery($scope.list.urlParams, $scope.list.id);; 
		}

		$scope.badgeRemove = function(badge) {
			ClearList.listBadgeRemove(badge, $scope.list.urlParams, $scope.list.filters); 
			$scope.listQuery($scope.list.urlParams, $scope.list.id);; 
		}

		$scope.calOpen = function($event, param) {
			$event.preventDefault();
			$event.stopPropagation();
			$scope.filters.date[param].opened = true;
		}
		
		$scope.selectAll = function() {
			var elms = $scope.list.elements; 
			$scope.filters.tmp.ids = [];
			for (var i in elms) {
				if (!isNaN(i)) {
					$scope.filters.tmp.ids.push(elms[i].id);
				}
			}
			if ($scope.list.pagination.pagesCount > 1) {
				$scope.filters.tmp.selectGlobalBtn = true; 
			}
		}
		
		$scope.selectNone = function() {
			var elms = $scope.list.elements; 
			$scope.filters.tmp.ids = [];
			$scope.selectGlobalOff();
		}
		
		$scope.selectInverse = function() {
			var elms = $scope.list.elements; 
			for (var i in elms) {
				$scope.selectToggle(elms[i].id);
			}
			$scope.selectGlobalOff();
		}
		
		$scope.selectToggle = function (id) {
			console.log('id: ', id); 
			var idx = $scope.filters.tmp.ids.indexOf(id);
			if (idx > -1) { // is currently selected
				$scope.filters.tmp.ids.splice(idx, 1);
			} else { // is newly selected
				$scope.filters.tmp.ids.push(id);
			}
			$scope.selectGlobalOff(); 
		};
		
		$scope.selectGlobalOn = function() {
			$scope.filters.tmp.selectGlobal = true;
			$scope.filters.tmp.selectGlobalConfirm = true;
			$scope.filters.tmp.selectGlobalBtn = false;
		}
		
		$scope.selectGlobalOff = function() {
			$scope.filters.tmp.selectGlobalBtn = false;
			$scope.filters.tmp.selectGlobalConfirm = false;
		}
		  
		$scope.listPropertySave = function () {
			ClearList.listPropertySave($scope.list, $scope.filters.tmp.ids, $scope.filters.tmp.propertyUpdate, $scope.filters.tmp.selectGlobal, $scope.list.urlParams);
			$scope.selectGlobalOff(); 
			$scope.filters.tmp.ModificationsOpen = false; 
			$scope.filters.tmp.ids = [];
			$scope.filters.tmp.propertyUpdate = {};
		}
		
		$scope.stopPropagation = function($event) {
			if ($event.stopPropagation) $event.stopPropagation();
		}
		
		$scope.dateToTimestamp = Utils.dateToTimestamp;
		$scope.modalCondition = TransportElement.modalCondition; 
		$scope.trackingToggle = TransportElement.trackingToggle;
		$scope.go = ClearUrl.go;
		$scope.loaded = false;
		
		$scope.$on('event:ListInit', function(event, id) {
			$scope.listInit(id); 
		});
	}])

	.controller('GuidelinesCtrl', ['$scope', function($scope) {
		
	}])
	
	;




