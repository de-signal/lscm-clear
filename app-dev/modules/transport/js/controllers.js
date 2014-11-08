'use strict';

/* Controllers */

angular.module('clearApp.controllersTransport', [])

	.controller('TransportDashboardCtrl', ['$location', '$scope', '$timeout', '$routeParams', 'E1', 'ClearUrl', 'Utils', function($location, $scope, $timeout, $routeParams, E1, ClearUrl, Utils) {
			
			$scope.$emit("event:sectionUpdate", "transport");
			
			ClearUrl.listReady('init', ['dashboard']);
			
			var listConf = {
				"resource": E1, 
				"type": "dashboard",
				"id": "dashboard",  
				"display": { 
					"filters" : false, 
					"conditions": $scope.user.permissions.transport.elements.conditions
				}, 
				"urlInit": {
					"sortBy": "status", 
					"sortOrder": "ASC", 
					"limit": 12
				}
			};
			
			$timeout(function() {
				$scope.$broadcast('event:ListInit', listConf.id);
				ClearUrl.listReady('conf', listConf);
			});
			
			E1.query({'type': 'report'}, function(docs){
				$scope.reports = docs;
			});
		}])
		
		.controller('TransportDashboardTvCtrl', ['$interval', '$rootScope', '$routeParams', '$scope', 'E1', 'E2', 'ClearUrl', function($interval, $rootScope, $routeParams, $scope, E1, E2, ClearUrl) {
			$scope.loaded = false;
			$rootScope.tvScreen = true;
			
			var listElementsLoad = function() {
				E1.query({'type': 'dashboard', "sortBy": "status", "sortOrder": "ASC", "limit": 12 }, function(list) {
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
				E2.query({'type': 'alert', "sortBy": "status", "sortOrder": "ASC", "limit": 12, "active": true }, function(alerts) {
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
		
		.controller('TransportOrderAddCtrl', [ '$timeout', '$scope', function($timeout, $scope) {
			$scope.buttonDisable = function () {
				$timeout(function() {
					$scope.buttonDisabled = true;
				}, 10);
			}
		}])
		
		.controller('TransportElementCtrl', ['$scope', '$routeParams', '$location', '$interval', '$timeout', '$anchorScroll', '$modal', 'E2', 'Utils', 'ClearUrl', 'TransportElement', 'ElmsConf', function($scope, $routeParams, $location, $interval, $timeout, $anchorScroll, $modal, E2, Utils, ClearUrl, TransportElement, ElmsConf) {
		
			$scope.$emit("event:sectionUpdate", "transport");
			
			$scope.loaded = false;
			$scope.relatedActiveTab = {};
			
			$scope.modalCondition = TransportElement.modalCondition; 
			$scope.modalDelete = TransportElement.modalDelete; 
			$scope.trackingToggle = TransportElement.trackingToggle;
			$scope.propertySave = function(elm, property, groupName) {
				TransportElement.propertySave(elm, property, groupName);
			}
			$scope.propertiesSave = function(elm, groupName) {
				TransportElement.propertySave(elm, groupName);
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
			
			$scope.modalAlert = TransportElement.modalAlert; 
			$scope.modalAlertDelete = TransportElement.modalAlertDelete;
			$scope.display = ($scope.user.permissions.transport.element) ? $scope.user.permissions.transport.element[$routeParams.type] : {};
			
			E2.get({'format': 'elements', 'type': $routeParams.type, "id": $routeParams.id }, function(elm) {
				elm.anim = true; 
				elm = TransportElement.elementUpdate(elm);
				
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
					var lists = []; 
					var display = {
						"filters" : $scope.user.permissions.transport.elements.filters,
						"modifications": $scope.user.permissions.transport.elements.modifications, 
						"conditions": $scope.user.permissions.transport.elements.conditions
					}
					for (var i in elm.related) {
						lists.push(elm.related[i].type); 
					}
					ClearUrl.listReady('init', lists);
					var listsConf = [];
					ElmsConf.get(function(config) {
						for (var i in elm.related) {
							var listId = elm.related[i].type;
							listsConf[listId] = Utils.clone(config);
							listsConf[listId].display = display; 
							listsConf[listId].related = elm.type; 
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
							listsConf[listId].resource = E2; 
							ClearUrl.listReady('conf', listsConf[listId]); 
						}
					});
				}
				
				$scope.modalDocumentUpload = TransportElement.modalDocumentUpload; 
				
				$scope.loaded = true;
			});	
		}])
		
		.controller('TransportTrackingCtrl', ['$scope', '$location', '$routeParams', 'Utils', 'ClearUrl', 'ElmsConf', 'E2', function($scope, $location, $routeParams, Utils, ClearUrl, ElmsConf, E2){
		
			$scope.$emit("event:sectionUpdate", "transport");
							
			ClearUrl.listReady('init', ['order', 'shipment', 'box', 'item']); 
			
			var types = [	
				{"name": "Orders", "type": "order", "url": "O" }, 
				{"name": "Shipments", "type": "shipment", "url": "S" }, 
				{"name": "Boxes", "type": "box", "url": "B"  }, 
				{"name": "Items", "type": "item", "url": "I"  }
			];
			var listsConf = [];
			var display = {
				"filters" : $scope.user.permissions.transport.elements.filters,
				"modifications": $scope.user.permissions.transport.elements.modifications, 
				"conditions": $scope.user.permissions.transport.elements.conditions
			}
			
			ElmsConf.get( function(config) {
				for (var i in types) {
					var listId = types[i].type; 
					listsConf[listId] = Utils.clone(config); 
					listsConf[listId].id = listId;
					listsConf[listId].display = display; 
					listsConf[listId].type = listId;
					listsConf[listId].name = types[i].name;
					listsConf[listId].listCode = types[i].url; 
					listsConf[listId].resource = E2;
					ClearUrl.listReady('conf', listsConf[listId]); 
				}				
			});
		}])
		
		.controller('TransportSearchCtrl', ['$scope', '$location', '$timeout', 'ClearUrl', 'Utils', 'ElmsConf', 'E2', function($scope, $location, $timeout, ClearUrl, Utils, ElmsConf, E2) {
		
			$scope.$emit("event:sectionUpdate", "transport");
			
			$timeout(function() {
				ClearUrl.listReady('init', ['searchResult']); 
				$scope.$broadcast('event:ListInit', 'searchResult');
			});
			var display = {
				"filters" : $scope.user.permissions.transport.elements.filters,
				"modifications": $scope.user.permissions.transport.elements.modifications, 
				"conditions": $scope.user.permissions.transport.elements.conditions
			}
			
			$scope.urlSet = function(type) {
				var listConf = {}; 
				ElmsConf.get( function(config) {
					listConf = Utils.clone(config);
					listConf.display = display; 
					listConf.type = type;
					listConf.name = types[Utils.objectIndexbyKey(types, "type", type)].name;
					listConf.id = 'searchResult';
					listConf.resource = E2;
					$scope.urlPage = ClearUrl.listsUrlSet({"type": type }, listConf).urlParams;
//					console.log('listConf: ', listConf);
					ClearUrl.listReady('conf', listConf);
					$scope.listShow=true;
				});
			} 
			
			var types = [	
				{"name": "Orders", "type": "order" }, 
				{"name": "Shipments in", "type": "shipmentIn" }, 
				{"name": "Shipments out", "type": "shipmentOut" }, 
				{"name": "Boxes", "type": "box" }, 
				{"name": "Items", "type": "item" }
			];	
		
			$scope.types = types; 
			
			if ($location.search().type) {
				$scope.urlSet($location.search().type); 
			} else {
				$scope.urlPage = {}; 
				$scope.listShow=false;
			}
			
		}])
			
		.controller('TransportElementsCtrl', ['$scope', '$routeParams', 'ClearUrl', 'Utils', 'ElmsConf', 'E2', function($scope, $routeParams, ClearUrl, Utils, ElmsConf, E2) {
		
			$scope.$emit("event:sectionUpdate", "transport");
			
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
				listConf.resource = E2; 
				$scope.$broadcast('event:ListInit', "elements");
				ClearUrl.listReady('conf', listConf); 
			}); 
		}])
		
		.controller('TransportElementModalDocumentUploadCtrl', ['$scope', '$upload', 'TransportDocument', 'E2', '$modalInstance', 'elm', 'user', function ($scope, $upload, TransportDocument, E2, $modalInstance, elm, user) {
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
				TransportDocument.documentUploadSave(doc, elm, user);
			}
			$scope.documentUploadClose = function() {
				$modalInstance.close();
			}
			 
			$scope.documentUploadCancel = function () {
				$modalInstance.dismiss('cancel');
			}
		}])
			
		.controller('TransportElementModalConditionCtrl', ['$scope', '$upload', 'TransportElement', 'ClearUrl', '$modalInstance', 'condition', 'elm', function ($scope, $upload, TransportElement, ClearUrl, $modalInstance, condition, elm) {
		
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
				TransportElement.conditionSave(elm, condition);
				console.log('condition: ', condition, condition.name); 
			}
			
			$scope.conditionClose = function() {
				$modalInstance.close();
			}
			 
			$scope.conditionCancel = function () {
				$modalInstance.dismiss('cancel');
			}
			
			$scope.go = ClearUrl.go;
		}])
		
		.controller('TransportElementModalDeleteCtrl', ['$scope', '$location', '$modalInstance', 'elm', function ($scope, $location, $modalInstance, elm) {
		
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
		
		.controller('TransportElementModalAlertCtrl', ['$scope', '$modalInstance', 'Utils', 'TransportElement', 'elm', 'alert', 'user', function ($scope, $modalInstance, Utils, TransportElement, elm, alert, user) {
			
			if (alert.id) { 
				$scope.alert = Utils.clone(alert);
			}
			$scope.statuses = [ "success", "warning", "error" ]; 
			
			$scope.alertSave = function(alert) {
				TransportElement.alertSave(elm, alert, user); 
			}
			
			$scope.modalClose = function() {
				$modalInstance.close();
			}
			 
			$scope.modalCancel = function () {
				$modalInstance.dismiss('cancel');
			}
		}])
		
		.controller('ElementModalAlertDeleteCtrl', ['$scope', '$modalInstance', 'TransportElement', 'elm', 'alert', function ($scope, $modalInstance, TransportElement, elm, alert) {
			
			$scope.alert = alert;
			
			$scope.alertDelete = function(alert) {
				TransportElement.alertDelete(elm, alert); 
			}
			
			$scope.modalClose = function() {
				$modalInstance.close();
			}
			 
			$scope.modalCancel = function () {
				$modalInstance.dismiss('cancel');
			}
		}])
			
		.controller('TransportAlertsCtrl', ['$scope', '$routeParams', 'ClearUrl', 'TransportAlert', 'Utils', 'AlertsConfig', '$modal', 'E2', function($scope, $routeParams, ClearUrl, TransportAlert, Utils, AlertsConfig, $modal, E2) {
			
			$scope.$emit("event:sectionUpdate", "transport");
			
			ClearUrl.listReady('init', ['alerts']); 
			
			AlertsConfig.get( function(config) {
				var listConf = Utils.clone(config); 
				listConf.resource = E2;
				listConf.type = 'alert';
				listConf.id = "alerts";
				$scope.page= {'name': 'Alerts', 'type': 'alert' };
				$scope.$broadcast('event:ListInit', listConf.id);
				ClearUrl.listReady('conf', listConf); 
			});
			
			$scope.alertModalEdit = TransportAlert.alertModalEdit; 
			$scope.alertModalDelete = TransportAlert.alertModalDelete;
		}])
		
		.controller('TransportAlertModalEditCtrl', ['$scope', '$modalInstance', 'TransportAlert', 'Utils', 'alerts', 'alert', 'user', function ($scope, $modalInstance, TransportAlert, Utils, alerts, alert, user) {
		
			$scope.alert = Utils.clone(alert);
			$scope.statuses = [ "success", "warning", "error" ]; 
			
			$scope.alertSave = function(a) {
				for (var i in a) {
					alert[i] = a[i]; 
				}
				TransportAlert.alertSave(alert, user); 
			}
			
			$scope.modalClose = function() {
				$modalInstance.close();
			}
			 
			$scope.modalCancel = function () {
				$modalInstance.dismiss('cancel');
			}
		}])
		
		.controller('TransportAlertModalDeleteCtrl', ['$scope', '$modalInstance', 'TransportAlert', 'alerts', 'alert', function ($scope, $modalInstance, TransportAlert, alerts, alert) {
			$scope.alert = alert;
			
			$scope.alertDelete = function(a) {
				TransportAlert.alertDelete(a, alerts);
			}
			
			$scope.modalClose = function() {
				$modalInstance.close();
			}
			 
			$scope.modalCancel = function () {
				$modalInstance.dismiss('cancel');
			}
		}])
		
		.controller('TransportDocumentsCtrl', ['$scope', '$routeParams', 'ClearUrl', 'TransportDocument', 'Utils', 'DocumentsConfig', 'E2', function($scope, $routeParams, ClearUrl, TransportDocument, Utils, DocumentsConfig, E2) {
			
			$scope.$emit("event:sectionUpdate", "transport");
			
			ClearUrl.listReady('init', ['documents']); 
			
			var type = $routeParams.type; 
			DocumentsConfig.get( function(config) {
				var listConf = Utils.clone(config); 
				listConf.id = "documents";
				console.log('$scope.user.permissions.transport.documents[type]: ', listConf.display, $scope.user.permissions.transport.documents[type])
				listConf.display = $scope.user.permissions.transport.documents[type];
				listConf.type = type;
				$scope.page = { 'type': type }; 
				
				switch (type) {
					case 'ir': $scope.page.name = 'Inspection reports'; break;
					case 'ncr': $scope.page.name = 'Non-conformity reports'; break;
					case 'pod': $scope.page.name = 'Proofs of delivery'; break;
					case 'archive': $scope.page.name = 'Archives'; break;
					case 'media': $scope.page.name = 'Medias'; break;		
				}
				
				listConf.resource = E2;
				
				$scope.$broadcast('event:ListInit', listConf.id);
				ClearUrl.listReady('conf', listConf); 
			}); 
			
			$scope.documentModalUpload = TransportDocument.documentModalUpload; 
		}])
		
		.controller('TransportDocumentModalUploadCtrl', ['$scope', '$upload', 'TransportDocument', 'E2', '$modalInstance', 'type', 'user', function ($scope, $upload, TransportDocument, E2, $modalInstance, type, user) {
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
				TransportDocument.documentUploadSave(doc, type, user);
			}
			$scope.documentUploadClose = function() {
				$modalInstance.close();
			}
			 
			$scope.documentUploadCancel = function () {
				$modalInstance.dismiss('cancel');
			}
		}])
		
		.controller('TransportIndicatorsCtrl', ['$scope', '$routeParams', 'E1', 'ChartsConfig', function($scope, $routeParams, E1, ChartsConfig) {
		
			$scope.$emit("event:sectionUpdate", "transport");
			
			$scope.loaded = false;
			$scope.charts = [];
			
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
		
		.controller('TransportDocumentsIrCtrl', ['$scope', '$filter', '$routeParams', '$modal', 'E2', 'ClearToken', function($scope, $filter, $routeParams, $modal, E2, ClearToken) {
		
			$scope.$emit("event:sectionUpdate", "transport");
			
			$scope.loaded = false;
			
			var imgUrl = "/index_rest.php/api/clear/v1/file/"; 
			var imgToken = '?oauth_token=' + ClearToken.returnToken(); 
			
			E2.get({'format': 'documents', 'type': 'ir', 'id': $routeParams.id}, function(doc) {
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
					templateUrl: 'modules/transport/html/documents-ir-modal-img.html',
					controller: 'TransportDocumentsIrModalImgCtrl',
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
		
		.controller('TransportDocumentsIrModalImgCtrl', ['$scope', '$modalInstance', 'item', function ($scope, $modalInstance, item) {	
		
			$scope.item = item; 
			$scope.cancel = function () {
				$modalInstance.dismiss('cancel');
			};
		}])
		
		.controller('TransportDocumentsNcrCtrl', ['$scope', '$routeParams', 'E2', '$modal', 'ClearToken', function($scope, $routeParams, E2, $modal, ClearToken) {
			
			$scope.$emit("event:sectionUpdate", "transport");
			 
			$scope.loaded = false;
			
			var imgUrl = "/index_rest.php/api/clear/v1/file/"; 
			var imgToken = '?oauth_token=' + ClearToken.returnToken(); 
			
			E2.get({'format': 'documents', 'type': 'ncr', 'id': $routeParams.id}, function(doc) {
				doc.element.image.url = doc.element.image.url + imgToken;
				$scope.doc = doc;
				$scope.loaded = true;
			});
			$scope.open = function (doc, user, type) {            
				if (doc.status != 'closed') {
					var modalInstance = $modal.open({
						templateUrl: 'modules/transport/html/documents-ncr-modal-msg.html',
						controller: 'TransportDocumentsNcrModalMsgCtrl',
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
		
		.controller('TransportDocumentsNcrModalMsgCtrl', ['$scope', '$modalInstance', 'doc', 'user', 'type', function ($scope, $modalInstance, doc, user, type) {
			
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
		
		.controller('TransportDocumentsPodCtrl', ['$scope', '$routeParams', 'ClearToken', 'E2', function($scope, $routeParams, ClearToken, E2) {
			
			$scope.$emit("event:sectionUpdate", "transport");
			
			$scope.loaded = false;
			
				var imgUrl = "/index_rest.php/api/clear/v1/file/"; 
				var imgToken = '?oauth_token=' + ClearToken.returnToken(); 
			
			E2.get({'format': 'documents', 'type': 'pod', 'id': $routeParams.id}, function(doc) {
				doc.signature.image.url = doc.signature.image.url + imgToken;
				$scope.doc = doc;
				$scope.loaded = true;
			});
		}])

			.controller('TransportGuidelinesListCtrl', ['$scope', 'GuidelinesProcess', 'GuidelinesWeb', 'GuidelinesMobile', function($scope, GuidelinesProcess, GuidelinesWeb, GuidelinesMobile) {
	
		$scope.$emit("event:sectionUpdate", "sans");
		
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
	
	.controller('TransportGuidelinesProcessCtrl', ['$scope', '$location', '$anchorScroll', '$timeout', 'GuidelinesProcess', function($scope, $location, $anchorScroll, $timeout, GuidelinesProcess) {
	
		$scope.$emit("event:sectionUpdate", "sans");
		
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
	
	.controller('TransportGuidelinesOperationsCtrl', ['$scope', '$location', '$anchorScroll', '$timeout', '$routeParams', 'GuidelinesWeb', 'GuidelinesMobile', function($scope, $location, $anchorScroll, $timeout, $routeParams, GuidelinesWeb, GuidelinesMobile) {
	
		$scope.$emit("event:sectionUpdate", "sans");
		
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
		;