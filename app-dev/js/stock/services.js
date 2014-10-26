'use strict';

/* Services */

angular.module('clearApp.servicesStock', ['ngResource'])
	
	.factory('S1', ['$resource', function($resource) {
		return $resource('../index_rest.php/api/stock/v1/:type/:id', { type:'@type', id:'@id' }, 
		{
			update: { method: 'PUT' }, 
			updateList: { method: 'PUT', isArray: true }
		});
	}])
	
	.factory('ItemsConf', ['$resource', function($resource){
		return $resource('json/stock/items_conf.json');
	}])
	
	.factory('MovementsConf', ['$resource', function($resource){
		return $resource('json/stock/movements_conf.json');
	}])
	
	.factory('ReplenishmentsConf', ['$resource', function($resource){
		return $resource('json/stock/replenishments_conf.json');
	}])
	
	
	;