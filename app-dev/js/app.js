'use strict';


// Declare app level module which depends on filters, and services
angular.module('clearApp', [ 'chieffancypants.loadingBar', 'http-auth-interceptor', 'ngRoute', 'ngAnimate', 'ngCookies', 'clearApp.filters', 'clearApp.services', 'clearApp.directives', 'clearApp.controllers', 'ui.bootstrap', 'angularFileUpload', 'nvd3ChartDirectives', 'toaster' ])
	.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
	
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
		
		$routeProvider.when('/bug', {templateUrl: 'partials/bugs.html', controller: 'BugsCtrl' });
		$routeProvider.when('/guidelines', {templateUrl: 'partials/guidelines-list.html', controller: 'GuidelinesListCtrl'});
		$routeProvider.when('/guidelines/process', {templateUrl: 'partials/guidelines-process.html', controller: 'GuidelinesProcessCtrl'});
		$routeProvider.when('/guidelines/:id', {templateUrl: 'partials/guidelines-operations.html', controller: 'GuidelinesOperationsCtrl'});
		
		$routeProvider.when('/user', {templateUrl: 'partials/user-detail.html', controller: 'UserDetailCtrl'});
		$routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard.html', controller: 'DashboardCtrl', reloadOnSearch: false});
		$routeProvider.when('/tv', {templateUrl: 'partials/dashboard-tv.html', controller: 'DashboardTvCtrl', reloadOnSearch: false});
		$routeProvider.when('/tracking', {templateUrl: 'partials/element-tracking.html', controller: 'ElementTrackingCtrl', reloadOnSearch: false});
		$routeProvider.when('/indicators', {templateUrl: 'partials/indicators.html', controller: 'IndicatorsCtrl'});
		$routeProvider.when('/search', {templateUrl: 'partials/element-search.html', controller: 'ElementSearchCtrl', reloadOnSearch: false});
		$routeProvider.when('/documents/:type', {templateUrl: 'partials/document-list.html', controller: 'DocumentListCtrl', reloadOnSearch: false});
		$routeProvider.when('/documents/ir/:id', {templateUrl: 'partials/document-ir.html', controller: 'DocumentIrCtrl'});
		$routeProvider.when('/documents/ncr/:id', {templateUrl: 'partials/document-ncr.html', controller: 'DocumentNcrCtrl'});
		$routeProvider.when('/documents/pod/:id', {templateUrl: 'partials/document-pod.html', controller: 'DocumentPodCtrl'});
		$routeProvider.when('/add-order', {templateUrl: 'partials/element-order-add.html', controller: 'ElementOrderAddCtrl'});
		$routeProvider.when('/alerts', {templateUrl: 'partials/alert-list.html', controller: 'AlertListCtrl', reloadOnSearch: false});
		$routeProvider.when('/:type/', {templateUrl: 'partials/element-list.html', controller: 'ElementListCtrl', reloadOnSearch: false});
		$routeProvider.when('/:type/:id', {templateUrl: 'partials/element-detail.html', controller: 'ElementDetailCtrl', reloadOnSearch: false});
		
		$routeProvider.otherwise({redirectTo: '/dashboard'});

//		RestangularProvider.setBaseUrl('../index_rest.php/api/clear/v1/');
//		RestangularProvider.setFullResponse(true);
	}]);