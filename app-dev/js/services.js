'use strict';

/* Services */

angular.module('clearApp.services', ['ngResource'])
	.factory('E1', ['$resource', function($resource) {
		return $resource('../index_rest.php/api/clear/v1/:type/:id', { type:'@type', id:'@id' });
	}])
	.factory('Elements', ['$resource', function($resource) {
		return $resource('../index_rest.php/api/clear/v2/:type/:id', 
			{ 	type:'@type', id:'@id' }
		);
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
			is_empty: function (obj) {
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
			IndxOf: function(myArray, searchTerm, property) {
				for(var i = 0, len = myArray.length; i < len; i++) {
					if (myArray[i][property] === searchTerm) return i+1;
				}
				return -1;
			}, 
			collect: function (a,b){
				var c = {};
				for (var att in a) { c[att] = a[att]; }
				for (var att in b) { c[att] = b[att]; }
				return c;
			}, 
			clone: function (obj) {
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
						copy[i] = clone(obj[i]);
					}
					return copy;
				}
			
				// Handle Object
				if (obj instanceof Object) {
					var copy = {};
					for (var attr in obj) {
						if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
					}
					return copy;
				}
			
				throw new Error("Unable to copy obj! Its type isn't supported.");
			}, 
			objectByKey:  function(array, key, value) {
				for (var i in array) {
					if (array[i][key] == value) {
						return array[i];
					}
				}
			}
		}
	})
	.factory('ClearFn', ['$filter', '$rootScope', '$location', '$modal', 'toaster', 'Utils', function($filter, $rootScope, $location, $modal, toaster, Utils){
		return {
			badgesDisplay: function(query, filters) {
				var badges = [];
				
				if (query.reference) badges.push({'name': 'reference', 'display': query.related_to + ' reference: ' + query.reference });
				if (query.location) badges.push({'name': 'location', 'display': 'Location: ' + Utils.objectByKey(filters.locations.values, "id", query.location).name });
				if (query.user) badges.push({'name': 'user', 'display': 'User: ' + Utils.objectByKey(filters.users.values, "id", query.user).name });
				if (query.status) badges.push({'name': 'status', 'display': 'Status: ' + Utils.objectByKey(filters.statuses.values, "id", query.status).name });
				if (query.collection) badges.push({'name': 'collection', 'display': 'Collection: ' + Utils.objectByKey(filters.collections.values, "id", query.collection).name });
				if (query.delivery) badges.push({'name': 'delivery', 'display': 'Delivery: ' + Utils.objectByKey(filters.deliveries.values, "id", query.delivery).name });
				if (query.date_from) badges.push({'name': 'date_from', 'display': 'From: ' + $filter('date')(query.date_from*1000, 'dd.MM.yy') });
				if (query.date_to) badges.push({'name': 'date_to', 'display': 'To: ' + $filter('date')(query.date_to*1000, 'dd.MM.yy') });
				
				return badges;
			}, 
			filterRemove: function(badge, query) {
				delete query[badge];
				if (badge === 'reference') delete query.related_to;
				return query;
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
			trackingToggle: function(elm, $event) {
				if ($event.stopPropagation) $event.stopPropagation(); 
				elm.tracking=!elm.tracking;
			}, 
			propertySave: function(elm, type, group) {
				var self=this;
				$rootScope.currentGroup = group;
				elm.$save({update:type}, function(elm, response) {
					var propertyMessage; 
					
					if (response("X-Clear-updatedProperty")==="success") propertyMessage = "Updated property";
					else if (response("X-Clear-updatedProperty")==="warning") propertyMessage = "Property has not been updated";
					else if (response("X-Clear-updatedProperty")==="error") propertyMessage = "Property has not been updated";
					
					if (response("X-Clear-updatedProperty")) toaster.pop(response("X-Clear-updatedProperty"), propertyMessage, response("X-Clear-updatedPropertyName"));
					
					elm = self.propertiesDate(elm);
				});
			}, 
			requiredSave: function (elm, id) {
				var self=this;
				
				elm.$save({update:'required', update_id:id}, function(elm, response) {
					var requiredMessage, milestoneMessage; 
					
					if (response("X-Clear-updatedRequired")==="success") requiredMessage = "Updated condition";
					else if (response("X-Clear-updatedRequired")==="warning") propertyMessage = "Condition has not been updated";
					else if (response("X-Clear-updatedRequired")==="error") requiredMessage = "Condition has not been updated";
					
					if (response("X-Clear-updatedMilestone")==="success") milestoneMessage = "Updated milestone";
					else if (response("X-Clear-updatedMilestone")==="warning") propertyMessage = "Milestone has not been updated";
					else if (response("X-Clear-updatedMilestone")==="error") milestoneMessage = "Milestone has not been updated";
					
					if (response("X-Clear-updatedRequired")) toaster.pop(response("X-Clear-updatedRequired"), requiredMessage, response("X-Clear-updatedRequiredName"));
					if (response("X-Clear-updatedMilestone")) toaster.pop(response("X-Clear-updatedMilestone"), milestoneMessage, response("X-Clear-updatedMilestoneName"));
					
					elm = self.propertiesDate(elm);
				});
			}, 
			go: function (type, id, related) {
				$rootScope.tvScreen = false;
				$location.$$search = {};
				$location.path( type + '/' + id )
				if (related) {
					$location.search('related_type', related).hash('related');
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
				return 'http://chart.apis.google.com/chart?cht=qr&chs=63x63&chl='+ e + elm.id + '&chld=H%7C0';
			}
		}
	}])
	.factory('ColorScaleConfig', function(){
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
		
		return {
			colorFn: function (value) {
				var colorArrayScale = [ colorWorst, colorBad, colorMedium, colorGood, colorBest ];
				return { 'color': colorArrayScale[snapToGrid(value)] };	
			}, 
			labelFn: function (value) {
				var textArrayScale = [ 'worst', 'bad', 'medium', 'good', 'best' ];
				return textArrayScale[snapToGrid(value)];	
			}, 
			assignProperties: function (object, id) {
				object.color = this.colorFn(object.value); 
				object.label = this.labelFn(object.value);
			}
		}
	})
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
	.factory('InspectionReports', ['$resource', function($resource){
		return $resource('json/documents_inspectionReports.json');
	}])
	.factory('InspectionReportsFilters', ['$resource', function($resource){
		return $resource('json/documents_inspectionReports_filters.json');
	}])
	.factory('InspectionReport', ['$resource', function($resource){
		return $resource('json/documents_inspectionReport.json');
	}])
	.factory('NonComplianceReports', ['$resource', function($resource){
		return $resource('json/documents_nonComplianceReports.json');
	}])
	.factory('NonComplianceReportsFilters', ['$resource', function($resource){
		return $resource('json/documents_nonComplianceReports_filters.json');
	}])
	.factory('NonComplianceReport', ['$resource', function($resource){
		return $resource('json/documents_nonComplianceReport.json');
	}])
	.factory('ProofsOfDelivery', ['$resource', function($resource){
		return $resource('json/documents_proofsOfDelivery.json');
	}])
	.factory('ProofsOfDeliveryFilters', ['$resource', function($resource){
		return $resource('json/documents_proofsOfDelivery_filters.json');
	}])
	.factory('ProofOfDelivery', ['$resource', function($resource){
		return $resource('json/documents_proofOfDelivery.json');
	}])
	.factory('StaticIndicators', ['$resource', function($resource){
		 return $resource('json/indicators.json');
	}])
	.factory('Elms', ['$resource', function($resource){
		return $resource('json/elms.json');
	}])
	.factory('Elm', ['$resource', function($resource){
		return $resource('json/elm.json');
	}])
	.factory('SearchFilters', ['$resource', function($resource){
		return $resource('json/search_filters.json');
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