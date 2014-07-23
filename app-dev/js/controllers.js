'use strict';

/* Controllers */

angular.module('clearApp.controllers', [])

	.controller('UserCtrl', ['$scope', '$route', 'toaster', '$cookieStore', 'authService', '$http', 'E1', 'ClearToken',  
		function ($scope, $route, toaster, $cookieStore, authService, $http, E1, ClearToken) {
		var token;

		if ($cookieStore.get("token")) {
			token = $cookieStore.get("token"); 
			ClearToken.updateToken(token.replace('OAuth ',''));
			$http.defaults.headers.common['Authorization'] = token;
			$scope.loggedIn=true;
			console.log('connect from cookie: ', $http.defaults.headers.common);
			E1.get({'type': 'user'}, function(user) { 
				$scope.user = user;
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
						var userName = user.first_name + ' ' + user.name;
						toaster.pop('success', 'Welcome', userName);
						$scope.user = user;
						authService.loginConfirmed(userName, httpConfig);
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
	}])
	
	.controller('UserDetailCtrl', ['$scope', 'E1', function($scope, E1) {
		E1.get({'type': 'user'}, function(user) { 
			$scope.user = user;
		});
	}])
	
	.controller('ListCtrl', ['$scope', 'Utils', 'ClearUrl', 'ClearElement', 'ClearList', function($scope, Utils, ClearUrl, ClearElement, ClearList) {
		
		$scope.listInit = function(listId) {
			$scope.loaded = false; 
			$scope.$on('event:listLoad_' + listId, function(event, listConfig) {
				$scope.listLoad(listConfig);
			});
			$scope.$on('event:listReady_' + listId, function(event, listId) {
				$scope.listQuery({}, listId);
			});
			ClearUrl.listsReady(listId);
		}
		
		$scope.listQuery = function(urlParams, listId) {
			ClearList.listCleanUrl(urlParams); 
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
			ClearElement.propertySave(elm, property, groupName);
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
		$scope.modalCondition = ClearElement.modalCondition; 
		$scope.trackingToggle = ClearElement.trackingToggle;
		$scope.go = ClearElement.go;
		$scope.loaded = false;
		
		$scope.$on('event:ListInit', function(event, listId) {
			$scope.listInit(listId); 
		});
	}])
	
	.controller('DashboardCtrl', ['$location', '$scope', '$timeout', '$routeParams', 'E1', 'ClearUrl', 'Utils', 'GlobalReports', function($location, $scope, $timeout, $routeParams, E1, ClearUrl, Utils, GlobalReports) {
		
		ClearUrl.listsReady('init');
		
		$scope.listsConfig = [{ 
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
		}];
		
		if ($routeParams.static) {
			$scope.listsConfig[0].resource = "5";
			var r = GlobalReports; 
			var p = {}; 
		} else {
			$scope.listsConfig[0].resource = "1"; 
			var r = E1;
			var p = {'type': 'report'};  
		} 
		
		$timeout(function() {
			$scope.$broadcast('event:ListInit', $scope.listsConfig[0].id);
			ClearUrl.listsReady('parent');
		});
		 
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			$scope.$broadcast('event:listLoad_' + $scope.listsConfig[0].id, ClearUrl.listsUrlSet(urlParams, $scope.listsConfig[0]));
		});
		
		r.query(p, function(docs){
			$scope.reports = docs;
		});
	}])
	
	.controller('DashboardTvCtrl', ['$interval', '$rootScope', '$routeParams', '$scope', 'E1', 'E2', 'Alerts', 'Dashboard', 'ClearUrl', function($interval, $rootScope, $routeParams, $scope, E1, E2, Alerts, Dashboard, ClearUrl) {
		$scope.loaded = false;
		$rootScope.tvScreen = true;
		
		if ($routeParams.static) {
			var rShipments = Dashboard; 
			var pShipments = {}; 
			var rAlerts = Alerts;
			var pAlerts = {}; 
		} else {
			var rShipments = E1;
			var pShipments = {'type': 'dashboard', "sortBy": "status", "sortOrder": "ASC", "limit": 12 };
			var rAlerts = E2;
			var pAlerts = {'type': 'alert', "sortBy": "status", "sortOrder": "ASC", "limit": 12, "active": true }; 
		} 
		
		var listElementsLoad = function() {
			rShipments.query(pShipments, function(list) {
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
		
		var alertsQty;
		var next;
		$scope.alertCurrent = 1;
		
		var alertsUpdate = function() {
			rAlerts.query(pAlerts, function(alerts) {
				alertsQty = alerts.length; 
				for (var i = 0; i < alertsQty; i++) {
					alerts[i].index = i+1;
				}
				$scope.alerts = alerts;
			});
			
			if ($scope.alertCurrent < alertsQty) {
				next = $scope.alertCurrent+1;
			} else {
				next = 1;
			}
			$scope.alertCurrent = 0;
			$interval(function() { $scope.alertCurrent= next}, 3000, 1);
		}
		alertsUpdate(); 
		$interval(alertsUpdate, 9000);
	}])
	
	.controller('ElementsOrderAddCtrl', [ '$timeout', '$scope', function($timeout, $scope) {
		$scope.buttonDisable = function () {
			$timeout(function() {
				$scope.buttonDisabled = true;
			}, 10);
		}
	}])
	
	.controller('ElementsTrackingCtrl', ['$scope', '$location', '$routeParams', 'Utils', 'ClearUrl', 'ElmsListsConfig', function($scope, $location, $routeParams, Utils, ClearUrl, ElmsListsConfig){
		
		ClearUrl.listsReady('init'); 
		
		$scope.types = [	
			{"name": "Orders", "type": "order", "url": "O" }, 
			{"name": "Shipments", "type": "shipment", "url": "S" }, 
			{"name": "Boxes", "type": "box", "url": "B"  }, 
			{"name": "Items", "type": "item", "url": "I"  }
		];		
		
		$scope.listsConfig = [];
		ElmsListsConfig.get( function(config) {	
			for (var i in $scope.types) {
				$scope.listsConfig[i] = Utils.clone(config); 
				$scope.listsConfig[i].type = $scope.types[i].type;
				$scope.listsConfig[i].id = $scope.types[i].type;
				$scope.listsConfig[i].name = $scope.types[i].name;
				$scope.listsConfig[i].listCode = $scope.types[i].url; 
				$scope.listsConfig[i].display.modifications = true; 
				if ($routeParams.static) {
					switch ($scope.types[i].type) {
						case 'order': $scope.listsConfig[i].resource = '10'; break;
						case 'shipment': $scope.listsConfig[i].resource = '11'; break;
						case 'box': $scope.listsConfig[i].resource = '12'; break;
						case 'item': $scope.listsConfig[i].resource = '13'; break;
					}
				} else {
					$scope.listsConfig[i].resource = '2'; 
				}
			}
			ClearUrl.listsReady('parent'); 
		});
		
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			var typeIndex = Utils.objectIndexbyKey($scope.types, 'type', listId); 
			$scope.$broadcast('event:listLoad_' + listId, ClearUrl.listsUrlSet(urlParams, $scope.listsConfig[typeIndex])); 
		});
	}])
	
	.controller('ElementCtrl', ['$scope', '$routeParams', '$location', '$interval', '$timeout', '$anchorScroll', '$modal', 'E2', 'Utils', 'ClearUrl', 'ClearElement', 'ElmsListsConfig', 'Elm', function($scope, $routeParams, $location, $interval, $timeout, $anchorScroll, $modal, E2, Utils, ClearUrl, ClearElement, ElmsListsConfig, Elm) {
		
		$scope.loaded = false;
		$scope.relatedActiveTab = {};
		ClearUrl.listsReady('init');
		
		$scope.modalCondition = ClearElement.modalCondition; 
		$scope.modalDelete = ClearElement.modalDelete; 
		$scope.trackingToggle = ClearElement.trackingToggle;
		$scope.propertySave = function(elm, property, groupName) {
			ClearElement.propertySave(elm, property, groupName);
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
		
		$scope.modalAlert = ClearElement.modalAlert; 
		$scope.modalAlertDelete = ClearElement.modalAlertDelete;
		
		if ($routeParams.id === 'static') {
			var r = Elm; 
			var p = {}; 
		} else {
			var r = E2; 
			var p = {'format': 'elements', 'type': $routeParams.type, "id": $routeParams.id }; 
		}
		
		r.get(p, function(elm) {
			elm.anim = true; 
			elm = ClearElement.elementUpdate(elm);
			
			$scope.elm = elm;
			
			if (elm.timeline) {
				var timelineAnim = function(i) {
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
			ElmsListsConfig.get(function(config) {
				for (var i in elm.related) {
					$scope.listsConfig[i] = Utils.clone(config);
					$scope.listsConfig[i].related = elm.type; 
					$scope.listsConfig[i].related_id = elm.id; 
					$scope.listsConfig[i].type = elm.related[i].type;
					$scope.listsConfig[i].id = elm.related[i].type;
					$scope.listsConfig[i].name = elm.related[i].name;
					switch (elm.related[i].type) {
						case 'order': $scope.listsConfig[i].listCode = 'O'; break;
						case 'shipment': $scope.listsConfig[i].listCode = 'S'; break;
						case 'box': $scope.listsConfig[i].listCode = 'B'; break;
						case 'item': $scope.listsConfig[i].listCode = 'I'; break;
					}
					if ($routeParams.id === 'static') {
						switch (elm.related[i].type) {
							case 'order': $scope.listsConfig[i].resource = '10'; break;
							case 'shipment': $scope.listsConfig[i].resource = '11'; break;
							case 'box': $scope.listsConfig[i].resource = '12'; break;
							case 'item': $scope.listsConfig[i].resource = '13'; break;
						}
					} else {
						$scope.listsConfig[i].resource = '2'; 
					}
				}
				ClearUrl.listsReady('parent'); 
			}); 
			$scope.$on('event:urlSet', function(event, urlParams, listId) {
				var typeIndex = Utils.objectIndexbyKey($scope.elm.related, 'type', listId); 
				$scope.$broadcast('event:listLoad_' + listId, ClearUrl.listsUrlSet(urlParams, $scope.listsConfig[typeIndex]));
			});
			
			$scope.modalDocumentUpload = ClearElement.modalDocumentUpload; 
			
			$scope.loaded = true;
		});	
	}])
	
	.controller('ElementsSearchCtrl', ['$scope', '$location', 'ClearUrl', 'Utils', 'ElmsListsConfig', function($scope, $location, ClearUrl, Utils, ElmsListsConfig) {
		
		ClearUrl.listsReady('init');
		
		$scope.urlSet = function(urlParams, listId) {
			var type = urlParams.type || $location.search().type;
			if (type) {
				$scope.listsConfig[0].type = type;
				$scope.listsConfig[0].name = $scope.types[Utils.objectIndexbyKey($scope.types, "type", type)].name;  
				var listConfig = ClearUrl.listsUrlSet(urlParams, $scope.listsConfig[0]); 
				$scope.$broadcast('event:listLoad_' + listId, listConfig);
				$scope.urlPage = listConfig.urlParams;
				$scope.listShow=true;				
			} else {
				$scope.urlPage = {}; 
				$scope.listShow=false;
			}
		} 
		
		$scope.types=[	
			{"name": "Orders", "type": "order" }, 
			{"name": "Shipments in", "type": "shipmentIn" }, 
			{"name": "Shipments out", "type": "shipmentOut" }, 
			{"name": "Boxes", "type": "box" }, 
			{"name": "Items", "type": "item" }
		];		
		
		$scope.listsConfig = [];
		ElmsListsConfig.get( function(config) {
			$scope.listsConfig[0] = config; 
			$scope.listsConfig[0].id = "searchResult";
			$scope.listsConfig[0].resource = '2'; 
			$scope.$broadcast('event:ListInit', $scope.listsConfig[0].id);
			ClearUrl.listsReady('parent'); 
		}); 
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			$scope.urlSet(urlParams, listId);
		});
	}])
		
	.controller('ElementsCtrl', ['$scope', '$routeParams', 'ClearUrl', 'Utils', 'ElmsListsConfig', function($scope, $routeParams, ClearUrl, Utils, ElmsListsConfig) {
		
		ClearUrl.listsReady('init');
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
			$scope.listsConfig[0].name = $scope.name;  
			$scope.listsConfig[0].id = "elements";
			$scope.listsConfig[0].resource = '2'; 
			$scope.$broadcast('event:ListInit', $scope.listsConfig[0].id);
			ClearUrl.listsReady('parent'); 
		}); 
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			$scope.$broadcast('event:listLoad_' + listId, ClearUrl.listsUrlSet(urlParams, $scope.listsConfig[0]));
		});
	}])
	
	.controller('ElementModalDocumentUploadCtrl', ['$scope', '$upload', 'ClearElement', 'E2', '$modalInstance', 'elm', 'user', function ($scope, $upload, ClearDocument, E2, $modalInstance, elm, user) {
		$scope.doc = {}; 
		
		$scope.onFileSelect = function($files) {
			for (var i = 0; i < $files.length; i++) {
				var file = $files[i];
				$scope.upload = $upload.upload({
					url: '/index_rest.php/api/clear/v2/elements/' + elm.type + '/' + elm.id + '?documentUpload=file',
//				    	    data: {myObj: $scope.myModelObj},
					file: file,
				}).progress(function(evt) {
					$scope.progressShow = true; 
					$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
				}).success(function(data, status, headers, config) {
					$scope.doc.value = "fileUpload"; 
					$scope.doc.id = data.id; 
					console.log("upload success: ", data);
				}).error(function(error) {
					console.log("upload error: ", error);
				});
					//.error(...)
					//.then(success, error, progress); 
				}
				// $scope.upload = $upload.upload({...}) alternative way of uploading, sends the the file content directly with the same content-type of the file. Could be used to upload files to CouchDB, imgur, etc... for HTML5 FileReader browsers. 
			};		
		$scope.documentUploadSave = function(doc) {
			ClearDocument.documentUploadSave(doc, elm, user);
		}
		$scope.documentUploadClose = function() {
			$modalInstance.close();
		}
		 
		$scope.documentUploadCancel = function () {
			$modalInstance.dismiss('cancel');
		}
	}])
		
	.controller('ElementModalConditionCtrl', ['$scope', '$upload', 'ClearElement', '$modalInstance', 'condition', 'elm', function ($scope, $upload, ClearElement, $modalInstance, condition, elm) {
		$scope.condition = condition;
		$scope.elm = elm;
		console.log('elm: ', elm, '/ elm.name: ', elm.name, '/ condition: ', condition);
		switch (condition.type) {
			case 'upload': 
				var documentsUploaded = []; 
				$scope.updateMethod = {}; 
				
				for (var i in elm.documents) {
					if (elm.documents[i].origin === "upload") documentsUploaded.push(elm.documents[i]); 
				}
				
				if (documentsUploaded.length > 0) { 
					$scope.updateMethod.chooser = true; 
					$scope.updateMethod.documents = documentsUploaded; 
				} else {
					$scope.updateMethod.type = 'upload'; 
				}
				
				$scope.onFileSelect = function($files) {
					for (var i = 0; i < $files.length; i++) {
						var file = $files[i];
						$scope.upload = $upload.upload({
							url: '/index_rest.php/api/clear/v2/elements/'+ elm.type + '/' + elm.id + '?condition=' + condition.id,
//				    	    data: {myObj: $scope.myModelObj},
							file: file,
						}).progress(function(evt) {
							$scope.progressShow = true; 
							$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
						}).success(function(data, status, headers, config) {
							$scope.condition.value = "fileUpload"; 
							console.log(data);
						});
							//.error(...)
							//.then(success, error, progress); 
						}
						// $scope.upload = $upload.upload({...}) alternative way of uploading, sends the the file content directly with the same content-type of the file. Could be used to upload files to CouchDB, imgur, etc... for HTML5 FileReader browsers. 
					};
				
			break;
			case 'checkbox': break;
			case 'date':
				$scope.minDate = new Date();
				$scope.$watch('condition.dt', function(newValue) { 
					if (newValue) $scope.condition.value = Math.floor(newValue.getTime() / 1000); 
					console.log('condition date -> name: ', $scope.condition.name , '/ value: ', $scope.condition.value, '/ dt: ', newValue);
				});
			break;
			case 'text': break;
			case 'email': break;
			case 'link': break;
		}
		
		$scope.conditionSave = function(elm, condition) { 
			ClearElement.conditionSave(elm, condition);
			console.log('condition: ', condition, condition.name); 
		}
		
		$scope.conditionClose = function() {
			$modalInstance.close();
		}
		 
		$scope.conditionCancel = function () {
			$modalInstance.dismiss('cancel');
		}
		
		$scope.go = ClearElement.go;
	}])
	
	.controller('ElementModalDeleteCtrl', ['$scope', '$location', '$modalInstance', 'elm', function ($scope, $location, $modalInstance, elm) {
		$scope.elm = elm;
		
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
	
	.controller('ElementModalAlertCtrl', ['$scope', '$modalInstance', 'Utils', 'ClearElement', 'elm', 'alert', 'user', function ($scope, $modalInstance, Utils, ClearElement, elm, alert, user) {
		
		if (alert.id) { 
			$scope.alert = Utils.clone(alert);
		}
		$scope.statuses = [ "success", "warning", "error" ]; 
		
		$scope.alertSave = function(alert) {
			ClearElement.alertSave(elm, alert, user); 
		}
		
		$scope.modalClose = function() {
			$modalInstance.close();
		}
		 
		$scope.modalCancel = function () {
			$modalInstance.dismiss('cancel');
		}
	}])
	
	.controller('ElementModalAlertDeleteCtrl', ['$scope', '$modalInstance', 'ClearElement', 'elm', 'alert', function ($scope, $modalInstance, ClearElement, elm, alert) {
		
		$scope.alert = alert;
		
		$scope.alertDelete = function(alert) {
			ClearElement.alertDelete(elm, alert); 
		}
		
		$scope.modalClose = function() {
			$modalInstance.close();
		}
		 
		$scope.modalCancel = function () {
			$modalInstance.dismiss('cancel');
		}
	}])
		
	.controller('AlertsCtrl', ['$scope', '$routeParams', 'ClearUrl', 'ClearAlert', 'Utils', 'AlertsConfig', '$modal', function($scope, $routeParams, ClearUrl, ClearAlert, Utils, AlertsConfig, $modal) {
		
		ClearUrl.listsReady('init'); 
		
		$scope.listsConfig = [];
		AlertsConfig.get( function(config) {
			$scope.listsConfig[0] = config; 
			if ($routeParams.static) {
				$scope.listsConfig[0].resource = '30';
			} else { 
				$scope.listsConfig[0].resource = '2'; 
			}
			
			$scope.listsConfig[0].type = 'alert';
			$scope.listsConfig[0].id = "alerts";
			$scope.page= {'name': 'Alerts', 'type': 'alert' };
			$scope.$broadcast('event:ListInit', $scope.listsConfig[0].id);
			ClearUrl.listsReady('parent'); 
		});
		
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			$scope.$broadcast('event:listLoad_' + listId, ClearUrl.listsUrlSet(urlParams, $scope.listsConfig[0]));
		});
		
		$scope.alertModalEdit = ClearAlert.alertModalEdit; 
		$scope.alertModalDelete = ClearAlert.alertModalDelete;
	}])
	
	.controller('AlertModalEditCtrl', ['$scope', '$modalInstance', 'ClearAlert', 'Utils', 'alerts', 'alert', 'user', function ($scope, $modalInstance, ClearAlert, Utils, alerts, alert, user) {
	
		$scope.alert = Utils.clone(alert);
		$scope.statuses = [ "success", "warning", "error" ]; 
		
		$scope.alertSave = function(a) {
			for (var i in a) {
				alert[i] = a[i]; 
			}
			ClearAlert.alertSave(alert, user); 
		}
		
		$scope.modalClose = function() {
			$modalInstance.close();
		}
		 
		$scope.modalCancel = function () {
			$modalInstance.dismiss('cancel');
		}
	}])
	
	.controller('AlertModalDeleteCtrl', ['$scope', '$modalInstance', 'ClearAlert', 'alerts', 'alert', function ($scope, $modalInstance, ClearAlert, alerts, alert) {
		$scope.alert = alert;
		
		$scope.alertDelete = function(a) {
			ClearAlert.alertDelete(a, alerts);
		}
		
		$scope.modalClose = function() {
			$modalInstance.close();
		}
		 
		$scope.modalCancel = function () {
			$modalInstance.dismiss('cancel');
		}
	}])
	
	.controller('DocumentsCtrl', ['$scope', '$routeParams', 'ClearUrl', 'ClearDocument', 'Utils', 'DocumentsConfig', function($scope, $routeParams, ClearUrl, ClearDocument, Utils, DocumentsConfig) {
		
		ClearUrl.listsReady('init'); 
		
		var type = $routeParams.type; 
		
		$scope.listsConfig = [];
		DocumentsConfig.get( function(config) {
			$scope.listsConfig[0] = config; 
			$scope.listsConfig[0].id = "documents";
			$scope.listsConfig[0].type = type;
			$scope.page = { 'type': type }; 
			
			switch (type) {
				case 'ir': $scope.page.name = 'Inspection reports'; break;
				case 'ncr': $scope.page.name = 'Non-conformity reports'; break;
				case 'pod': $scope.page.name = 'Proofs of delivery'; break;
				case 'archive': $scope.page.name = 'Archives'; break;
				case 'media': $scope.page.name = 'Medias'; break;		
			}
			
			if ($routeParams.static) { 
				switch (type) {
					case 'ir': $scope.listsConfig[0].resource = '20'; break;
					case 'pod': $scope.listsConfig[0].resource = '21'; break;
					case 'ncr': $scope.listsConfig[0].resource = '22'; break;
					case 'archive': $scope.listsConfig[0].resource = '23'; break;
					case 'media': $scope.listsConfig[0].resource = '24'; break;
				}
			} else {
				$scope.listsConfig[0].resource = '2'; 
			}
			
			$scope.$broadcast('event:ListInit', $scope.listsConfig[0].id);
			ClearUrl.listsReady('parent'); 
		}); 
		
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			$scope.$broadcast('event:listLoad_' + listId, ClearUrl.listsUrlSet(urlParams, $scope.listsConfig[0]));
		});
		
		$scope.documentModalUpload = ClearDocument.documentModalUpload; 
		
	}])
	
	.controller('DocumentModalUploadCtrl', ['$scope', '$upload', 'ClearDocument', 'E2', '$modalInstance', 'type', 'user', function ($scope, $upload, ClearDocument, E2, $modalInstance, type, user) {
		$scope.type = type;
		$scope.doc = new E2({});
		
		$scope.onFileSelect = function($files) {
			for (var i = 0; i < $files.length; i++) {
				var file = $files[i];
				$scope.upload = $upload.upload({
					url: '/index_rest.php/api/clear/v2/documents/'+ type + '?documentUpload=file',
//				    	    data: {myObj: $scope.myModelObj},
					file: file,
				}).progress(function(evt) {
					$scope.progressShow = true; 
					$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
					console.log("upload progress: ", evt);
				}).success(function(data, status, headers, config) {
					$scope.doc.value = "documentUpload"; 
					$scope.doc.id = data.id; 
					console.log("upload success: ", data);
				}).error(function(error) {
					console.log("upload error: ", error);
				})	
					//.then(success, error, progress); 
				}
				// $scope.upload = $upload.upload({...}) alternative way of uploading, sends the the file content directly with the same content-type of the file. Could be used to upload files to CouchDB, imgur, etc... for HTML5 FileReader browsers. 
			};		
		$scope.documentUploadSave = function(doc) {
			ClearDocument.documentUploadSave(doc, type, user);
		}
		$scope.documentUploadClose = function() {
			$modalInstance.close();
		}
		 
		$scope.documentUploadCancel = function () {
			$modalInstance.dismiss('cancel');
		}
	}])
	
	.controller('IndicatorsCtrl', ['$scope', '$routeParams', 'E1', 'Indicators', 'ChartsConfig', function($scope, $routeParams, E1, Indicators, ChartsConfig) {
		$scope.loaded = false;
		$scope.charts = [];
		if ($routeParams.static) {
			var r = Indicators; 
			var p = {}; 		
		} else {
			var r = E1; 
			var p = {'type': 'kpi'}; 
		} 	
		
		r.query(p, function(charts){
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
	
	.controller('DocumentsIrCtrl', ['$scope', '$filter', '$routeParams', '$modal', 'E2', 'IR', 'ClearToken', function($scope, $filter, $routeParams, $modal, E2, IR, ClearToken) {
		$scope.loaded = false;
		
		if ($routeParams.id === 'static') {
			var r = IR; 
			var p = {}; 
			var imgUrl = "img/"; 
			var imgToken = ''; 
		} else {
			var r = E2; 
			var p = {'format': 'documents', 'type': 'ir', 'id': $routeParams.id}; 
			var imgUrl = "/index_rest.php/api/clear/v1/file/"; 
			var imgToken = '?oauth_token=' + ClearToken.returnToken(); 
		}
		
		r.get(p, function(doc) {
			for(var i in doc.boxes) {
				var box = doc.boxes[i]; 
				for (var j in box.items) {
					var item = box.items[j];
					if (item.image) {
						item.image.urlResource =  imgUrl + item.image.url + imgToken; 
						item.image.thumbResource = imgUrl + item.image.thumb + imgToken;
					}
				}
				box.itemsGroupBy4 = $filter('groupBy')(box.items, 4);
			}
			$scope.doc = doc;
			$scope.loaded = true;
		});
		$scope.open = function (item) {            
			var modalInstance = $modal.open({
				templateUrl: 'partials/document-ir-modal-img.html',
				controller: 'DocumentIrModalImgCtrl',
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
	
	.controller('DocumentIrModalImgCtrl', ['$scope', '$modalInstance', 'item', function ($scope, $modalInstance, item) {	 
		$scope.item = item; 
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}])
	
	.controller('DocumentNcrCtrl', ['$scope', '$routeParams', 'E2', 'NCR', '$modal', 'ClearToken', function($scope, $routeParams, E2, NCR, $modal, ClearToken) {
		$scope.loaded = false;
		
		if ($routeParams.id === 'static') {
			var r = NCR; 
			var p = {}; 
			var imgUrl = "img/"; 
			var imgToken = ''; 
		} else {
			var r = E2; 
			var p = {'format': 'documents', 'type': 'ncr', 'id': $routeParams.id}; 
			var imgUrl = "/index_rest.php/api/clear/v1/file/"; 
			var imgToken = '?oauth_token=' + ClearToken.returnToken(); 
		}
		
		r.get(p, function(doc) {
			doc.element.image.url = doc.element.image.url + imgToken;
			$scope.doc = doc;
			$scope.loaded = true;
		});
		$scope.open = function (doc, user, type) {            
			if (doc.status != 'closed') {
				var modalInstance = $modal.open({
					templateUrl: 'partials/document-ncr-modal-msg.html',
					controller: 'DocumentNcrModalMsgCtrl',
					resolve: {
					  doc: function () {
						return doc;
					  },
					  user: function () {
					  	return user;
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
	
	.controller('DocumentNcrModalMsgCtrl', ['$scope', '$modalInstance', 'doc', 'user', 'type', function ($scope, $modalInstance, doc, user, type) {
		$scope.comment = {};
		if (type=='open') $scope.title = 'Add a comment'; 
		else $scope.title = 'Close report'; 
		
		$scope.saveNcrMessage = function () {
			var now = new Date();
			var comment_date = Math.floor(now.getTime() / 1000);
			var comment_message = $scope.comment.message;
			var comment_user = { "first_name": user.first_name, "last_name": user.last_name, "id": user.id }; 
			
			doc.comments.push({ "date": comment_date, "status": type, "message": comment_message, "user": comment_user }); 
			doc.$save({'type': 'ncr', 'id': doc.id, 'update':type, 'format': 'documents' }, function(p, response) {});
			$modalInstance.close();
		};
		
		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	}])
	
	.controller('DocumentsPodCtrl', ['$scope', '$routeParams', 'ClearToken', 'E2', 'POD', function($scope, $routeParams, ClearToken, E2, POD) {
		$scope.loaded = false;
		
		if ($routeParams.id === 'static') {
			var r = POD; 
			var p = {}; 
			var imgUrl = "img/"; 
			var imgToken = ''; 
		} else {
			var r = E2; 
			var p = {'format': 'documents', 'type': 'pod', 'id': $routeParams.id}; 
			var imgUrl = "/index_rest.php/api/clear/v1/file/"; 
			var imgToken = '?oauth_token=' + ClearToken.returnToken(); 
		}
		
		r.get(p, function(doc) {
			doc.signature.image.url = doc.signature.image.url + imgToken;
			$scope.doc = doc;
			$scope.loaded = true;
		});
	}])
	
	.controller('WarehousesCtrl', ['$scope', '$routeParams', 'ClearUrl', 'ClearAlert', 'Utils', 'AlertsConfig', '$modal', function($scope, $routeParams, ClearUrl, ClearAlert, Utils, AlertsConfig, $modal) {
		
		ClearUrl.listsReady('init'); 
		
		$scope.listsConfig = [];
		AlertsConfig.get( function(config) {
			$scope.listsConfig[0] = config; 
			if ($routeParams.static) {
				$scope.listsConfig[0].resource = '30';
			} else { 
				$scope.listsConfig[0].resource = '2'; 
			}
			
			$scope.listsConfig[0].type = 'alert';
			$scope.listsConfig[0].id = "alerts";
			$scope.page= {'name': 'Alerts', 'type': 'alert' };
			$scope.$broadcast('event:ListInit', $scope.listsConfig[0].id);
			ClearUrl.listsReady('parent'); 
		});
		
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			$scope.$broadcast('event:listLoad_' + listId, ClearUrl.listsUrlSet(urlParams, $scope.listsConfig[0]));
		});
		
		$scope.alertModalEdit = ClearAlert.alertModalEdit; 
		$scope.alertModalDelete = ClearAlert.alertModalDelete;
	}])
	
	.controller('GuidelinesListCtrl', ['$scope', 'GuidelinesProcess', 'GuidelinesWeb', 'GuidelinesMobile', function($scope, GuidelinesProcess, GuidelinesWeb, GuidelinesMobile) {
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
	
	.controller('GuidelinesOperationsCtrl', ['$scope', '$location', '$anchorScroll', '$timeout', '$routeParams', 'GuidelinesWeb', 'GuidelinesMobile', function($scope, $location, $anchorScroll, $timeout, $routeParams, GuidelinesWeb, GuidelinesMobile) {
		
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
			$anchorScroll();
		}
	}])
	
	.controller('BugsCtrl', ['$scope', 'Bugs', function($scope, Bugs) {
		Bugs.query( function(bugs) { 
			$scope.bugs = bugs;
		});
	}]);




