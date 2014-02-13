'use strict';


// Declare app level module which depends on filters, and services
angular.module('clearApp', [ 'chieffancypants.loadingBar', 'http-auth-interceptor', 'ngRoute', 'ngAnimate', 'ngCookies', 'clearApp.filters', 'clearApp.services', 'clearApp.directives', 'clearApp.controllers', 'ui.bootstrap', 'ngUpload', 'nvd3ChartDirectives', 'toaster' ])
	.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
	
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
		
//		Static pages 
		$routeProvider.when('/static-dashboard', {templateUrl: 'partials/dashboard.html', controller: 'StaticDashboardCtrl'});
		$routeProvider.when('/static-indicators', {templateUrl: 'partials/indicators.html', controller: 'StaticIndicatorsCtrl'});
		$routeProvider.when('/static-documents/:type', {templateUrl: 'partials/documents.html', controller: 'StaticDocumentsCtrl'});
		$routeProvider.when('/documents/ir/static', {templateUrl: 'partials/documents-inspectionReport.html', controller: 'StaticInspectionReportCtrl'});
		$routeProvider.when('/documents/ncr/static', {templateUrl: 'partials/documents-nonComplianceReport.html', controller: 'StaticNonComplianceReportCtrl'});
		$routeProvider.when('/documents/pod/static', {templateUrl: 'partials/documents-proofOfDelivery.html', controller: 'StaticProofOfDeliveryCtrl'});
		$routeProvider.when('/static-tracking', {templateUrl: 'partials/tracking.html', controller: 'TrackingCtrl'});
		$routeProvider.when('/static-detail', {templateUrl: 'partials/detail.html', controller: 'StaticDetailCtrl'});
		$routeProvider.when('/static-search', {templateUrl: 'partials/search.html', controller: 'StaticSearchCtrl'});
		$routeProvider.when('/guidelines', {templateUrl: 'partials/guidelines.html', controller: 'GuidelinesCtrl'});
		$routeProvider.when('/guidelines/process', {templateUrl: 'partials/guidelines-process.html', controller: 'GuidelinesProcessCtrl'});
		$routeProvider.when('/guidelines/web', {templateUrl: 'partials/guidelines-detail.html', controller: 'GuidelinesWebCtrl'});
		$routeProvider.when('/guidelines/mobile', {templateUrl: 'partials/guidelines-detail.html', controller: 'GuidelinesMobileCtrl'});
		
		$routeProvider.when('/user', {templateUrl: 'partials/user-profile.html', controller: 'UserProfileCtrl'});
		$routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard.html', controller: 'DashboardCtrl'});
		$routeProvider.when('/tv', {templateUrl: 'partials/tv.html', controller: 'TvCtrl'});
		$routeProvider.when('/tracking', {templateUrl: 'partials/tracking.html', controller: 'TrackingCtrl'});
		$routeProvider.when('/indicators', {templateUrl: 'partials/indicators.html', controller: 'IndicatorsCtrl'});
		$routeProvider.when('/search', {templateUrl: 'partials/search.html', controller: 'SearchCtrl', reloadOnSearch: true});
		$routeProvider.when('/documents/:type', {templateUrl: 'partials/documents.html', controller: 'DocumentsCtrl'});
		$routeProvider.when('/documents/ir/:id', {templateUrl: 'partials/documents-inspectionReport.html', controller: 'InspectionReportCtrl'});
		$routeProvider.when('/documents/ncr/:id', {templateUrl: 'partials/documents-nonComplianceReport.html', controller: 'NonComplianceReportCtrl'});
		$routeProvider.when('/documents/pod/:id', {templateUrl: 'partials/documents-proofOfDelivery.html', controller: 'ProofOfDeliveryCtrl'});
		$routeProvider.when('/:type/:id', {templateUrl: 'partials/detail.html', controller: 'DetailCtrl'});
		$routeProvider.when('/add-order', {templateUrl: 'partials/add_order.html', controller: 'AddOrderCtrl'});
		
		$routeProvider.otherwise({redirectTo: '/dashboard'});

//		RestangularProvider.setBaseUrl('../index_rest.php/api/clear/v1/');
//		RestangularProvider.setFullResponse(true);
	}]);