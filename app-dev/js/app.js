'use strict';


// Declare app level module which depends on filters, and services
angular.module('clearApp', [ 'http-auth-interceptor', 'ngRoute', 'ngAnimate', 'ngCookies', 'clearApp.filters', 'clearApp.services', 'clearApp.directives', 'clearApp.controllers', 'ui.bootstrap', 'ngUpload', 'nvd3ChartDirectives', 'toaster' ])
	.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
	
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
		
//		Static pages 
		$routeProvider.when('/static-dashboard', {templateUrl: 'partials/static-dashboard.html', controller: 'StaticDashboardCtrl'});
		$routeProvider.when('/static-indicators', {templateUrl: 'partials/static-indicators.html', controller: 'StaticIndicatorsCtrl'});
		$routeProvider.when('/static-indicators-template', {templateUrl: 'partials/static-indicators-template.html', controller: 'StaticIndicatorsTemplateCtrl'});
		$routeProvider.when('/static-indicators-d3js', {templateUrl: 'partials/static-indicators-d3js.html', controller: 'StaticIndicatorsD3jsCtrl'});
		$routeProvider.when('/static-inspection-reports', {templateUrl: 'partials/static-documents-inspectionReports.html', controller: 'StaticInspectionReportsCtrl'});
		$routeProvider.when('/static-non-compliance-reports', {templateUrl: 'partials/static-documents-nonComplianceReports.html', controller: 'StaticNonComplianceReportsCtrl'});
		$routeProvider.when('/static-proofs-of-delivery', {templateUrl: 'partials/static-documents-proofsOfDelivery.html', controller: 'StaticProofsOfDeliveryCtrl'});
		$routeProvider.when('/inspection-report/static', {templateUrl: 'partials/static-documents-inspectionReport.html', controller: 'StaticInspectionReportCtrl'});
		$routeProvider.when('/non-compliance-report/static', {templateUrl: 'partials/static-documents-nonComplianceReport.html', controller: 'StaticNonComplianceReportCtrl'});
		$routeProvider.when('/proof-of-delivery/static', {templateUrl: 'partials/static-documents-proofOfDelivery.html', controller: 'StaticProofOfDeliveryCtrl'});
		$routeProvider.when('/static-tracking', {templateUrl: 'partials/static-tracking.html', controller: 'TrackingCtrl'});
		$routeProvider.when('/static-detail', {templateUrl: 'partials/static-detail.html', controller: 'StaticDetailCtrl'});
		$routeProvider.when('/static-search', {templateUrl: 'partials/static-search.html', controller: 'StaticSearchCtrl'});
		$routeProvider.when('/guidelines', {templateUrl: 'partials/guidelines.html', controller: 'GuidelinesCtrl'});
		$routeProvider.when('/guidelines/process', {templateUrl: 'partials/guidelines-process.html', controller: 'GuidelinesProcessCtrl'});
		$routeProvider.when('/guidelines/web', {templateUrl: 'partials/guidelines-detail.html', controller: 'GuidelinesWebCtrl'});
		$routeProvider.when('/guidelines/mobile', {templateUrl: 'partials/guidelines-detail.html', controller: 'GuidelinesMobileCtrl'});
		
		$routeProvider.when('/profile', {templateUrl: 'partials/profile.html', controller: 'ProfileCtrl'});
		$routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard.html', controller: 'DashboardCtrl'});
		$routeProvider.when('/tv', {templateUrl: 'partials/tv.html', controller: 'TvCtrl'});
		$routeProvider.when('/tracking', {templateUrl: 'partials/tracking.html', controller: 'TrackingCtrl'});
		$routeProvider.when('/indicators', {templateUrl: 'partials/indicators.html', controller: 'IndicatorsCtrl'});
		$routeProvider.when('/search', {templateUrl: 'partials/search.html', controller: 'SearchCtrl', reloadOnSearch: true});
		$routeProvider.when('/inspection-report', {templateUrl: 'partials/documents-inspectionReports.html', controller: 'InspectionReportsCtrl'});
		$routeProvider.when('/inspection-report/:id', {templateUrl: 'partials/documents-inspectionReport.html', controller: 'InspectionReportCtrl'});
		$routeProvider.when('/non-compliance-report', {templateUrl: 'partials/documents-nonComplianceReports.html', controller: 'NonComplianceReportsCtrl'});
		$routeProvider.when('/non-compliance-report/:id', {templateUrl: 'partials/documents-nonComplianceReport.html', controller: 'NonComplianceReportCtrl'});
		$routeProvider.when('/proof-of-delivery', {templateUrl: 'partials/documents-proofsOfDelivery.html', controller: 'ProofsOfDeliveryCtrl'});
		$routeProvider.when('/proof-of-delivery/:id', {templateUrl: 'partials/documents-proofOfDelivery.html', controller: 'ProofOfDeliveryCtrl'});
		$routeProvider.when('/:type/:id', {templateUrl: 'partials/detail.html', controller: 'DetailCtrl'});
		$routeProvider.when('/add-order', {templateUrl: 'partials/add_order.html', controller: 'AddOrderCtrl'});
		
		$routeProvider.otherwise({redirectTo: '/dashboard'});
		


		
		
//		RestangularProvider.setBaseUrl('../index_rest.php/api/clear/v1/');
//		RestangularProvider.setFullResponse(true);
	}]);