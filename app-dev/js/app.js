'use strict';


// Declare app level module which depends on filters, and services
angular.module('clearApp', [ 
	'ngRoute', 'ngAnimate', 'ngCookies', 
	'ui.bootstrap', 'angularFileUpload', 'nvd3ChartDirectives', 'toaster', 'chieffancypants.loadingBar', 'http-auth-interceptor', 
	'clearApp.filters', 'clearApp.services', 'clearApp.directives', 'clearApp.controllers', 
	'clearApp.controllersTransport', 'clearApp.servicesTransport', 'clearApp.directivesTransport',
	'clearApp.controllersStock', 'clearApp.servicesStock', 'clearApp.directivesStock', 
	// @if DEBUG
	'clearApp.mock'  // Won't be included in production builds
	// @endif
	])
	.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
	
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
		
		// global sections
		
		$routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard.html', controller: 'DashboardCtrl' });
		
		$routeProvider.when('/bug', {templateUrl: 'partials/bugs.html', controller: 'BugsCtrl' });
		
		$routeProvider.when('/guidelines', {templateUrl: 'partials/guidelines-list.html', controller: 'GuidelinesListCtrl'});
		
		$routeProvider.when('/guidelines/process', {templateUrl: 'partials/guidelines-process.html', controller: 'GuidelinesProcessCtrl'});
		
		$routeProvider.when('/guidelines/:id', {templateUrl: 'partials/guidelines-operations.html', controller: 'GuidelinesOperationsCtrl'});
		
		$routeProvider.when('/user', {templateUrl: 'partials/user.html', controller: 'UserDetailCtrl'});
		
		// Transport section
		
		$routeProvider.when('/transport/dashboard', {templateUrl: 'partials/transport/dashboard.html', controller: 'TransportDashboardCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/transport/tv', {templateUrl: 'partials/transport/dashboard-tv.html', controller: 'TransportDashboardTvCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/transport/tracking', {templateUrl: 'partials/transport/elements-tracking.html', controller: 'TransportTrackingCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/transport/indicators', {templateUrl: 'partials/transport/indicators.html', controller: 'TransportIndicatorsCtrl'});
		
		$routeProvider.when('/transport/search', {templateUrl: 'partials/transport/elements-search.html', controller: 'TransportSearchCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/transport/documents/:type', {templateUrl: 'partials/transport/documents.html', controller: 'TransportDocumentsCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/transport/documents/ir/:id', {templateUrl: 'partials/transport/documents-ir.html', controller: 'TransportDocumentsIrCtrl'});
		
		$routeProvider.when('/transport/documents/ncr/:id', {templateUrl: 'partials/transport/documents-ncr.html', controller: 'TransportDocumentsNcrCtrl'});
		
		$routeProvider.when('/transport/documents/pod/:id', {templateUrl: 'partials/transport/documents-pod.html', controller: 'TransportDocumentsPodCtrl'});
		
		$routeProvider.when('/transport/add-order', {templateUrl: 'partials/transport/elements-order-add.html', controller: 'TransportOrderAddCtrl'});
		
		$routeProvider.when('/transport/alerts', {templateUrl: 'partials/transport/alerts.html', controller: 'TransportAlertsCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/transport/:type/', {templateUrl: 'partials/transport/elements.html', controller: 'TransportElementsCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/transport/:type/:id', {templateUrl: 'partials/transport/element.html', controller: 'TransportElementCtrl', reloadOnSearch: false});
		
		// Stock section 
		
		$routeProvider.when('/stock/warehouses', {templateUrl: 'partials/stock/warehouses.html', controller: 'StockWarehousesCtrl'});
		
		$routeProvider.when('/stock/warehouses/:id', {templateUrl: 'partials/stock/warehouse.html', controller: 'StockWarehouseCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/stock/movements', {templateUrl: 'partials/stock/movements.html', controller: 'StockMovementsCtrl'});
		
		$routeProvider.when('/stock/replenishments', {templateUrl: 'partials/stock/replenishments.html', controller: 'StockReplenishmentsCtrl'});
		
		$routeProvider.when('/stock/items', {templateUrl: 'partials/stock/items.html', controller: 'StockItemsCtrl'});
		
		$routeProvider.when('/stock/items/:id', {templateUrl: 'partials/stock/item.html', controller: 'StockItemCtrl'});
		
		$routeProvider.when('/stock/indicators', {templateUrl: 'partials/stock/indicators.html', controller: 'StockIndicatorsCtrl'});
		
		$routeProvider.otherwise({redirectTo: '/dashboard'});
	}]);