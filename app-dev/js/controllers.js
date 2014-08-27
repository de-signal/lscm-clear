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
		
		$scope.$on('event:ListInit', function(event, id) {
			$scope.listInit(id); 
		});
	}])
	
	.controller('DashboardCtrl', ['$location', '$scope', '$timeout', '$routeParams', 'E1', 'ClearUrl', 'Utils', 'GlobalReports', function($location, $scope, $timeout, $routeParams, E1, ClearUrl, Utils, GlobalReports) {
		
		ClearUrl.listReady('init', ['dashboard']);
		
		var listConf = { 
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
		};
		
		listConf.resource = ($routeParams.static) ? "5" : "1";
		
		$timeout(function() {
			$scope.$broadcast('event:ListInit', listConf.id);
			ClearUrl.listReady('conf', listConf);
		});
		
		if ($routeParams.static) {
			var r = GlobalReports; 
			var p = {}; 
		} else {
			var r = E1;
			var p = {'type': 'report'};  
		}
		
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
		} else {
			var rShipments = E1;
			var pShipments = {'type': 'dashboard', "sortBy": "status", "sortOrder": "ASC", "limit": 12 }; 
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
		
		if ($routeParams.static) {
			var rAlerts = Alerts;
			var pAlerts = {}; 
		} else {
			var rAlerts = E2;
			var pAlerts = {'type': 'alert', "sortBy": "status", "sortOrder": "ASC", "limit": 12, "active": true }; 
		}
		
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
	
	.controller('ElementCtrl', ['$scope', '$routeParams', '$location', '$interval', '$timeout', '$anchorScroll', '$modal', 'E2', 'Utils', 'ClearUrl', 'ClearElement', 'ElmsConf', 'Elm', 'ElmItem', function($scope, $routeParams, $location, $interval, $timeout, $anchorScroll, $modal, E2, Utils, ClearUrl, ClearElement, ElmsConf, Elm, ElmItem) {
		
		$scope.loaded = false;
		$scope.relatedActiveTab = {};
		
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
		
		if ($routeParams.id === 'static' && $routeParams.type === 'shipment') {
			var r = Elm; 
			var p = {}; 
		} else if ($routeParams.id === 'static' && $routeParams.type === 'item') {
			var r = ElmItem; 
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
			
			if (elm.related) {
				var lists = []
				for (var i in elm.related) {
					lists.push(elm.related[i].type); 
				}
				ClearUrl.listReady('init', lists);
				var listsConf = [];
				ElmsConf.get(function(config) {
					for (var i in elm.related) {
						var listId = elm.related[i].type;
						listsConf[listId] = Utils.clone(config);
						listsConf[listId].related = listId; 
						listsConf[listId].related_id = elm.id; 
						listsConf[listId].type = listId;
						listsConf[listId].id = listId;
						listsConf[listId].name = elm.related[i].name;
						switch (elm.related[i].type) {
							case 'order': listsConf[listId].listCode = 'O'; break;
							case 'shipment': listsConf[listId].listCode = 'S'; break;
							case 'box': listsConf[listId].listCode = 'B'; break;
							case 'item': listsConf[listId].listCode = 'I'; break;
						}
						if ($routeParams.id === 'static') {
							switch (elm.related[i].type) {
								case 'order': listsConf[listId].resource = '10'; break;
								case 'shipment': listsConf[listId].resource = '11'; break;
								case 'box': listsConf[listId].resource = '12'; break;
								case 'item': listsConf[listId].resource = '13'; break;
							}
						} else {
							listsConf[listId].resource = '2'; 
						}
						ClearUrl.listReady('conf', listsConf[listId]); 
					}
				});
			}
			
			$scope.modalDocumentUpload = ClearElement.modalDocumentUpload; 
			
			$scope.loaded = true;
		});	
	}])
	
	.controller('ElementsTrackingCtrl', ['$scope', '$location', '$routeParams', 'Utils', 'ClearUrl', 'ElmsConf', function($scope, $location, $routeParams, Utils, ClearUrl, ElmsConf){
			
		ClearUrl.listReady('init', ['order', 'shipment', 'box', 'item']); 
		
		var types = [	
			{"name": "Orders", "type": "order", "url": "O" }, 
			{"name": "Shipments", "type": "shipment", "url": "S" }, 
			{"name": "Boxes", "type": "box", "url": "B"  }, 
			{"name": "Items", "type": "item", "url": "I"  }
		];
		var listsConf = [];
		
		ElmsConf.get( function(config) {	
			for (var i in types) {
				var listId = types[i].type; 
				listsConf[listId] = Utils.clone(config); 
				listsConf[listId].id = listId;
				listsConf[listId].type = listId;
				listsConf[listId].name = types[i].name;
				listsConf[listId].listCode = types[i].url; 
				if ($routeParams.static) {
					switch (types[i].type) {
						case 'order': listsConf[listId].resource = '10'; break;
						case 'shipment': listsConf[listId].resource = '11'; break;
						case 'box': listsConf[listId].resource = '12'; break;
						case 'item': listsConf[listId].resource = '13'; break;
					}
				} else {
					listsConf[listId].resource = '2'; 
				}
				ClearUrl.listReady('conf', listsConf[listId]); 
			}
		});
	}])
	
	.controller('ElementsSearchCtrl', ['$scope', '$location', 'ClearUrl', 'Utils', 'ElmsConf', function($scope, $location, ClearUrl, Utils, ElmsConf) {
		ClearUrl.listReady('init', ['searchResult']);
		var listConf = {}; 
		
		$scope.urlSet = function(type) {
			ClearUrl.listReady('init', ['searchResult']);
			console.log('scope.urlSet: ', type); 
			listConf.type = type;
			listConf.name = types[Utils.objectIndexbyKey(types, "type", type)].name;  
			$scope.urlPage = ClearUrl.listsUrlSet({"type": type }, listConf).urlParams;
			ClearUrl.listReady('conf', listConf);
			$scope.$broadcast('event:ListInit', 'searchResult' ); 		
		} 
		
		var types = [	
			{"name": "Orders", "type": "order" }, 
			{"name": "Shipments in", "type": "shipmentIn" }, 
			{"name": "Shipments out", "type": "shipmentOut" }, 
			{"name": "Boxes", "type": "box" }, 
			{"name": "Items", "type": "item" }
		];	
	
		$scope.types = types; 
		
		ElmsConf.get( function(config) {
			listConf = Utils.clone(config); 
			listConf.id = 'searchResult';
			listConf.resource = '2'; 
			
			if ($location.search().type) {
				$scope.urlSet($location.search().type); 
				$scope.listShow=true;
			} else {
				$scope.urlPage = {}; 
				$scope.listShow=false;
			}
		}); 
	}])
		
	.controller('ElementsCtrl', ['$scope', '$routeParams', 'ClearUrl', 'Utils', 'ElmsConf', function($scope, $routeParams, ClearUrl, Utils, ElmsConf) {
		
		ClearUrl.listReady('init', ['elements']);
		
		var type = $routeParams.type; 
				
		switch (type) {
			case 'order': $scope.type = 'order'; $scope.name = 'Orders'; break;
			case 'shipment': $scope.type = 'shipment'; $scope.name = 'Shipments'; break;
			case 'shipmentIn': $scope.type = 'shipment'; $scope.name = 'Shipments in'; break;
			case 'shipmentOut': $scope.type = 'shipment'; $scope.name = 'Shipments out'; break;
			case 'box': $scope.type = 'box'; $scope.name = 'Boxes'; break;
			case 'item': $scope.type = 'item'; $scope.name = 'Items'; break;
		}	
		

		ElmsConf.get( function(config) {
			var listConf = Utils.clone(config); 
			listConf.type = type;
			listConf.name = $scope.name;  
			listConf.id = "elements";
			listConf.resource = '2'; 
			$scope.$broadcast('event:ListInit', "elements");
			ClearUrl.listReady('conf', listConf); 
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
		
		ClearUrl.listReady('init', ['alerts']); 
		
		AlertsConfig.get( function(config) {
			var listConf = Utils.clone(config); 
			listConf.resource = ($routeParams.static) ? '6' : '2';
			listConf.type = 'alert';
			listConf.id = "alerts";
			$scope.page= {'name': 'Alerts', 'type': 'alert' };
			$scope.$broadcast('event:ListInit', listConf.id);
			ClearUrl.listReady('conf', listConf); 
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
		
		ClearUrl.listReady('init', ['documents']); 
		
		var type = $routeParams.type; 
		
		DocumentsConfig.get( function(config) {
			var listConf = Utils.clone(config); 
			listConf.id = "documents";
			listConf.type = type;
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
					case 'ir': listConf.resource = '20'; break;
					case 'pod': listConf.resource = '21'; break;
					case 'ncr': listConf.resource = '22'; break;
					case 'archive': listConf.resource = '23'; break;
					case 'media': listConf.resource = '24'; break;
				}
			} else {
				listConf.resource = '2'; 
			}
			
			$scope.$broadcast('event:ListInit', listConf.id);
			ClearUrl.listReady('conf', listConf); 
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
				templateUrl: 'partials/documents-ir-modal-img.html',
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
					templateUrl: 'partials/documents-ncr-modal-msg.html',
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
	}])
			
	.controller('WarehousesCtrl', ['$scope', '$filter', 'ClearUrl', 'Warehouses', 'Utils', 'WarehouseMovesConf', function($scope, $filter, ClearUrl, Warehouses, Utils, WarehouseMovesConf) {
		
		$scope.loaded = false;
		ClearUrl.listsReady('init');
		var type = 'warehouse'; 
		$scope.type = type; 
		$scope.name = 'Warehouses'; 
		Warehouses.query( function(warehouses) {
			$scope.warehousesGroupBy4 = $filter('groupBy')(warehouses, 4); 
			$scope.loaded = true;
		});

		$scope.listsConfig = [];
		WarehouseMovesConf.get( function(config) {
			$scope.listsConfig[0] = config; 
			$scope.listsConfig[0].type = type;
			$scope.listsConfig[0].name = $scope.name;  
			$scope.listsConfig[0].id = type;
			$scope.listsConfig[0].resource = '30'; 
			$scope.$broadcast('event:ListInit', $scope.listsConfig[0].id);
			ClearUrl.listsReady('parent'); 
		}); 
		$scope.$on('event:urlSet', function(event, urlParams, listId) {
			$scope.$broadcast('event:listLoad_' + listId, ClearUrl.listsUrlSet(urlParams, $scope.listsConfig[0]));
		});
	}])
	
	.controller('WarehouseCtrl', ['$scope', '$routeParams', '$location', '$interval', '$timeout', '$anchorScroll', '$modal', '$q', 'E2', 'Utils', 'ClearUrl', 'ClearElement', 'ElmsConf', 'Warehouse', 'WarehouseMovesConf', 'ElmItem', function($scope, $routeParams, $location, $interval, $timeout, $anchorScroll, $modal, $q, E2, Utils, ClearUrl, ClearElement, ElmsConf, Warehouse, WarehouseMovesConf, ElmItem) {
		
		$scope.loaded = false;
		$scope.relatedActiveTab = {};
		ClearUrl.listsReady('init');

		$scope.dateToTimestamp = Utils.dateToTimestamp;
		
		if ($routeParams.id === 'static') {
			var r = Warehouse; 
			var p = {}; 
		} else {
			var r = E2; 
			var p = {'type': 'warehouses', "id": $routeParams.id }; 
		}
		
		r.get(p, function(warehouse) {
			
			$scope.warehouse = warehouse;
			
			if ($location.search().related_type_active) {
				for (var i in warehouse.related) {
					if ($location.search().related_type_active === warehouse.related[i].type) {
						$scope.relatedActiveTab[$location.search().related_type_active] = true;
						break;
					}
				}
				$timeout(function() {
					$anchorScroll();
				}, 1000);
			}
			
			$scope.listsConfig = [];
			$q.all([ElmsConf.get().$promise, WarehouseMovesConf.get().$promise])
				.then(function(conf) {
					for (var i in warehouse.related) {
						$scope.listsConfig[i] = Utils.clone(conf[0]);
						$scope.listsConfig[i].related = warehouse.type; 
						$scope.listsConfig[i].related_id = warehouse.id; 
						$scope.listsConfig[i].type = warehouse.related[i].type;
						$scope.listsConfig[i].id = warehouse.related[i].type;
						$scope.listsConfig[i].name = warehouse.related[i].name;
						switch (warehouse.related[i].type) {
							case 'order': $scope.listsConfig[i].listCode = 'O'; break;
							case 'shipment': $scope.listsConfig[i].listCode = 'S'; break;
							case 'box': $scope.listsConfig[i].listCode = 'B'; break;
							case 'item': $scope.listsConfig[i].listCode = 'I'; break;
						}
						if ($routeParams.id === 'static') {
							switch (warehouse.related[i].type) {
								case 'order': $scope.listsConfig[i].resource = '10'; break;
								case 'shipment': $scope.listsConfig[i].resource = '11'; break;
								case 'box': $scope.listsConfig[i].resource = '12'; break;
								case 'item': $scope.listsConfig[i].resource = '13'; break;
							}
						} else {
							$scope.listsConfig[i].resource = '2'; 
						}
					}
					
					var listConfigMoves = Utils.clone(conf[1]);
					listConfigMoves.related = warehouse.type; 
					listConfigMoves.related_id = warehouse.id;
					listConfigMoves.resource = '31'; 
					$scope.listsConfig.push(listConfigMoves);  
					console.log('$scope.listsConfig', $scope.listsConfig); 
					ClearUrl.listsReady('parent'); 
				});
				
				
			$scope.$on('event:urlSet', function(event, urlParams, listId) {
				if (listId==='movement') {
					var typeIndex = 3;
				} else {
					var typeIndex = Utils.objectIndexbyKey($scope.warehouse.related, 'type', listId); 
				}
				$scope.$broadcast('event:listLoad_' + listId, ClearUrl.listsUrlSet(urlParams, $scope.listsConfig[typeIndex]));
			});
			
			$scope.loaded = true;
		});	
	}]);




