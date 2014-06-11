'use strict';

/* Services */

angular.module('clearApp.services', ['ngResource'])
	.factory('E1', ['$resource', function($resource) {
		return $resource('../index_rest.php/api/clear/v1/:type/:id', { type:'@type', id:'@id' });
	}])
	.factory('E2', ['$resource', function($resource) {
		return $resource('../index_rest.php/api/clear/v2/:format/:type/:id', 
			{ format:'@format', type:'@type', id:'@id' }, 
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
	
	.factory('ClearListsFn', ['$filter', '$rootScope', '$location', '$q', 'toaster', 'E1', 'E2', 'ElmsOrder', 'FiltersOrder', 'ElmsShipment', 'FiltersShipment', 'ElmsBox', 'FiltersBox', 'ElmsItem', 'FiltersItem', 'IRs', 'FiltersIRs', 'PODs', 'FiltersPODs', 'NCRs', 'FiltersNCRs', 'Archives', 'FiltersArchives', 'Utils', 'ClearFn', function($filter, $rootScope, $location, $q, toaster, E1, E2, ElmsOrder, FiltersOrder, ElmsShipment, FiltersShipment, ElmsBox, FiltersBox, ElmsItem, FiltersItem, IRs, FiltersIRs, PODs, FiltersPODs, NCRs, FiltersNCRs, Archives, FiltersArchives, Utils, ClearFn){
		
		return {
			listElementsLoad: function (listConfig) {
				var resources = { "1": E1, "2": E2, "6": ElmsOrder, "7": ElmsShipment, "8": ElmsBox, "9": ElmsItem, "10": IRs, "11": PODs, "12": NCRs, "13": Archives }; 
				var list = listConfig;
				var q=$q.defer();
				var listQuery = { 'type': listConfig.type, 'format': listConfig.format }; 
				
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
							elements[i].url = elements[i].url + '?oauth_token=' + ClearFn.returnToken();
						}
					}
					list.elements = elements; 
					q.resolve(list);
				});
				return q.promise;
			},
			listFiltersLoad: function(listConfig) {
				var resources = { "1": E1, "2": E2, "6": FiltersOrder, "7": FiltersShipment, "8": FiltersBox, "9": FiltersItem, "10": FiltersIRs, "11": FiltersPODs, "12": FiltersNCRs, "13": FiltersArchives }; 
				var that = this;
				var filters = {}; 
				var q=$q.defer();
				resources[listConfig.resource].get({'format': listConfig.format, 'type': listConfig.type, 'id': 'filter'}, 
					function(values) { 
						filters.values = values; 
						filters.badges = that.listFiltersBadgesInit(listConfig.urlParams, listConfig.filters, values);
						filters.date = that.listFiltersDateInit(listConfig.urlParams, listConfig.filters);
						filters.tmp = that.listFiltersTmpInit(listConfig.urlParams, listConfig.filters, values);
						filters.tmp.filtersOpen = false; 
						q.resolve(filters);
					}
				);
				return q.promise;
			},
			listFiltersDateInit: function (urlParams, listConfigFilters) {
				var filtersDate = {};
				for (var i in listConfigFilters) {
					if (listConfigFilters[i].type === 'date') {
						filtersDate[listConfigFilters[i].id] = {}; 
						if (urlParams[listConfigFilters[i].id]) filtersDate[listConfigFilters[i].id].value = Utils.timestampToDate(urlParams[listConfigFilters[i].id]);
					}
				} 
				return filtersDate; 
			}, 
			listFiltersTmpInit: function  (urlParams, listConfigFilters, values) {
				var filtersTmp = {};
				filtersTmp.property = {}; 
				if (urlParams.property_name) {
					var p = values.properties;
					filtersTmp.property = p[Utils.objectIndexbyKey(p, 'name', urlParams.property_name)];
					filtersTmp.property.value;
				}
				return filtersTmp;
			}, 
			listFiltersBadgesInit: function(urlParams, listConfigFilters, filters) {
				var badges = [];
				for (var i in listConfigFilters) {
					var p = listConfigFilters[i];
					if (urlParams.hasOwnProperty(p.id)) {
						switch (p.type) {
							case 'date': 
								badges.push({'id': p.id, 'name': p.name + ': ' + $filter('date')(urlParams[p.id]*1000, 'dd.MM.yy') });
							break;
							case 'byId':
								badges.push({'id': p.id, 'name': p.name + ': ' + Utils.objectByKey(filters[p.filterName].values, "id", urlParams[p.id]).name });
							break;
							default:
								badges.push({'id': p.id, 'name': p.name + ': ' + urlParams[p.id] });
						}
					}
				}				
				if (urlParams.hasOwnProperty('related_reference')) 
					badges.push({'id': 'related_reference', 'name': urlParams.related_to + ' reference: ' + urlParams.related_reference });
				return badges;
			}, 
			listCleanUrl: function(urlParams) {
				for (var i in urlParams) {
				    if (!urlParams[i]) {
				     	delete urlParams[i];
				     	
				     	if (urlParams[i]===null || (i === 'related_reference' && !urlParams[i])) {
					    	delete urlParams[i]
					    }
				    }
				}
				if (!urlParams.hasOwnProperty('property_name')) {
					delete urlParams['property_value'];
					delete urlParams['property_from'];
					delete urlParams['property_to'];
					delete urlParams['property_group'];
				}
					
				if (!urlParams.hasOwnProperty('related_reference')) { 
					delete urlParams['related_to'];
				}
			}, 
			listPropertySave: function(list, idsArray, property) {
				var elements = []
				for (var i in idsArray) {
					elements.push(Utils.objectByKey(list.elements, 'id', idsArray[i]));
				}

				E2.updateList({ 'type': list.type, 'id': 'updateList', 'format': list.format, 'ids': idsArray.join(), 'propertyId': property.id, 'propertyValue': property.value }, elements, function(elms, response) {
					var propertyMessage; 
					var elementsType = list.elements.length + " " + list.type; 
					
					if (response("X-Clear-updatedElements")) elementsType = "on " + response("X-Clear-updatedElements");
					
					if (response("X-Clear-updatedProperty")==="success") propertyMessage = "Updated properties" + elementsType;
					else if (response("X-Clear-updatedProperty")==="warning") propertyMessage = "Property has not been updated" + elementsType;
					else if (response("X-Clear-updatedProperty")==="error") propertyMessage = "Property has not been updated" + elementsType;
					
					if (response("X-Clear-updatedProperty")) toaster.pop(response("X-Clear-updatedProperty"), propertyMessage, property.name);
				}); 
			}
		}
	}])
	
	.factory('ClearFn', ['$rootScope', '$location', '$modal', '$q', 'toaster', 'Utils', function($rootScope, $location, $modal, $q, toaster, Utils){
		
		var parentReady, listsReady=[], token; 
		
		return {
			updateToken: function(t) {
				token = t;
			},
			returnToken: function() {
				return token;
			},
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
			listsUrlSet: function(urlParams, listId, listConfig) {
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
			},
			detailUpdate: function(elm) {
				var self = this;
				self.propertiesDate(elm); 
				self.detailUrlUpdate(elm); 
				self.qrCodeGoogle(elm);
				self.detailTimeline(elm);
				for (var index in elm.charts) {
					self.colorScaleConfig(elm.charts[index], elm.charts[index].value);
				}
				return elm;
			}, 
			detailTimeline: function(elm) {
				if (!elm.anim && elm.timeline) {
					for (var i = 0; i < 4; i++) {
						if (elm.timeline[i].completed) elm.timeline[i].anim = true; 
					}
				} 
				return elm;
			}, 
			detailUrlUpdate: function(elm) {
				if (elm.documents) {
					for (var i in elm.documents) {
						elm.documents[i].url = elm.documents[i].url + '?oauth_token=' + token;
					}
				} 
				return elm;
			}, 
			modalDeleteOpen: function (elm, $event) {   
				console.log('delete');          
				if ($event.stopPropagation) $event.stopPropagation();
				var modalInstance = $modal.open({
					templateUrl: 'partials/tplModalDelete.html',
					controller: 'TplModalDeleteCtrl',
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
			modalConditionOpen: function (elm, required, $event) {            
				if ($event.stopPropagation) $event.stopPropagation();
				if (required.editable || !required.completed) {
					var modalInstance = $modal.open({
						templateUrl: 'partials/tplModalCondition.html',
						controller: 'TplModalConditionCtrl',
						resolve: {
						  required: function () {
							return required;
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
			stopPropagation: function($event) {
				if ($event.stopPropagation) $event.stopPropagation();
			}, 
			trackingToggle: function(elm, $event) {
				if ($event.stopPropagation) $event.stopPropagation(); 
				elm.tracking=!elm.tracking;
			}, 
			propertySave: function(elm, property, group) {
				var self=this;
				$rootScope.currentGroup = group;
				elm.$update({ 'propertyId': property.id, 'propertyValue': property.value }, function(elm, response) {
					var propertyMessage; 
					
					if (response("X-Clear-updatedProperty")==="success") propertyMessage = "Updated property";
					else if (response("X-Clear-updatedProperty")==="warning") propertyMessage = "Property has not been updated";
					else if (response("X-Clear-updatedProperty")==="error") propertyMessage = "Property has not been updated";
					
					if (response("X-Clear-updatedProperty")) toaster.pop(response("X-Clear-updatedProperty"), propertyMessage, property.name);
					
					elm = self.detailUpdate(elm);
				});
			}, 
			requiredSave: function (elm, required) {
				var self=this;
				
				elm.$update({ 'requiredId': required.id, 'requiredValue': required.value }, function(elm, response) {
					var requiredMessage, milestoneMessage; 
					
					if (response("X-Clear-updatedRequired")==="success") requiredMessage = "Updated condition";
					else if (response("X-Clear-updatedRequired")==="warning") propertyMessage = "Condition has not been updated";
					else if (response("X-Clear-updatedRequired")==="error") requiredMessage = "Condition has not been updated";
					
					if (response("X-Clear-updatedMilestone")==="success") milestoneMessage = "Updated milestone";
					else if (response("X-Clear-updatedMilestone")==="warning") propertyMessage = "Milestone has not been updated";
					else if (response("X-Clear-updatedMilestone")==="error") milestoneMessage = "Milestone has not been updated";
					
					if (response("X-Clear-updatedRequired")) toaster.pop(response("X-Clear-updatedRequired"), requiredMessage, required.name);
					if (response("X-Clear-updatedMilestone")) toaster.pop(response("X-Clear-updatedMilestone"), milestoneMessage, response("X-Clear-updatedMilestoneName"));
					
					elm = self.detailUpdate(elm);
				});
			}, 
			go: function (type, id, related) {
				$rootScope.tvScreen = false;
				$location.$$search = {};
				$location.path( type + '/' + id )
				if (related) {
					$location.search('related_type_active', related).hash('related');
				}
				console.log('go ->', type, id, related);
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
	.factory('StaticDashboardList', ['$resource', function($resource){
		return $resource('json/elms_tv.json');
	}])
	.factory('StaticGlobalReports', ['$resource', function($resource){
		return $resource('json/global_reports.json');
	}])
	.factory('IRs', ['$resource', function($resource){
		return $resource('json/documents_inspectionReports.json');
	}])
	.factory('FiltersIRs', ['$resource', function($resource){
		return $resource('json/documents_inspectionReports_filters.json');
	}])
	.factory('IR', ['$resource', function($resource){
		return $resource('json/documents_inspectionReport.json');
	}])
	.factory('NCRs', ['$resource', function($resource){
		return $resource('json/documents_nonConformityReports.json');
	}])
	.factory('FiltersNCRs', ['$resource', function($resource){
		return $resource('json/documents_nonConformityReports_filters.json');
	}])
	.factory('Archives', ['$resource', function($resource){
		return $resource('json/documents_archives.json');
	}])
	.factory('FiltersArchives', ['$resource', function($resource){
		return $resource('json/documents_archives_filters.json');
	}])
	.factory('NCR', ['$resource', function($resource){
		return $resource('json/documents_nonConformityReport.json');
	}])
	.factory('PODs', ['$resource', function($resource){
		return $resource('json/documents_proofsOfDelivery.json');
	}])
	.factory('FiltersPODs', ['$resource', function($resource){
		return $resource('json/documents_proofsOfDelivery_filters.json');
	}])
	.factory('POD', ['$resource', function($resource){
		return $resource('json/documents_proofOfDelivery.json');
	}])
	.factory('StaticIndicators', ['$resource', function($resource){
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
		return $resource('json/filters_order.json');
	}])
	.factory('FiltersShipment', ['$resource', function($resource){
		return $resource('json/filters_shipment.json');
	}])
	.factory('FiltersBox', ['$resource', function($resource){
		return $resource('json/filters_box.json');
	}])
	.factory('FiltersItem', ['$resource', function($resource){
		return $resource('json/filters_item.json');
	}])
	.factory('Bugs', ['$resource', function($resource){
		return $resource('json/bugs.json');
	}])
	.factory('ElmsListsConfig', ['$resource', function($resource){
		return $resource('json/elmsConfig.json');
	}])
	.factory('DocumentsConfig', ['$resource', function($resource){
		return $resource('json/documentsConfig.json');
	}])
	.factory('filtersModifyOrders', ['$resource', function($resource){
		return $resource('json/filters_modify_order.json');
	}])
	.factory('Elm', ['$resource', function($resource){
		return $resource('json/elm.json');
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
	.value('version', '2.7');