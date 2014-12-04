'use strict';

/* Services */

angular.module('clearApp.services', ['ngResource'])
	
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
	
	.factory('ClearList', ['$filter', '$rootScope', '$q', 'toaster', 'Utils', 'ClearToken', function($filter, $rootScope, $q, toaster, Utils, ClearToken){
		
		return {
		
			listElementsLoad: function (listConfig) {
				var list = listConfig;
				var q=$q.defer();
				var listQuery = { 'type': listConfig.type }; 
				if (listConfig.format) listQuery.format = listConfig.format; 
				
				listQuery = Utils.collect(listQuery, listConfig.urlParams); 
				
				if (listConfig.related) {
					listQuery.related = listConfig.related; 
					listQuery.related_id = listConfig.related_id; 
				} 
			 	listConfig.resource.query( listQuery, function(elements, response) {
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
					q.resolve(list);
				});
				return q.promise;
			},
			
			listFiltersLoad: function(listConfig) { 
				var that = this;
				var filters = {}; 
				var q=$q.defer();
				var listQuery = { 'type': listConfig.type, 'id': 'filter' }; 
				if (listConfig.format) listQuery.format = listConfig.format; 
				
				listConfig.resource.get( listQuery, function(elmFilters) { 
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
				console.log('stuffs: ', list, idsArray, propertyUpdate, selectGlobal, urlParams); 
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

				list.resource.updateList(parameters, elements, function(elms, response) {
					var propertyMessage; 
					var elementsType = list.elements.length + " " + list.type; 
					
					if (response("X-Clear-updatedElements")) elementsType = "on " + response("X-Clear-updatedElements");
					
					if (response("X-Clear-updatedProperty")==="success") propertyMessage = "Properties updated" + elementsType;
					else if (response("X-Clear-updatedProperty")==="warning") propertyMessage = "Property was not updated" + elementsType;
					else if (response("X-Clear-updatedProperty")==="error") propertyMessage = "Property was not updated" + elementsType;
					
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
		var lists = [];
		return {
		
			listReady: function(p, param) {
				var ready = function(list) {
					if (list.id && list.conf) {
						$rootScope.$broadcast('event:listReady_' + list.id, list.conf);
					}
				}
				if (p === 'init') { 
					lists = []; 
					for (var i in param) {
						lists[param[i]] = {};
					}
					console.log('lists: ', lists);
				} else if (p === 'conf') { 
					lists[param.id].conf = param;
					ready(lists[param.id]); 
				} else if (p === 'id') { 
					lists[param.id].id = param.id;
					ready(lists[param.id]); 
				}
			}, 
			
			listsUrlSet: function(urlParams, listConf) {
				var urlPage = $location.search();
				
				if (listConf.listCode) {
					var urlList = {}		
					for (var i in urlPage) {
						var code = i.slice(1,2); 
						if (code === listConf.listCode) { 
							var param = i.slice(3, i.length); 
							urlList[param] = urlPage[i]; 
							delete urlPage[i]; 
						}
					}
					if (Utils.isEmpty(urlParams)) urlParams = urlList; 
					urlParams = Utils.collect(listConf.urlInit, urlParams); 
					
					for (i in urlParams) {
						urlPage['_' + listConf.listCode + '_' + i] = urlParams[i]; 
					}
					$location.search(urlPage);
				} else {
					if (Utils.isEmpty(urlParams)) urlParams = urlPage; 
					urlParams = Utils.collect(listConf.urlInit, urlParams); 
					$location.search(urlParams);
				}
				$location.replace();			
				listConf.urlParams = urlParams; 	
				return listConf; 
			}, 
			
			go: function (url, id, related) {
				$rootScope.tvScreen = false;
				$location.$$search = {};
				$location.path( url + '/' + id );
// remove this hack asap
				if (related) {
					$location.search('related_type_active', related).hash('related');
				}
//
			}
		}
	}])

	.value('version', '2.4')
	
	;