'use strict';

/* Controllers */

angular.module('clearApp.controllersStock', [])	
				
		.controller('StockWarehousesCtrl', ['$scope', '$filter', '$routeParams', 'ClearUrl', 'S1', 'Utils', function($scope, $filter, $routeParams, ClearUrl, S1, Utils) {
			
			$scope.$emit("event:sectionUpdate", "stock");
			
			$scope.loaded = false;
			
			var type = 'warehouse'; 
			$scope.type = type; 
			$scope.name = 'Warehouses'; 
			
			S1.query({ "type": "warehouse" }, function(warehouses) {
				$scope.warehouses = warehouses; 
				$scope.loaded = true;
			});
		}])
		
		.controller('StockMovementsCtrl', ['$scope', '$filter', '$routeParams', 'ClearUrl', 'Utils', 'MovementsConf', 'S1', function($scope, $filter, $routeParams, ClearUrl, Utils, MovementsConf, S1) {
			$scope.$emit("event:sectionUpdate", "stock");
			
			$scope.loaded = false;
			ClearUrl.listReady('init', ['movements']);
	
			MovementsConf.get( function(config) {
				var listConfig = Utils.clone(config); 
				listConfig.type = "movement";
				listConfig.name = "Movements";  
				listConfig.id = "movements";
				listConfig.resource = S1; 
				$scope.$broadcast('event:ListInit', listConfig.id);
				ClearUrl.listReady('conf', listConfig); 
			}); 
		}])
		
		.controller('StockReplenishmentsCtrl', ['$scope', '$filter', '$routeParams', 'ClearUrl', 'Utils', 'ReplenishmentsConf', 'S1', function($scope, $filter, $routeParams, ClearUrl, Utils, ReplenishmentsConf, S1) {
		
			$scope.$emit("event:sectionUpdate", "stock");
			
			$scope.loaded = false;
			ClearUrl.listReady('init', ['replenishments']);
	
			ReplenishmentsConf.get( function(config) {
				var listConfig = Utils.clone(config); 
				listConfig.type = "replenishment";
				listConfig.name = "Replenishments";  
				listConfig.id = "replenishments";
				listConfig.resource = S1; 
				$scope.$broadcast('event:ListInit', listConfig.id);
				ClearUrl.listReady('conf', listConfig); 
			}); 
		}])
		
		.controller('StockItemsCtrl', ['$scope', '$routeParams', 'ClearUrl', 'Utils', 'ItemsConf', 'S1', function($scope, $routeParams, ClearUrl, Utils, ItemsConf, S1) {
		
			$scope.$emit("event:sectionUpdate", "stock");
			
			ClearUrl.listReady('init', ['items']);
			
			var type = $routeParams.type; 
			$scope.type = 'item'; 
			$scope.name = 'Items'; 		
	
			ItemsConf.get( function(conf) {
				var listConf = Utils.clone(conf); 
				listConf.type = $scope.type;
				listConf.name = $scope.name;  
				listConf.id = "items";
				listConf.resource = S1; 
				$scope.$broadcast('event:ListInit', listConf.id);
				ClearUrl.listReady('conf', listConf); 
			}); 
		}])
		
		.controller('StockItemCtrl', ['$scope', '$routeParams', '$location', '$interval', '$timeout', '$modal', 'S1', 'Utils', 'ClearUrl', 'TransportElement', 'ClearToken', 'ElmsConf', 'ChartsConfig', function($scope, $routeParams, $location, $interval, $timeout, $modal, S1, Utils, ClearUrl, TransportElement, ClearToken, ElmsConf, ChartsConfig) {
		
			$scope.$emit("event:sectionUpdate", "stock");
			$scope.loaded = false;
			$scope.relatedActiveTab = {};
			
			$scope.dateToTimestamp = Utils.dateToTimestamp;
			
			var imgToken = '?oauth_token=' + ClearToken.returnToken();
			
			S1.get({ "type": "item", "id": $routeParams.id }, function(elm) {
				elm = TransportElement.elementUpdate(elm);
				
				$scope.elm = elm;
				
				for (var i in elm.movements) {
					if(elm.movements[i].out) {
						elm.movements[i].out.image.url += imgToken;
						console.log('image: ', elm.movements[i].out.image.url); 
					}
				}
				
				if (elm.related) {
					var lists = []
					for (var i in elm.related) {
						lists.push(elm.related[i].type); 
					}
				}
				
				if (elm.indicators) {
					
					$scope.charts = [];
					
					for(var i  in elm.indicators) {
						ChartsConfig.chartFn(elm.indicators[i]); 
						$scope.charts[elm.indicators[i].id] = elm.indicators[i];
					}
					
					$scope.colors = ChartsConfig.colors;
					$scope.tooltips = ChartsConfig.tooltips;
					$scope.yAxisTickFormatFunction = function(){
					    return function(d){
					        return d3.format('d')(d);
					    }
					}
					$scope.xAxisTickFormatFunction = function(){
					    return function(d){
					        return d3.time.format("%d.%m.%Y")(new Date(d));
					    }
					}
				}
	
				$scope.propertySave = function(elm, property, groupName) {
					TransportElement.propertySave(elm, property, groupName);
				}
				
				$scope.loaded = true;
			});	
		}])
		
		.controller('StockWarehouseCtrl', ['$scope', '$routeParams', '$location', '$timeout', '$anchorScroll', '$modal', '$q', 'S1', 'Utils', 'ClearUrl', 'ReplenishmentsConf', 'MovementsConf', 'ItemsConf', function($scope, $routeParams, $location, $timeout, $anchorScroll, $modal, $q, S1, Utils, ClearUrl, ReplenishmentsConf, MovementsConf, ItemsConf) {
		
			$scope.$emit("event:sectionUpdate", "stock");
			
			$scope.loaded = false;
			$scope.relatedActiveTab = {};
			ClearUrl.listReady('init', ['replenishment', 'movement', 'item']);
	
			$scope.dateToTimestamp = Utils.dateToTimestamp;
			
			S1.get({'type': 'warehouse', "id": $routeParams.id }, function(warehouse) {
				
				$scope.warehouse = warehouse;
				
				var confs = {
					"item": ItemsConf, 
					"replenishment": ReplenishmentsConf, 
					"movement": MovementsConf
				}
				var listCodes = {
					"item": "I", 
					"replenishment": "R", 
					"movement": "M"
				}
	
				var listsConfig = []; 
				for (var i in warehouse.related) {
					confs[warehouse.related[i].type].get(function(conf) { 
						var type = conf.type; 
						listsConfig[type] = Utils.clone(conf);
						listsConfig[type].related = warehouse.type; 
						listsConfig[type].related_id = warehouse.id; 
						listsConfig[type].type = type;
						listsConfig[type].id = type;
						listsConfig[type].name = warehouse.related[i].name;
						listsConfig[type].listCode = listCodes[type];
						listsConfig[type].resource = S1;
						ClearUrl.listReady('conf', listsConfig[type]); 
					});
				}
				$scope.loaded = true;
			});	
		}])
		
		.controller('StockIndicatorsCtrl', ['$scope', '$routeParams', 'S1', 'ChartsConfig', function($scope, $routeParams, S1, ChartsConfig) {
		
			$scope.$emit("event:sectionUpdate", "stock");
			$scope.loaded = false;
			$scope.charts = [];
			
			S1.query({'type': 'kpi'}, function(charts){
				for(var i = 0, len = charts.length; i < len; ++i) {
					ChartsConfig.chartFn(charts[i]); 
					$scope.charts[charts[i].id] = charts[i];
				}
				$scope.loaded = true;
				console.log('charts: ', charts);
			});	
			$scope.colors = ChartsConfig.colors;
			$scope.tooltips = ChartsConfig.tooltips;
			$scope.yAxisTickFormatFunction = function(){
			    return function(d){
			        return d3.format('d')(d);
			    }
			}
			$scope.xAxisTickFormatFunction = function(){
			    return function(d){
			        return d3.time.format("%d.%m.%Y")(new Date(d));
			    }
			}
		}])
		;