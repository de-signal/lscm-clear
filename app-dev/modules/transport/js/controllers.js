'use strict';

/* Controllers */

angular.module('clearApp.controllersTransport', [])

	.controller('TransportDashboardCtrl', ['$location', '$scope', '$timeout', '$routeParams', 'E1', 'ClearUrl', 'Utils', function($location, $scope, $timeout, $routeParams, E1, ClearUrl, Utils) {

			var contentLoad = function(user) {
				var listConf = {
					"resource": E1, 
					"type": "dashboard",
					"id": "dashboard",  
					"display": { 
						"filters" : false, 
						"conditions": user.permissions.transport.elements.conditions
					}, 
					"urlInit": {
						"sortBy": "status", 
						"sortOrder": "ASC", 
						"limit": 12
					}
				};
				
				$scope.$broadcast('event:ListInit', listConf.id);
				ClearUrl.listReady('conf', listConf);
				
				E1.query({'type': 'report'}, function(docs){
					$scope.reports = docs;
				});
			};
			
			ClearUrl.listReady('init', ['dashboard']);

			E1.get({'type': 'user'}, function(user) {
				$scope.$emit("event:sectionUpdate", "transport");
				contentLoad(user);
			});
		}])
		
		.controller('TransportDashboardTvCtrl', ['$interval', '$rootScope', '$routeParams', '$scope', 'E1', 'E2', 'ClearUrl', function($interval, $rootScope, $routeParams, $scope, E1, E2, ClearUrl) {
			
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
			
			$scope.loaded = false;
			$rootScope.tvScreen = true;
			
			listElementsLoad();
			$interval(listEmpty, 25000);
			
			var alertsQty;
			var next;
			$scope.alertCurrent = 1;
			
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
		
		.controller('TransportElementCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$interval', '$timeout', '$anchorScroll', '$modal', '$upload', 'E1', 'E2', 'Utils', 'ClearUrl', 'TransportElement', 'ElmsConf', function($scope, $rootScope, $routeParams, $location, $interval, $timeout, $anchorScroll, $modal, $upload, E1, E2, Utils, ClearUrl, TransportElement, ElmsConf) {
		
			var contentLoad = function(user) {
				
				E2.get({'format': 'elements', 'type': $routeParams.type, "id": $routeParams.id }, function(elm) {
					elm.anim = true;
					 
					elm.current = {
						"property": -1,
						"related": 0
					}; 
					if ($location.search().related_type_active) {
						var currentRelated = Utils.objectIndexbyKey(elm.related, "type", $location.search().related_type_active); 
						elm.current.related = currentRelated;
						$timeout(function() {
							$anchorScroll();
						}, 1000);
					}
					
					elm = TransportElement.elementUpdate(elm);
					
					
					if (elm.timeline) {
						var timelineAnim = function(i) {
							if (elm.timeline[i].completed) elm.timeline[i].anim = true; 
						}
						var loops = 0;
						$interval(function() {timelineAnim(loops++)}, 1000, 4); 
					}
					
					
					
					if (elm.related) {
						var lists = []; 
						var display = {
							"filters" : user.permissions.transport.elements.filters,
							"modifications": user.permissions.transport.elements.modifications, 
							"conditions": user.permissions.transport.elements.conditions
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

					$scope.elm = elm;
					$scope.display = user.permissions.transport.element[$routeParams.type];
					$scope.loaded = true;
				});
			}
			
			$scope.loaded = false;
			$scope.dateToTimestamp = Utils.dateToTimestamp;
			
			$scope.propertySave = function(elm, property) {		
				TransportElement.propertySave(elm, property);		
			}
			
// modals

			var alertModal = $modal({scope: $scope, show: false, template: "modules/transport/html/element-modal-alert.html"}); 
			
			$scope.alertstatuses = [ "success", "warning", "error" ]; 
			
			$scope.alertModalOpen = function(alert) {
				$scope.alertCurrent = angular.copy(alert); 
				alertModal.$promise.then(alertModal.show);
			};
			
			$scope.alertSave = function(alert) {
				TransportElement.alertSave($scope.elm, alert, $scope.user); 
				alertModal.$promise.then(alertModal.hide);
			}
			
			var alertDeleteModal = $modal({scope: $scope, show: false, template: "modules/transport/html/element-modal-alert-delete.html"});
			
			$scope.alertDeleteModalOpen = function(alert) {
				$scope.alertCurrent = angular.copy(alert);
				alertDeleteModal.$promise.then(alertDeleteModal.show);
			};
			
			$scope.alertDelete = function(alert) {
				TransportElement.alertDelete($scope.elm, alert);
				alertDeleteModal.$promise.then(alertDeleteModal.hide); 
			}
			
			var documentModal = $modal({scope: $scope, show: false, template: "modules/transport/html/element-modal-document.html"});
			
			$scope.documentModalOpen = function() {
				documentModal.$promise.then(documentModal.show);
			};

			$scope.documentSave = function(doc) {
				TransportElement.documentUploadSave(doc, $scope.elm, $scope.user);
				documentModal.$promise.then(documentModal.hide);
			}
			
			$scope.onFileSelect = function($files) {
				$scope.doc = {}; 
				for (var i = 0; i < $files.length; i++) {
					var file = $files[i];
					$scope.upload = $upload.upload({
						url: '/index_rest.php/api/clear/v2/elements/' + $scope.elm.type + '/' + $scope.elm.id + '?documentUpload=file',
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
				}
			};	
			
			var deleteModal = $modal({scope: $scope, show: false, template: "modules/transport/html/element-modal-delete.html"});
			
			$scope.deleteModalOpen = function() {
				deleteModal.$promise.then(deleteModal.show);
			};

			$scope.deleteConfirm = function() { 
				$scope.elm.$delete({"type": $scope.elm.type, "id": $scope.elm.id });
				$location.path('transport/tracking');
				deleteModal.$promise.then(deleteModal.hide);
			}
			
			E1.get({'type': 'user'}, function(user) { 
				$scope.$emit("event:sectionUpdate", "transport");
				contentLoad(user);
			});
			
		}])
		
		.controller('TransportTrackingCtrl', ['$scope', '$location', '$routeParams', 'Utils', 'ClearUrl', 'ElmsConf', 'E1', 'E2', '$modal', function($scope, $location, $routeParams, Utils, ClearUrl, ElmsConf, E1, E2, $modal){
			
			var contentLoad = function(user) {
				
				var types = [	
					{"name": "Orders", "type": "order", "url": "O" }, 
					{"name": "Shipments", "type": "shipment", "url": "S" }, 
					{"name": "Boxes", "type": "box", "url": "B"  }, 
					{"name": "Items", "type": "item", "url": "I"  }
				];
				var listsConf = [];
			
				ElmsConf.get( function(config) {
					var display = {
						"filters" : user.permissions.transport.elements.filters,
						"modifications": user.permissions.transport.elements.modifications, 
						"conditions": user.permissions.transport.elements.conditions
					}
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
			}
			
			ClearUrl.listReady('init', ['order', 'shipment', 'box', 'item']); 
			
			E1.get({'type': 'user'}, function(user) { 
				$scope.$emit("event:sectionUpdate", "transport");
				contentLoad(user);
			});

		}])
		
		.controller('TransportSearchCtrl', ['$scope', '$location', '$timeout', 'ClearUrl', 'Utils', 'ElmsConf', 'E1', 'E2', function($scope, $location, $timeout, ClearUrl, Utils, ElmsConf, E1, E2) {
			
			var contentLoad = function(user) {
				
				$scope.urlSet = function(type) {
					var listConf = {}; 
					ElmsConf.get( function(config) {
						var display = {
							"filters" : user.permissions.transport.elements.filters,
							"modifications": user.permissions.transport.elements.modifications, 
							"conditions": user.permissions.transport.elements.conditions
						}
						listConf = Utils.clone(config);
						listConf.display = display; 
						listConf.type = type;
						listConf.name = types[Utils.objectIndexbyKey(types, "type", type)].name;
						listConf.id = 'searchResult';
						listConf.resource = E2;
						$scope.urlPage = ClearUrl.listsUrlSet({"type": type }, listConf).urlParams;
						ClearUrl.listReady('conf', listConf);
						$scope.listShow=true;
					});
				}
				
				ClearUrl.listReady('init', ['searchResult']); 
				$scope.$broadcast('event:ListInit', 'searchResult');

				if ($location.search().type) {
					$scope.urlSet($location.search().type); 
				} else {
					$scope.urlPage = {}; 
					$scope.listShow=false;
				}
			}
			
			var types = [	
				{"name": "Orders", "type": "order" }, 
				{"name": "Shipments in", "type": "shipmentIn" }, 
				{"name": "Shipments out", "type": "shipmentOut" }, 
				{"name": "Boxes", "type": "box" }, 
				{"name": "Items", "type": "item" }
			];	
		
			$scope.types = types; 		
			
			E1.get({'type': 'user'}, function(user) { 
				$scope.$emit("event:sectionUpdate", "transport");
				contentLoad(user);
			});
		}])
			
		.controller('TransportElementsCtrl', ['$scope', '$routeParams', 'ClearUrl', 'Utils', 'ElmsConf','E1', 'E2', function($scope, $routeParams, ClearUrl, Utils, ElmsConf, E1, E2) {
			
			var contentLoad = function(user) {
				
				ClearUrl.listReady('init', ['elements']);
				
				var type = $routeParams.type; 
									
				switch (type) {
					case 'order':		$scope.type = 'order'; 		$scope.name = 'Orders'; 		break;
					case 'shipment':	$scope.type = 'shipment'; 	$scope.name = 'Shipments'; 		break;
					case 'shipmentIn': 	$scope.type = 'shipment'; 	$scope.name = 'Shipments in'; 	break;
					case 'shipmentOut': $scope.type = 'shipment'; 	$scope.name = 'Shipments out'; 	break;
					case 'box': 		$scope.type = 'box'; 		$scope.name = 'Boxes'; 			break;
					case 'item': 		$scope.type = 'item'; 		$scope.name = 'Items'; 			break;
				}	
		
				ElmsConf.get( function(config) {
				
					var display = {
						"filters" : user.permissions.transport.elements.filters,
						"modifications": user.permissions.transport.elements.modifications, 
						"conditions": user.permissions.transport.elements.conditions
					}
					
					var listConf = Utils.clone(config); 
					listConf.type = type;
					listConf.display = display; 
					listConf.name = $scope.name;  
					listConf.id = "elements";
					listConf.resource = E2; 
					$scope.$broadcast('event:ListInit', "elements");
					ClearUrl.listReady('conf', listConf); 
				});
			} 

			E1.get({'type': 'user'}, function(user) { 
				$scope.$emit("event:sectionUpdate", "transport");
				contentLoad(user);
			});
			
		}])
			
		.controller('TransportElementModalConditionCtrl', ['$scope', '$upload', '$modal', 'TransportElement', 'ClearUrl', function ($scope, $upload, $modal, TransportElement, ClearUrl) {
		
			var elm = $scope.elm;  
			var condition = $scope.condition;
			var conditionModal = $modal({scope: $scope, show: false, template: "modules/transport/html/element-modal-condition.html"}); 
			
			$scope.conditionModalOpen = function($event) {
				$event.stopPropagation();
				$event.preventDefault();
				conditionModal.$promise.then(conditionModal.show);
			};
			$scope.conditionSave = function(elm, condition) { 
				TransportElement.conditionSave(elm, condition);
				conditionModal.$promise.then(conditionModal.hide);
			}
			
			$scope.conditionClose = function() {
				conditionModal.$promise.then(conditionModal.hide);
			}
			
			$scope.go = ClearUrl.go;
			
			switch ($scope.condition.type) {
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
						}
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
			
			var alertModal = $modal({scope: $scope, show: false, template: "modules/transport/html/alerts-modal-edit.html"}); 
			
			$scope.alertstatuses = [ "success", "warning", "error" ]; 
			
			$scope.alertModalOpen = function(alerts, alert) {
				$scope.alertCurrent = angular.copy(alert); 
				$scope.alerts = alerts; 
				alertModal.$promise.then(alertModal.show);
			};
			
			$scope.alertSave = function(alert) {
				TransportAlert.alertSave($scope.alerts, alert, $scope.user); 
				alertModal.$promise.then(alertModal.hide);
			}
			
			var alertDeleteModal = $modal({scope: $scope, show: false, template: "modules/transport/html/alerts-modal-delete.html"});
			
			$scope.alertDeleteModalOpen = function(alerts, alert) {
				$scope.alertCurrent = angular.copy(alert);
				$scope.alerts = alerts; 
				alertDeleteModal.$promise.then(alertDeleteModal.show);
			};
			
			$scope.alertDelete = function(alert) {
				TransportAlert.alertDelete($scope.alerts, alert);
				alertDeleteModal.$promise.then(alertDeleteModal.hide); 
			}
		}])
		
		.controller('TransportDocumentsCtrl', ['$scope', '$routeParams', '$modal', '$upload', 'ClearUrl', 'TransportDocument', 'Utils', 'DocumentsConfig', 'E1', 'E2', function($scope, $routeParams, $modal, $upload, ClearUrl, TransportDocument, Utils, DocumentsConfig, E1, E2) {

			var contentLoad = function(user) {
			
				ClearUrl.listReady('init', ['documents']); 
				
				var type = $routeParams.type; 
				
				DocumentsConfig.get( function(config) {
					var listConf = Utils.clone(config); 
					listConf.id = "documents";
					listConf.display = user.permissions.transport.documents[type];
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
				
			}
			
			E1.get({'type': 'user'}, function(user) { 
				$scope.$emit("event:sectionUpdate", "transport");
				contentLoad(user);
			}); 
			
			var mediaModal = $modal({scope: $scope, show: false, template: "modules/transport/html/documents-modal-upload.html"});
			
			$scope.mediaModalOpen = function(type) {
				$scope.type = type; 
				$scope.media = new E2({"format": "documents", "type": "media", "id": "new"}); 
				mediaModal.$promise.then(mediaModal.show);
			};
			
			$scope.onFileSelect = function($files) {
				for (var i = 0; i < $files.length; i++) {
					var file = $files[i];
					$scope.upload = $upload.upload({
						url: '/index_rest.php/api/clear/v2/documents/'+ $scope.type + '?documentUpload=file',
	//				    	    data: {myObj: $scope.myModelObj},
						file: file,
					}).progress(function(evt) {
						$scope.progressShow = true; 
						$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
						console.log("upload progress: ", evt);
					}).success(function(data, status, headers, config) {
						$scope.media.value = "documentUpload"; 
						$scope.media.id = data.id; 
						console.log("upload success: ", data);
					}).error(function(error) {
						console.log("upload error: ", error);
					})	
				}
			};		
			$scope.mediaUploadSave = function(media) {
				TransportDocument.documentUploadSave(media, $scope.type, $scope.user);
				mediaModal.$promise.then(mediaModal.hide);
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
			
			var imageModal = $modal({scope: $scope, show: false, template: "modules/transport/html/documents-ir-modal-img.html"});
			
			$scope.imageModalOpen = function(item) {
				$scope.item = item; 
				imageModal.$promise.then(imageModal.show);
			}
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
			
			var ncrMessageModal = $modal({scope: $scope, show: false, template: "modules/transport/html/documents-ncr-modal-msg.html"});
			
			$scope.ncrMessageModalOpen = function(type) {
				if ($scope.doc.status != 'closed') {
					$scope.type = type; 
					if (type=='open') $scope.title = 'Add a comment'; 
					else $scope.title = 'Close report';
					$scope.comment = {};
					ncrMessageModal.$promise.then(ncrMessageModal.show);
				}
				
			};
			
			$scope.ncrMessageSave = function () {
				var now = new Date();
				var comment_date = Math.floor(now.getTime() / 1000);
				var comment_message = $scope.comment.message;
				var comment_user = { "first_name": $scope.user.first_name, "last_name": $scope.user.last_name, "id": $scope.user.id }; 
				
				$scope.doc.comments.push({ "date": comment_date, "status": $scope.type, "message": comment_message, "user": comment_user }); 
				$scope.doc.$save({'type': 'ncr', 'id': $scope.doc.id, 'update':$scope.type, 'format': 'documents' }, function(p, response) {});
				ncrMessageModal.$promise.then(ncrMessageModal.hide);
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