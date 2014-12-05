'use strict';


// Declare app level module which depends on filters, and services
angular.module('clearApp', [ 
	'ngRoute', 'ngAnimate', 'ngCookies', 
	'mgcrea.ngStrap', 'angularFileUpload', 'nvd3ChartDirectives', 'toaster', 'chieffancypants.loadingBar', 'http-auth-interceptor', 'modules', 
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
		
		$routeProvider.when('/dashboard', {templateUrl: 'core/html/dashboard.html', controller: 'DashboardCtrl' });
		
		$routeProvider.when('/user', {templateUrl: 'core/html/user.html', controller: 'UserDetailCtrl'});

		$routeProvider.when('/guidelines', {templateUrl: 'core/html/guidelines.html', controller: 'GuidelinesCtrl'});
		
		// Transport section
		
		$routeProvider.when('/transport/dashboard', {templateUrl: 'modules/transport/html/dashboard.html', controller: 'TransportDashboardCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/transport/tv', {templateUrl: 'modules/transport/html/dashboard-tv.html', controller: 'TransportDashboardTvCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/transport/tracking', {templateUrl: 'modules/transport/html/elements-tracking.html', controller: 'TransportTrackingCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/transport/indicators', {templateUrl: 'modules/transport/html/indicators.html', controller: 'TransportIndicatorsCtrl'});
		
		$routeProvider.when('/transport/search', {templateUrl: 'modules/transport/html/elements-search.html', controller: 'TransportSearchCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/transport/documents/:type', {templateUrl: 'modules/transport/html/documents.html', controller: 'TransportDocumentsCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/transport/documents/ir/:id', {templateUrl: 'modules/transport/html/documents-ir.html', controller: 'TransportDocumentsIrCtrl'});
		
		$routeProvider.when('/transport/documents/ncr/:id', {templateUrl: 'modules/transport/html/documents-ncr.html', controller: 'TransportDocumentsNcrCtrl'});
		
		$routeProvider.when('/transport/documents/pod/:id', {templateUrl: 'modules/transport/html/documents-pod.html', controller: 'TransportDocumentsPodCtrl'});
		
		$routeProvider.when('/transport/add-order', {templateUrl: 'modules/transport/html/elements-order-add.html', controller: 'TransportOrderAddCtrl'});
		
		$routeProvider.when('/transport/alerts', {templateUrl: 'modules/transport/html/alerts.html', controller: 'TransportAlertsCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/transport/:type/', {templateUrl: 'modules/transport/html/elements.html', controller: 'TransportElementsCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/transport/:type/:id', {templateUrl: 'modules/transport/html/element.html', controller: 'TransportElementCtrl', reloadOnSearch: false});

		$routeProvider.when('/guidelines/transport', {templateUrl: 'modules/transport/html/guidelines-list.html', controller: 'TransportGuidelinesListCtrl'});
		
		$routeProvider.when('/guidelines/transport/process', {templateUrl: 'modules/transport/html/guidelines-process.html', controller: 'TransportGuidelinesProcessCtrl'});
		
		$routeProvider.when('/guidelines/transport/:id', {templateUrl: 'modules/transport/html/guidelines-operations.html', controller: 'TransportGuidelinesOperationsCtrl'});
		
		// Stock section 
		
		$routeProvider.when('/stock/warehouses', {templateUrl: 'modules/stock/html/warehouses.html', controller: 'StockWarehousesCtrl'});
		
		$routeProvider.when('/stock/warehouses/:id', {templateUrl: 'modules/stock/html/warehouse.html', controller: 'StockWarehouseCtrl', reloadOnSearch: false});
		
		$routeProvider.when('/stock/movements', {templateUrl: 'modules/stock/html/movements.html', controller: 'StockMovementsCtrl'});
		
		$routeProvider.when('/stock/replenishments', {templateUrl: 'modules/stock/html/replenishments.html', controller: 'StockReplenishmentsCtrl'});
		
		$routeProvider.when('/stock/items', {templateUrl: 'modules/stock/html/items.html', controller: 'StockItemsCtrl'});
		
		$routeProvider.when('/stock/items/:id', {templateUrl: 'modules/stock/html/item.html', controller: 'StockItemCtrl'});
		
		$routeProvider.when('/stock/indicators', {templateUrl: 'modules/stock/html/indicators.html', controller: 'StockIndicatorsCtrl'});
		
		$routeProvider.otherwise({redirectTo: '/dashboard'});
	}])
	.config(function($datepickerProvider) {
	  angular.extend($datepickerProvider.defaults, {
	    dateFormat: 'dd.MM.yy',
	    autoclose: true, 
	    useNative: true
	  });
	});