'use strict';


// Declare app level module which depends on filters, and services
angular.module('clearApp', [ 'http-auth-interceptor', 'ngRoute', 'ngAnimate', 'ngCookies', 'clearApp.filters', 'clearApp.services', 'clearApp.directives', 'clearApp.controllers', 'ui.bootstrap', 'ngUpload', 'nvd3ChartDirectives', 'toaster' ])
	.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {
	
		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');
		$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
		
//		Static pages 
		$routeProvider.when('/static-dashboard', {templateUrl: '/app/partials/static-dashboard.html', controller: 'StaticDashboardCtrl'});
		$routeProvider.when('/static-indicators', {templateUrl: '/app/partials/static-indicators.html', controller: 'StaticIndicatorsCtrl'});
		$routeProvider.when('/static-indicators-template', {templateUrl: '/app/partials/static-indicators-template.html', controller: 'StaticIndicatorsTemplateCtrl'});
		$routeProvider.when('/static-indicators-d3js', {templateUrl: '/app/partials/static-indicators-d3js.html', controller: 'StaticIndicatorsD3jsCtrl'});
		$routeProvider.when('/static-inspection-reports', {templateUrl: '/app/partials/static-documents-inspectionReports.html', controller: 'StaticInspectionReportsCtrl'});
		$routeProvider.when('/static-non-compliance-reports', {templateUrl: '/app/partials/static-documents-nonComplianceReports.html', controller: 'StaticNonComplianceReportsCtrl'});
		$routeProvider.when('/static-proofs-of-delivery', {templateUrl: '/app/partials/static-documents-proofsOfDelivery.html', controller: 'StaticProofsOfDeliveryCtrl'});
		$routeProvider.when('/inspection-report/static', {templateUrl: '/app/partials/static-documents-inspectionReport.html', controller: 'StaticInspectionReportCtrl'});
		$routeProvider.when('/non-compliance-report/static', {templateUrl: '/app/partials/static-documents-nonComplianceReport.html', controller: 'StaticNonComplianceReportCtrl'});
		$routeProvider.when('/proof-of-delivery/static', {templateUrl: '/app/partials/static-documents-proofOfDelivery.html', controller: 'StaticProofOfDeliveryCtrl'});
		$routeProvider.when('/static-tracking', {templateUrl: '/app/partials/static-tracking.html', controller: 'TrackingCtrl'});
		$routeProvider.when('/static-detail', {templateUrl: '/app/partials/static-detail.html', controller: 'StaticDetailCtrl'});
		$routeProvider.when('/static-search', {templateUrl: '/app/partials/static-search.html', controller: 'StaticSearchCtrl'});
		$routeProvider.when('/guidelines', {templateUrl: '/app/partials/guidelines.html', controller: 'GuidelinesCtrl'});
		$routeProvider.when('/guidelines/process', {templateUrl: '/app/partials/guidelines-process.html', controller: 'GuidelinesProcessCtrl'});
		$routeProvider.when('/guidelines/web', {templateUrl: '/app/partials/guidelines-detail.html', controller: 'GuidelinesWebCtrl'});
		$routeProvider.when('/guidelines/mobile', {templateUrl: '/app/partials/guidelines-detail.html', controller: 'GuidelinesMobileCtrl'});
		
		$routeProvider.when('/profile', {templateUrl: '/app/partials/profile.html', controller: 'ProfileCtrl'});
		$routeProvider.when('/dashboard', {templateUrl: '/app/partials/dashboard.html', controller: 'DashboardCtrl'});
		$routeProvider.when('/tv', {templateUrl: '/app/partials/tv.html', controller: 'TvCtrl'});
		$routeProvider.when('/tracking', {templateUrl: '/app/partials/tracking.html', controller: 'TrackingCtrl'});
		$routeProvider.when('/indicators', {templateUrl: '/app/partials/indicators.html', controller: 'IndicatorsCtrl'});
		$routeProvider.when('/search', {templateUrl: '/app/partials/search.html', controller: 'SearchCtrl', reloadOnSearch: true});
		$routeProvider.when('/inspection-report', {templateUrl: '/app/partials/documents-inspectionReports.html', controller: 'InspectionReportsCtrl'});
		$routeProvider.when('/inspection-report/:id', {templateUrl: '/app/partials/documents-inspectionReport.html', controller: 'InspectionReportCtrl'});
		$routeProvider.when('/non-compliance-report', {templateUrl: '/app/partials/documents-nonComplianceReports.html', controller: 'NonComplianceReportsCtrl'});
		$routeProvider.when('/non-compliance-report/:id', {templateUrl: '/app/partials/documents-nonComplianceReport.html', controller: 'NonComplianceReportCtrl'});
		$routeProvider.when('/proof-of-delivery', {templateUrl: '/app/partials/documents-proofsOfDelivery.html', controller: 'ProofsOfDeliveryCtrl'});
		$routeProvider.when('/proof-of-delivery/:id', {templateUrl: '/app/partials/documents-proofOfDelivery.html', controller: 'ProofOfDeliveryCtrl'});
		$routeProvider.when('/:type/:id', {templateUrl: '/app/partials/detail.html', controller: 'DetailCtrl'});
		$routeProvider.when('/add-order', {templateUrl: '/app/partials/add_order.html', controller: 'AddOrderCtrl'});
		
		$routeProvider.otherwise({redirectTo: '/dashboard'});
		


		
		
//		RestangularProvider.setBaseUrl('../index_rest.php/api/clear/v1/');
//		RestangularProvider.setFullResponse(true);
	}]);