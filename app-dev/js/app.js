'use strict';


// Declare app level module which depends on filters, and services
angular.module('clearApp', [ 'chieffancypants.loadingBar', 'http-auth-interceptor', 'ngRoute', 'ngAnimate', 'ngCookies', 'clearApp.filters', 'clearApp.services', 'clearApp.directives', 'clearApp.controllers', 'ui.bootstrap', 'angularFileUpload', 'nvd3ChartDirectives', 'toaster' ])
	.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
	
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
		
		$routeProvider.when('/bug', {templateUrl: 'partials/bugs.html', controller: 'BugsCtrl' });
		$routeProvider.when('/static', {templateUrl: 'partials/static.html' });
		$routeProvider.when('/guidelines', {templateUrl: 'partials/guidelines-list.html', controller: 'GuidelinesListCtrl'});
		$routeProvider.when('/guidelines/process', {templateUrl: 'partials/guidelines-process.html', controller: 'GuidelinesProcessCtrl'});
		$routeProvider.when('/guidelines/:id', {templateUrl: 'partials/guidelines-operations.html', controller: 'GuidelinesOperationsCtrl'});
		
		$routeProvider.when('/user', {templateUrl: 'partials/user-detail.html', controller: 'UserDetailCtrl'});
		$routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard.html', controller: 'DashboardCtrl', reloadOnSearch: false});
		$routeProvider.when('/tv', {templateUrl: 'partials/dashboard-tv.html', controller: 'DashboardTvCtrl', reloadOnSearch: false});
		$routeProvider.when('/tracking', {templateUrl: 'partials/elements-tracking.html', controller: 'ElementsTrackingCtrl', reloadOnSearch: false});
		$routeProvider.when('/indicators', {templateUrl: 'partials/indicators.html', controller: 'IndicatorsCtrl'});
		$routeProvider.when('/search', {templateUrl: 'partials/elements-search.html', controller: 'ElementsSearchCtrl', reloadOnSearch: false});
		$routeProvider.when('/documents/:type', {templateUrl: 'partials/documents.html', controller: 'DocumentsCtrl', reloadOnSearch: false});
		$routeProvider.when('/documents/ir/:id', {templateUrl: 'partials/documents-ir.html', controller: 'DocumentsIrCtrl'});
		$routeProvider.when('/documents/ncr/:id', {templateUrl: 'partials/documents-ncr.html', controller: 'DocumentsNcrCtrl'});
		$routeProvider.when('/documents/pod/:id', {templateUrl: 'partials/documents-pod.html', controller: 'DocumentsPodCtrl'});
		$routeProvider.when('/warehouses', {templateUrl: 'partials/warehouses.html', controller: 'WarehousesCtrl'});
		$routeProvider.when('/warehouses/:id', {templateUrl: 'partials/warehouse.html', controller: 'WarehouseCtrl'});
		$routeProvider.when('/add-order', {templateUrl: 'partials/elements-order-add.html', controller: 'ElementsOrderAddCtrl'});
		$routeProvider.when('/alerts', {templateUrl: 'partials/alerts.html', controller: 'AlertsCtrl', reloadOnSearch: false});
		$routeProvider.when('/:type/', {templateUrl: 'partials/elements.html', controller: 'ElementsCtrl', reloadOnSearch: false});
		$routeProvider.when('/:type/:id', {templateUrl: 'partials/element.html', controller: 'ElementCtrl', reloadOnSearch: false});
		
		$routeProvider.otherwise({redirectTo: '/dashboard'});

//		RestangularProvider.setBaseUrl('../index_rest.php/api/clear/v1/');
//		RestangularProvider.setFullResponse(true);
	}]);