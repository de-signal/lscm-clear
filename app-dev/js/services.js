'use strict';

/* Services */

angular.module('clearApp.services', ['ngResource'])
	.factory('E1', ['$resource', function($resource) {
		return $resource('../index_rest.php/api/clear/v1/:type/:id', { type:'@type', id:'@id' });
	}])
	.factory('E2', ['$resource', function($resource) {
		return $resource('../index_rest.php/api/clear/v2/:format/:type/:id/:action', 
			{ format:'@format', type:'@type', id:'@id', action:'@action' }, 
			{
				update: { method: 'PUT' }, 
				updateList: { method: 'PUT', isArray: true }
			});
	}])
	.factory('Utils', function(){
		return {
			dateToTimestamp: function(date) {
				if (date instanceof Date) return Math.floor( date.getTime() / 1000 ); 
				else return null;
			}, 
			timestampToDate: function(timestamp) {
				return new Date( timestamp * 1000 ); 
			}, 
			isEmpty: function (obj) {
				var hasOwnProperty = Object.prototype.hasOwnProperty;
				// null and undefined are empty
				if (obj == null) return true;
				// Assume if it has a length property with a non-zero value
				// that that property is correct.
				if (obj.length && obj.length > 0)    return false;
				if (obj.length === 0)  return true;
			
				for (var key in obj) {
					if (hasOwnProperty.call(obj, key))    return false;
				}
				// Doesn't handle toString and toValue enumeration bugs in IE < 9
				return true;
			}, 
			collect: function (a,b){
				var c = {};
				for (var att in a) { c[att] = a[att]; }
				for (var att in b) { c[att] = b[att]; }
				return c;
			}, 
			clone: function (obj) {
				var that = this; 
				// Handle the 3 simple types, and null or undefined
				if (null == obj || "object" != typeof obj) return obj;
			
				// Handle Date
				if (obj instanceof Date) {
					var copy = new Date();
					copy.setTime(obj.getTime());
					return copy;
				}
			
				// Handle Array
				if (obj instanceof Array) {
					var copy = [];
					for (var i = 0, len = obj.length; i < len; i++) {
						copy[i] = that.clone(obj[i]);
					}
					return copy;
				}
			
				// Handle Object
				if (obj instanceof Object) {
					var copy = {};
					for (var attr in obj) {
						if (obj.hasOwnProperty(attr)) copy[attr] = that.clone(obj[attr]);
					}
					return copy;
				}
			
				throw new Error("Unable to copy obj! Its type isn't supported.");
			}, 
			objectByKey:  function(array, key, value) {
				for (var i in array) {
					if (array[i][key] == value) return array[i];
				}
			}, 
			objectIndexbyKey: function(array, key, value) {
				for(var i in array) {
					if (array[i][key] === value) return i;
				}
				return -1;
			}
		}
	})
	
	.factory('ClearList', ['$filter', '$rootScope', '$q', 'toaster', 'Utils', 'ClearToken', 'E1', 'E2', 'ElmsOrder', 'FiltersOrder', 'ElmsShipment', 'FiltersShipment', 'ElmsBox', 'FiltersBox', 'ElmsItem', 'FiltersItem', 'IRs', 'FiltersIRs', 'PODs', 'FiltersPODs', 'NCRs', 'FiltersNCRs', 'Archives', 'FiltersArchives', 'Medias', 'FiltersMedias', 'Alerts', 'FiltersAlerts', 'Dashboard', function($filter, $rootScope, $q, toaster, Utils, ClearToken, E1, E2, ElmsOrder, FiltersOrder, ElmsShipment, FiltersShipment, ElmsBox, FiltersBox, ElmsItem, FiltersItem, IRs, FiltersIRs, PODs, FiltersPODs, NCRs, FiltersNCRs, Archives, FiltersArchives, Medias, FiltersMedias, Alerts, FiltersAlerts, Dashboard){
		
		return {
			listElementsLoad: function (listConfig) {
				var resources = { "1": E1, "2": E2, "5": Dashboard, "10": ElmsOrder, "11": ElmsShipment, "12": ElmsBox, "13": ElmsItem, "20": IRs, "21": PODs, "22": NCRs, "23": Archives, "24": Medias, "30": Alerts }; 
				var list = listConfig;
				var q=$q.defer();
				var listQuery = { 'type': listConfig.type }; 
				if (listConfig.format) listQuery.format = listConfig.format; 
				
				listQuery = Utils.collect(listQuery, listConfig.urlParams); 
				
				if (listConfig.related) {
					listQuery.related = listConfig.related; 
					listQuery.related_id = listConfig.related_id; 
				} 
			 	resources[listConfig.resource].query( listQuery, function(elements, response) {
			 		list.pagination = { 
						'itemsPerPage': listConfig.urlInit.limit, 
						'page': listConfig.urlParams.page,
						'pagesCount': response("X-Clear-pagesCount"), 
						'elementsCount': response("X-Clear-elementsCount")
					} 
					console.log("pagesCount: " + list.pagination.pagesCount + ", elementsCount: " + list.pagination.elementsCount);
					for (var i in elements) {
						if (elements[i].url) {
							elements[i].url = elements[i].url + '?oauth_token=' + ClearToken.returnToken();
						}
						if (elements[i].url_thumb) {
							elements[i].url_thumb = elements[i].url_thumb + '?oauth_token=' + ClearToken.returnToken();
						}
					}
					list.elements = elements; 
					console.log('list: ', list);  
					q.resolve(list);
				});
				return q.promise;
			},
			listFiltersLoad: function(listConfig) { 
				var resources = { "1": E1, "2": E2, "10": FiltersOrder, "11": FiltersShipment, "12": FiltersBox, "13": FiltersItem, "20": FiltersIRs, "21": FiltersPODs, "22": FiltersNCRs, "23": FiltersArchives, "24": FiltersMedias, "30": FiltersAlerts }; 
				var that = this;
				var filters = {}; 
				var q=$q.defer();
				var listQuery = { 'type': listConfig.type, 'id': 'filter' }; 
				if (listConfig.format) listQuery.format = listConfig.format; 
				
				resources[listConfig.resource].get( listQuery, function(elmFilters) { 
					if (elmFilters.users) {
						for (var i in elmFilters.users) {
							elmFilters.users[i].name = 	elmFilters.users[i].first_name + " " + elmFilters.users[i].last_name; 
						}
					}	
					filters.values = elmFilters; 
					filters.badges = that.listFiltersBadgesInit(listConfig.urlParams, listConfig.filters, elmFilters);
					filters.date = that.listFiltersDateInit(listConfig.urlParams, listConfig.filters);
					filters.tmp = that.listFiltersTmpInit(listConfig.urlParams, listConfig.filters, elmFilters);
					q.resolve(filters);
				});
				return q.promise;
			},
			listFiltersDateInit: function (urlParams, listConfigFilters) {
				var filtersDate = {};
				var setDate = function(id) {
					filtersDate[id] = {}; 
					if (urlParams[id]) filtersDate[id].value = Utils.timestampToDate(urlParams[id]);
				}
				
				for (var i in listConfigFilters) {
					var filter = listConfigFilters[i];
					if (filter.type === 'date') {
						setDate(filter.id); 
					}
					if (filter.children) {
						for (var j in filter.children) {
							if (filter.children[j].type === 'date') {
								setDate(filter.children[j].id); 
							}
						}
					}
				} 
				return filtersDate; 
			}, 
			listFiltersTmpInit: function  (urlParams, listConfigFilters, elmFilters) {
				var filtersTmp = {};
				filtersTmp.property = {}; 
				if (urlParams.property_id) {
					var p = elmFilters.properties;
					filtersTmp.property = p[Utils.objectIndexbyKey(p, 'id', urlParams.property_id)];
					filtersTmp.property.value;
				}
				return filtersTmp;
			}, 
			listFiltersBadgesInit: function(urlParams, listConfigFilters, elmFilters) {
				var badges = [];
				
				var filterToString = function(filter) {
					switch (filter.type) {
						case 'date': 
							return filter.name + ': ' + $filter('date')(urlParams[filter.id]*1000, 'dd.MM.yy');
						break;
						case 'select':
							
							return filter.name + ': ' + Utils.objectByKey(elmFilters[filter.reference], "id", urlParams[filter.id]).name;
						break;
						case 'selectProperty':
							var propertySelected = Utils.objectByKey(elmFilters.properties, "id", urlParams.property_id); 
							var propertySelectedValue = Utils.objectByKey(propertySelected.values, "id", urlParams[filter.id]); 
							console.log('propertySelected: ', propertySelected, 'propertySelectedValue: ', propertySelectedValue ); 
							return filter.name + ': ' + propertySelectedValue.name;
						break;
						default:
							return filter.name + ': ' + urlParams[filter.id];
					}
				}
				
				for (var i in listConfigFilters) {
					var filter = listConfigFilters[i];
					if (urlParams.hasOwnProperty(filter.id)) {
						var badgeContent = filterToString(filter); 
						if (filter.children) {
							for (var j in filter.children) {
								if (urlParams.hasOwnProperty(filter.children[j].id)) {
									badgeContent += ", " + filterToString(filter.children[j]); 
								}
							}
						}
						badges.push({'id': filter.id, 'content': badgeContent });
					}
				}
				return badges;
			}, 
			listCleanUrl: function(urlParams) {
				for (var i in urlParams) {
				    if (!urlParams[i] || urlParams[i]===null) {
				     	delete urlParams[i];
				    }
				}
			},
			listBadgeRemove: function(badgeId, urlParams, listConfigFilters) {
				var filter = Utils.objectByKey(listConfigFilters, 'id', badgeId); 
				if (urlParams.hasOwnProperty(badgeId)) {
					if (filter.children) {
						for (var i in filter.children) {
							delete urlParams[filter.children[i].id];
						}
					}
					delete urlParams[filter.id];
				}				
			}, 
			listPropertySave: function(list, idsArray, propertyUpdate, selectGlobal, urlParams) {
				var elements = []; 
				var parameters = { 
					'type': list.type, 
					'action': 'updateList', 
					'format': list.format, 
					'ids': idsArray.join(), 
					'propertyUpdateId': propertyUpdate.id, 
					'propertyUpdateVal': propertyUpdate.value
				}; 
				
				console.log ('parameters: ', parameters); 
				
				for (var i in idsArray) {
					elements.push(Utils.objectByKey(list.elements, 'id', idsArray[i]));
				}
				
				if (selectGlobal) parameters = Utils.collect(parameters, urlParams); 

				E2.updateList(parameters, elements, function(elms, response) {
					var propertyMessage; 
					var elementsType = list.elements.length + " " + list.type; 
					
					if (response("X-Clear-updatedElements")) elementsType = "on " + response("X-Clear-updatedElements");
					
					if (response("X-Clear-updatedProperty")==="success") propertyMessage = "Properties updated" + elementsType;
					else if (response("X-Clear-updatedProperty")==="warning") propertyMessage = "Property did not update" + elementsType;
					else if (response("X-Clear-updatedProperty")==="error") propertyMessage = "Property did not update" + elementsType;
					
					if (response("X-Clear-updatedProperty")) toaster.pop(response("X-Clear-updatedProperty"), propertyMessage, property.name);
				}); 
			}
		}
	}])
	
	.factory('ClearToken', function(){
		
		var token; 
		
		return {
			updateToken: function(t) {
				token = t;
			},
			returnToken: function() {
				return token;
			}
		}
	})
			
	.factory('ClearUrl', ['$rootScope', '$location', 'Utils', function($rootScope, $location, Utils){
		
		var parentReady, listsReady=[]; 
		
		return {
			listsReady: function(p) {
				if (p == 'init') { 
					parentReady=false; listsReady = [] 
				} else if (p == 'parent') { 
					parentReady=true; 
					for (var i in listsReady) {
						$rootScope.$broadcast('event:listReady_' + listsReady[i], listsReady[i]);
					}
				} else { 
					listsReady.push(p); 
					if (parentReady) $rootScope.$broadcast('event:listReady_' + p, p);
				} 
			}, 
			listsUrlSet: function(urlParams, listConfig) {
				var urlPage = $location.search();
				
				if (listConfig.listCode) {
					var urlList = {}		
					for (var i in urlPage) {
						var code = i.slice(1,2); 
						if (code === listConfig.listCode) { 
							var param = i.slice(3, i.length); 
							urlList[param] = urlPage[i]; 
							delete urlPage[i]; 
						}
					}
					if (Utils.isEmpty(urlParams)) urlParams = urlList; 
					urlParams = Utils.collect(listConfig.urlInit, urlParams); 
					
					for (i in urlParams) {
						urlPage['_' + listConfig.listCode + '_' + i] = urlParams[i]; 
					}
					$location.search(urlPage);
				} else {
					if (Utils.isEmpty(urlParams)) urlParams = urlPage; 
					urlParams = Utils.collect(listConfig.urlInit, urlParams); 
					$location.search(urlParams);
				} 
//				if (urlReplace) 
				$location.replace();			
				listConfig.urlParams = urlParams; 	
				return listConfig; 
			}
		}
	}])
	
	.factory('ClearElement', ['$rootScope', '$modal', '$location', 'ClearToken', 'toaster', 'Utils', function($rootScope, $modal, $location, ClearToken, toaster, Utils){
		
		return {
			elementUpdate: function(elm) {
				var self = this;
				self.propertiesDate(elm); 
				self.elementUpdateUrl(elm); 
				self.qrCodeGoogle(elm);
				self.elementTimeline(elm);
				for (var index in elm.charts) {
					self.colorScaleConfig(elm.charts[index], elm.charts[index].value);
				}
				return elm;
			}, 
			elementTimeline: function(elm) {
				if (!elm.anim && elm.timeline) {
					for (var i = 0; i < 4; i++) {
						if (elm.timeline[i].completed) elm.timeline[i].anim = true; 
					}
				} 
				return elm;
			}, 
			elementUpdateUrl: function(elm) {
				if (elm.documents) {
					for (var i in elm.documents) {
						elm.documents[i].url = elm.documents[i].url + '?oauth_token=' + ClearToken.returnToken();
					}
				} 
				return elm;
			}, 
			modalDelete: function (elm, $event) {        
				if ($event.stopPropagation) $event.stopPropagation();
				var modalInstance = $modal.open({
					templateUrl: 'partials/element-modal-delete.html',
					controller: 'ElementModalDeleteCtrl',
					resolve: {
					  elm: function () {
						return elm;
					  }
					}
				});
				modalInstance.result.then(function (selectedItem) {
//				    $scope.selected = selectedItem;
				}, function () {
//                $log.info('Modal dismissed at: ' + new Date());
				});
			}, 
			modalCondition: function (elm, condition, $event) {            
				if ($event.stopPropagation) $event.stopPropagation();
				if (condition.editable || !condition.completed) {
					var modalInstance = $modal.open({
						templateUrl: 'partials/element-modal-condition.html',
						controller: 'ElementModalConditionCtrl',
						resolve: {
						  condition: function () {
							return condition;
						  },
						  elm: function () {
							return elm;
						  }
							
						}
					});
					modalInstance.result.then(function (selectedItem) {
	//				    $scope.selected = selectedItem;
					}, function () {
	//                $log.info('Modal dismissed at: ' + new Date());
					});
				}
			}, 
			modalAlert: function(elm, alert, user) {
				var modalInstance = $modal.open({
					templateUrl: 'partials/element-modal-alert.html',
					controller: 'ElementModalAlertCtrl',
					resolve: {
					  elm: function () {
						return elm;
					  }, 
					  alert: function () {
					  	return alert;
					  }, 
					  user: function () {
					  	return user;
					  }
					}
				});
				modalInstance.result.then(function (selectedItem) {
//					$scope.selected = selectedItem;
				}, function () {
//					$log.info('Modal dismissed at: ' + new Date());
				});
			},
			modalAlertDelete: function(elm, alert) {
				var modalInstance = $modal.open({
					templateUrl: 'partials/element-modal-alert-delete.html',
					controller: 'ElementModalAlertDeleteCtrl',
					resolve: {
					  elm: function () {
						return elm;
					  }, 
					  alert: function () {
					  	return alert;
					  }
					}
				});
				modalInstance.result.then(function (selectedItem) {
//					$scope.selected = selectedItem;
				}, function () {
//					$log.info('Modal dismissed at: ' + new Date());
				});
			}, 
			modalDocumentUpload: function(elm, user) { 
				var modalInstance = $modal.open({
					templateUrl: 'partials/element-modal-document-upload.html',
					controller: 'ElementModalDocumentUploadCtrl',
					resolve: {
					  elm: function () {
					  	return elm;
					  }, 
					  user: function () {
					  	return user;
					  }
					}
				});
				modalInstance.result.then(function (selectedItem) {
//					$scope.selected = selectedItem;
				}, function () {
//					$log.info('Modal dismissed at: ' + new Date());
				});
			}, 
			documentUploadSave: function(doc, elm, user) {
				var self=this;
				
				doc.user = { 
					"first_name": user.first_name, 
					"last_name": user.last_name, 
					"id": user.id
				}
				
				doc.dates = { "created": Utils.dateToTimestamp( new Date()) };  
				
				elm.documents.push(doc); 
				console.log("elm: ", elm); 						
				elm.$update({ "documentUpload": doc.id }, function(elm, response) {
					var toasterMessage; 
					
					if (response("X-Clear-updatedDocument")==="success") toasterMessage = "Updated document";
					else if (response("X-Clear-updatedDocument")==="warning") toasterMessage = "Document did not update";
					else if (response("X-Clear-updatedDocument")==="error") toasterMessage = "Document did not update";
					
					if (response("X-Clear-updatedDocument")) toaster.pop(response("X-Clear-updatedDocument"), toasterMessage, doc.name);
					console.log("success");
					elm = self.elementUpdate(elm);
				}, function() {
					console.log("error");
					toaster.pop("error", "Nothing updated");
				});
			}, 
			trackingToggle: function(elm, $event) {
				if ($event.stopPropagation) $event.stopPropagation(); 
				elm.tracking=!elm.tracking;
			}, 
			alertSave: function(elm, alert, user) {
				var self=this;
				alert.user = { 
					"first_name": user.first_name, 
					"name": user.name, 
					"id": user.id
				}
				
				if (!alert.dates) alert.dates = []; 
				
				alert.dates.modified = Utils.dateToTimestamp(new Date());  
				
				if (alert.id) { 
					elm.alerts[Utils.objectIndexbyKey(elm.alerts, "id", alert.id)] = alert; 
				} else { 
					if (elm.alerts) {
						elm.alerts[elm.alerts.length] = alert;
					} else {
						elm.alerts = []; 
						elm.alerts[0] = alert; 
					}
					alert.id = "new"; 
				}
			
				elm.$update({ 'alertUpdateId': alert.id }, function(elm, response) {
					var alertMessage; 
					
					if (response("X-Clear-updatedAlert")==="success") alertMessage = "Alert updated";
					else if (response("X-Clear-updatedAlert")==="warning") alertMessage = "Alert did not update";
					else if (response("X-Clear-updatedAlert")==="error") alertMessage = "Alert did not update";
					
					if (response("X-Clear-updatedAlert")) toaster.pop(response("X-Clear-updatedAlert"), alertMessage, alert.name);
					
					elm = self.elementUpdate(elm);
				});
			}, 
			alertDelete: function(elm, alert) {
				var self=this;
				elm.$update({ 'alertDeleteId': alert.id }, function(elm, response) {
					var alertMessage; 
					
					if (response("X-Clear-updatedAlert")==="success") alertMessage = "Deleted alert";
					else if (response("X-Clear-updatedAlert")==="warning") alertMessage = "Alert did not deleted";
					else if (response("X-Clear-updatedAlert")==="error") alertMessage = "Alert did not deleted";
					
					if (response("X-Clear-updatedAlert")) toaster.pop(response("X-Clear-updatedAlert"), alertMessage, alert.name);
					
					elm = self.elementUpdate(elm);
				});
			}, 
			propertySave: function(elm, property, group) {
				var self=this;
				$rootScope.currentGroup = group;
				elm.$update({ 'propertyUpdateId': property.id, 'propertyUpdateVal': property.value }, function(elm, response) {
					var propertyMessage; 
					
					if (response("X-Clear-updatedProperty")==="success") propertyMessage = "Property updated";
					else if (response("X-Clear-updatedProperty")==="warning") propertyMessage = "Property did not update";
					else if (response("X-Clear-updatedProperty")==="error") propertyMessage = "Property did not update";
					
					if (response("X-Clear-updatedProperty")) toaster.pop(response("X-Clear-updatedProperty"), propertyMessage, property.name);
					
					elm = self.elementUpdate(elm);
				});
			}, 
			conditionSave: function (elm, condition) {
				var self=this;
				
				elm.$update({ 'requiredId': condition.id, 'requiredValue': condition.value }, function(elm, response) {
					var conditionMessage, milestoneMessage; 
					
					if (response("X-Clear-updatedRequired")==="success") conditionMessage = "Condition updated";
					else if (response("X-Clear-updatedRequired")==="warning") conditionMessage = "Condition did not update";
					else if (response("X-Clear-updatedRequired")==="error") conditionMessage = "Condition did not update";
					
					if (response("X-Clear-updatedMilestone")==="success") milestoneMessage = "Milestone updated";
					else if (response("X-Clear-updatedMilestone")==="warning") milestoneMessage = "Milestone did not update";
					else if (response("X-Clear-updatedMilestone")==="error") milestoneMessage = "Milestone did not update";
					
					if (response("X-Clear-updatedRequired")) toaster.pop(response("X-Clear-updatedRequired"), conditionMessage, condition.name);
					if (response("X-Clear-updatedMilestone")) toaster.pop(response("X-Clear-updatedMilestone"), milestoneMessage, response("X-Clear-updatedMilestoneName"));
					console.log("success");  
					elm = self.elementUpdate(elm);
				}, function(error) {
					console.log("error: ", error);
				});
			}, 
			propertiesDate: function (elm){
				// init date properties from unix timestamp to javascript date
				var date = {};
				for (var group in elm.properties) {
					for (var property in elm.properties[group].set) {
						var property = elm.properties[group].set[property];
						if (property.type === 'date') {
							if (property.value)	property.date = Utils.timestampToDate(property.value);
						}
					}
				}
				return elm;
			}, 
			qrCodeGoogle: function (elm) {
				var e;
				switch (elm.type) {
					case 'order': e = 'O'; break;
					case 'shipment': e = 'S'; break;
					case 'box': e = 'B'; break;
					case 'item': e = 'I'; break;
				}
				elm.qrCodeGoogle = 'http://chart.apis.google.com/chart?cht=qr&chs=63x63&chl='+ e + elm.id + '&chld=H%7C0';
				return elm;
			}, 
			colorScaleConfig: function(elm, value){
				var colorBest = '#5cb85c', 
					colorGood = '#a6b15b', 
					colorMedium = '#eeac57', 
					colorBad = '#e28054', 
					colorWorst = '#d75452';
				
				var snapToGrid = function (value) {
					var dest = null;
					var gridArray = [ 0, 20, 40, 60, 80, 101 ];
					for (var i=0, len=gridArray.length; i<gridArray.length; i++) {
						if (gridArray[i] > value) {
							dest = i-1;
							break;
						}
					}
					return dest;
				}
				var colorFn = function (value) {
					var colorArrayScale = [ colorWorst, colorBad, colorMedium, colorGood, colorBest ];
					return { 'color': colorArrayScale[snapToGrid(value)] };	
				}
				 
				var labelFn = function (value) {
					var textArrayScale = [ 'worst', 'bad', 'medium', 'good', 'best' ];
					return textArrayScale[snapToGrid(value)];	
				}
				
				elm.color = colorFn(value); 
				elm.label = labelFn(value);
				
				return elm;
			}, 
			go: function (type, id, related) {
				$rootScope.tvScreen = false;
				$location.$$search = {};
				$location.path( type + '/' + id )
				if (related) {
					$location.search('related_type_active', related).hash('related');
				}
				console.log('go ->', type, id, related);
			}
		}
	}])
	
	.factory('ClearAlert', ['$rootScope', '$modal', 'Utils', 'toaster', function($rootScope, $modal, Utils, toaster){
		
		return {
			alertModalEdit: function(alerts, alert, user) { 
				var modalInstance = $modal.open({
					templateUrl: 'partials/alert-modal-edit.html',
					controller: 'AlertModalEditCtrl',
					resolve: {
					  alerts: function () {
					  	return alerts;
					  }, 
					  alert: function () {
					  	return alert;
					  }, 
					  user: function () {
					  	return user;
					  }
					}
				});
				modalInstance.result.then(function (selectedItem) {
//					$scope.selected = selectedItem;
				}, function () {
//					$log.info('Modal dismissed at: ' + new Date());
				});
			}, 
			alertModalDelete: function(alerts, alert) {
				var modalInstance = $modal.open({
					templateUrl: 'partials/alert-modal-delete.html',
					controller: 'AlertModalDeleteCtrl',
					resolve: { 
					  alerts: function () {
					  	return alerts;
					  }, 
					  alert: function () {
					  	return alert;
					  }
					}
				});
				modalInstance.result.then(function (selectedItem) {
//					$scope.selected = selectedItem;
				}, function () {
//					$log.info('Modal dismissed at: ' + new Date());
				});
			}, 
			alertSave: function(alert, user) {
				alert.user = { 
					"first_name": user.first_name, 
					"last_name": user.name, 
					"id": user.id
				}
				
				alert.dates.modified = Utils.dateToTimestamp(new Date());  
				
//				var alertIndex = Utils.objectIndexbyKey(alerts, "id", alert.id); 
//				alerts[alertIndex] = alert; 
										
				alert.$update({ 'type': 'alert' }, function(elm, response) {
					var toasterMessage; 
					
					if (response("X-Clear-updatedAlert")==="success") toasterMessage = "Alert update";
					else if (response("X-Clear-updatedAlert")==="warning") toasterMessage = "Alert did not update";
					else if (response("X-Clear-updatedAlert")==="error") toasterMessage = "Alert did not update";
					
					if (response("X-Clear-updatedAlert")) toaster.pop(response("X-Clear-updatedAlert"), toasterMessage, alert.name);
				});
			}, 
			alertDelete: function(alert, alerts) {
				alert.$delete({"type": "alert"}, function(elm, response) {
					var toasterMessage; 
					var toasterResponse = response("X-Clear-updatedAlert"); 
					
					if (toasterResponse==="success") toasterMessage = "Deleted alert";
					else if (toasterResponse==="warning") toasterMessage = "Alert did not deleted";
					else if (toasterResponse==="error") toasterMessage = "Alert did not deleted";
					
					if (toasterResponse) toaster.pop(toasterResponse, toasterMessage, alert.name);
					if (!elm.id) {
						alerts.splice(Utils.objectIndexbyKey(alerts, "id", alert.id), 1);
					}
				});
			}
		}
	}])
	
	.factory('ClearDocument', ['$rootScope', '$modal', 'Utils', 'ClearUrl', 'toaster', function($rootScope, $modal, Utils, ClearUrl, toaster){
		
		return {
			documentModalUpload: function(type, user) { 
				var modalInstance = $modal.open({
					templateUrl: 'partials/document-modal-upload.html',
					controller: 'DocumentModalUploadCtrl',
					resolve: {
					  type: function () {
					  	return type;
					  }, 
					  user: function () {
					  	return user;
					  }
					}
				});
				modalInstance.result.then(function (selectedItem) {
//					$scope.selected = selectedItem;
				}, function () {
//					$log.info('Modal dismissed at: ' + new Date());
				});
			}, 
			documentUploadSave: function(doc, type, user) {
				doc.user = { 
					"first_name": user.first_name, 
					"last_name": user.last_name, 
					"id": user.id
				}
				
				doc.dates = { "created": Utils.dateToTimestamp(new Date()) };  
										
				doc.$save({ "format": "documents", "type": "media", "id": "new" }, function(doc, response) {
					var toasterMessage; 
					
					if (response("X-Clear-updatedDocument")==="success") toasterMessage = "Document uploaded";
					else if (response("X-Clear-updatedDocument")==="warning") toasterMessage = "Document did not upload";
					else if (response("X-Clear-updatedDocument")==="error") toasterMessage = "Document did not upload";
					
					if (response("X-Clear-updatedDocument")) toaster.pop(response("X-Clear-updatedDocument"), toasterMessage, doc.name);
					console.log("success");
					$rootScope.$broadcast('event:urlSet', {}, "documents");
				}, function() {
					console.log("error");
					toaster.pop("error", "Nothing uploaded");
				});
			}
		}
	}])
	
	.factory('ChartsConfig', function(){
		var colorArrayBrand = ['#FFCC0F', '#C79F25', '#705A11', '#9C863D', '#BCAD74', '#FFE699'],
			colorArrayOrder = ['#FF7F00', '#C96301', '#703700', '#9D6826', '#BC9461', '#FFBF81'],
			colorArrayShipment = ['#7EDF02', '#65AD01', '#366201', '#688F25', '#95B164', '#BFEF81'],
			colorArrayBox = ['#36BFE3', '#3194A7', '#1C554F', '#4F8180', '#82A9A8', '#A0DFF0'],
			colorArrayItem = ['#FF7D9F', '#C66378', '#6F373A', '#9B6865', '#BD9595', '#FFBED0'];
		
		return {
			colors: { 
				brand: function() {
					return function(d, i) {
						return colorArrayBrand[i];
					};
				},
				order: function() {
					return function(d, i) {
						return colorArrayOrder[i];
					};
				},
				shipment: function() {
					return function(d, i) {
						return colorArrayShipment[i];
					};
				},
				box: function() {
					return function(d, i) {
						return colorArrayBox[i];
					};
				},
				item: function() {
					return function(d, i) {
						return colorArrayItem[i];
					};
				}
			}, 
			tooltips: {
				pieChart: function(){
					return function(key, x, y, e, graph) {
						return  '<h6>' + key + '</h6>' + '<p>' + x + '</p>'
					}
				},
				hBarChart: function(){
					return function(key, x, y, e, graph) {
						return  '<h6>' + key + '</h6>' + '<p>' +  y + '</p>'
					}
				},
				vBarChart: function(){
					return function(key, x, y, e, graph) {
						return  '<h6>' + x + ' / ' + key + '</h6>' + '<p>' +  y + '</p>'
					}
				}
			}, 
			chartFn: function (datas) {
				datas.xFunction = function(){
					return function(d) {
						return d.key;
					};
				}
				datas.yFunction = function(){
					return function(d) {
						return d.value;
					};
				}
				datas.descriptionFunction = function(){
					return function(d){
						return d.key;
					}
				}
			}
		}
	})
	.factory('Dashboard', ['$resource', function($resource){
		return $resource('json/elms_tv.json');
	}])
	.factory('GlobalReports', ['$resource', function($resource){
		return $resource('json/global_reports.json');
	}])
	.factory('IRs', ['$resource', function($resource){
		return $resource('json/documents_irs.json');
	}])
	.factory('FiltersIRs', ['$resource', function($resource){
		return $resource('json/documents_irs_filters.json');
	}])
	.factory('IR', ['$resource', function($resource){
		return $resource('json/documents_ir.json');
	}])
	.factory('NCRs', ['$resource', function($resource){
		return $resource('json/documents_ncrs.json');
	}])
	.factory('FiltersNCRs', ['$resource', function($resource){
		return $resource('json/documents_ncrs_filters.json');
	}])
	.factory('Archives', ['$resource', function($resource){
		return $resource('json/documents_archives.json');
	}])
	.factory('FiltersArchives', ['$resource', function($resource){
		return $resource('json/documents_archives_filters.json');
	}])
	.factory('Medias', ['$resource', function($resource){
		return $resource('json/documents_medias.json');
	}])
	.factory('FiltersMedias', ['$resource', function($resource){
		return $resource('json/documents_medias_filters.json');
	}])
	.factory('Alert', ['$resource', function($resource){
		return $resource('json/alert.json');
	}])
	.factory('Alerts', ['$resource', function($resource){
		return $resource('json/alerts.json');
	}])
	.factory('FiltersAlerts', ['$resource', function($resource){
		return $resource('json/alerts_filters.json');
	}])
	.factory('NCR', ['$resource', function($resource){
		return $resource('json/documents_ncr.json');
	}])
	.factory('PODs', ['$resource', function($resource){
		return $resource('json/documents_pods.json');
	}])
	.factory('FiltersPODs', ['$resource', function($resource){
		return $resource('json/documents_pods_filters.json');
	}])
	.factory('POD', ['$resource', function($resource){
		return $resource('json/documents_pod.json');
	}])
	.factory('Indicators', ['$resource', function($resource){
		 return $resource('json/indicators.json');
	}])
	.factory('Elms', ['$resource', function($resource){
		return $resource('json/elms.json');
	}])
	.factory('ElmsOrder', ['$resource', function($resource){
		return $resource('json/elms_order.json');
	}])
	.factory('ElmsShipment', ['$resource', function($resource){
		return $resource('json/elms_shipment.json');
	}])
	.factory('ElmsBox', ['$resource', function($resource){
		return $resource('json/elms_box.json');
	}])
	.factory('ElmsItem', ['$resource', function($resource){
		return $resource('json/elms_item.json');
	}])
	.factory('FiltersOrder', ['$resource', function($resource){
		return $resource('json/elms_order_filters.json');
	}])
	.factory('FiltersShipment', ['$resource', function($resource){
		return $resource('json/elms_shipment_filters.json');
	}])
	.factory('FiltersBox', ['$resource', function($resource){
		return $resource('json/elms_box_filters.json');
	}])
	.factory('FiltersItem', ['$resource', function($resource){
		return $resource('json/elms_item_filters.json');
	}])
	.factory('Bugs', ['$resource', function($resource){
		return $resource('json/bugs.json');
	}])
	.factory('ElmsListsConfig', ['$resource', function($resource){
		return $resource('json/elms_conf.json');
	}])
	.factory('AlertsConfig', ['$resource', function($resource){
		return $resource('json/alerts_conf.json');
	}])
	.factory('DocumentsConfig', ['$resource', function($resource){
		return $resource('json/documents_conf.json');
	}])
	.factory('Elm', ['$resource', function($resource){
		return $resource('json/elm.json', 
			{}, 
			{
				update: { method: 'PUT' }, 
				updateList: { method: 'PUT', isArray: true }
			});
	}])
	.factory('SearchFilters', ['$resource', function($resource){
		return $resource('json/filters.json');
	}])
	.factory('GuidelinesProcess', ['$resource', function($resource){
		return $resource('json/guidelines_process.json');
	}])
	.factory('GuidelinesWeb', ['$resource', function($resource){
		return $resource('json/guidelines_web.json');
	}])
	.factory('GuidelinesMobile', ['$resource', function($resource){
		return $resource('json/guidelines_mobile.json');
	}])
	.factory('News', ['$resource', function($resource){
		return $resource('json/news.json');
	}])
	.value('version', '2.4');