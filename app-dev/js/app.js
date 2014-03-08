'use strict';


// Declare app level module which depends on filters, and services
angular.module('clearApp', [ 'chieffancypants.loadingBar', 'http-auth-interceptor', 'ngRoute', 'ngAnimate', 'ngCookies', 'clearApp.filters', 'clearApp.services', 'clearApp.directives', 'clearApp.controllers', 'ui.bootstrap', 'angularFileUpload', 'nvd3ChartDirectives', 'toaster' ])
	.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
	
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
		
//		Static pages 
		$routeProvider.when('/bug-list', {templateUrl: 'partials/bug-list.html', controller: 'BugListCtrl' });
		$routeProvider.when('/static-dashboard', {templateUrl: 'partials/dashboard.html', controller: 'StaticDashboardCtrl', reloadOnSearch: false});
		$routeProvider.when('/static-indicators', {templateUrl: 'partials/indicators.html', controller: 'StaticIndicatorsCtrl'});
		$routeProvider.when('/static-documents/:type', {templateUrl: 'partials/documents.html', controller: 'StaticDocumentsCtrl', reloadOnSearch: false});
		$routeProvider.when('/documents/ir/static', {templateUrl: 'partials/documents-inspectionReport.html', controller: 'StaticInspectionReportCtrl'});
		$routeProvider.when('/documents/ncr/static', {templateUrl: 'partials/documents-nonComplianceReport.html', controller: 'StaticNonComplianceReportCtrl'});
		$routeProvider.when('/documents/pod/static', {templateUrl: 'partials/documents-proofOfDelivery.html', controller: 'StaticProofOfDeliveryCtrl'});
		$routeProvider.when('/static-tracking', {templateUrl: 'partials/tracking.html', controller: 'TrackingCtrl', reloadOnSearch: false});
		$routeProvider.when('/static-detail', {templateUrl: 'partials/detail.html', controller: 'StaticDetailCtrl', reloadOnSearch: false});
		$routeProvider.when('/static-search', {templateUrl: 'partials/search.html', controller: 'StaticSearchCtrl', reloadOnSearch: false});
		$routeProvider.when('/guidelines', {templateUrl: 'partials/guidelines.html', controller: 'GuidelinesCtrl'});
		$routeProvider.when('/guidelines/process', {templateUrl: 'partials/guidelines-process.html', controller: 'GuidelinesProcessCtrl'});
		$routeProvider.when('/guidelines/:id', {templateUrl: 'partials/guidelines-detail.html', controller: 'GuidelinesDetailCtrl'});
		
		$routeProvider.when('/user', {templateUrl: 'partials/user-profile.html', controller: 'UserProfileCtrl'});
		$routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard.html', controller: 'DashboardCtrl', reloadOnSearch: false});
		$routeProvider.when('/tv', {templateUrl: 'partials/tv.html', controller: 'TvCtrl', reloadOnSearch: false});
		$routeProvider.when('/tracking', {templateUrl: 'partials/tracking.html', controller: 'TrackingCtrl', reloadOnSearch: false});
		$routeProvider.when('/indicators', {templateUrl: 'partials/indicators.html', controller: 'IndicatorsCtrl'});
		$routeProvider.when('/search', {templateUrl: 'partials/search.html', controller: 'SearchCtrl', reloadOnSearch: false});
		$routeProvider.when('/documents/:type', {templateUrl: 'partials/documents.html', controller: 'DocumentsCtrl', reloadOnSearch: false});
		$routeProvider.when('/documents/ir/:id', {templateUrl: 'partials/documents-inspectionReport.html', controller: 'InspectionReportCtrl'});
		$routeProvider.when('/documents/ncr/:id', {templateUrl: 'partials/documents-nonComplianceReport.html', controller: 'NonComplianceReportCtrl'});
		$routeProvider.when('/documents/pod/:id', {templateUrl: 'partials/documents-proofOfDelivery.html', controller: 'ProofOfDeliveryCtrl'});
		$routeProvider.when('/add-order', {templateUrl: 'partials/add_order.html', controller: 'AddOrderCtrl'});
		$routeProvider.when('/:type/', {templateUrl: 'partials/elements.html', controller: 'ElementsCtrl', reloadOnSearch: false});
		$routeProvider.when('/:type/:id', {templateUrl: 'partials/detail.html', controller: 'DetailCtrl', reloadOnSearch: false});
		
		$routeProvider.otherwise({redirectTo: '/dashboard'});

//		RestangularProvider.setBaseUrl('../index_rest.php/api/clear/v1/');
//		RestangularProvider.setFullResponse(true);
	}]);