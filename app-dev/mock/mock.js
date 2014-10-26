angular.module('clearApp.mock', ['ngMockE2E'])
	
	.run(function($httpBackend, $rootScope, $location, $timeout, Utils) {
		var urlPage = $location.search();
		urlPage.s = 1; 
		$location.search(urlPage);
		$timeout(function() {
			$rootScope.$broadcast("loginAuto", "yes");
		}); 
		
		if ($location.absUrl().indexOf("s=1") > -1) {
			$rootScope.static=true;
		} 
		if ($rootScope.static) {
			var resources = [
			
				// User
				{
					"url": "../index_rest.php/api/clear/v1/user", 
					"static": "mock/json/user.json"
				}, 
			
				// images
				{
					"url": "/index_rest.php/api/clear/v1/file/temp_horiz.jpg", 
					"static": "mock/img/temp_horiz.jpg"
				}, 
				{
					"url": "/index_rest.php/api/clear/v1/file/temp_vert.jpg", 
					"static": "mock/img/temp_vert.jpg"
				}, 
				{
					"url": "/index_rest.php/api/clear/v1/file/temp_signature.jpg", 
					"static": "mock/img/temp_vert.jpg"
				},
			
				// Transport section
				{
					"url": "../index_rest.php/api/clear/v1/report", 
					"static": "mock/transport/dashboardReports.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v1/dashboard", 
					"static": "mock/transport/dashboardElms.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/alert", 
					"static": "mock/transport/alerts.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/alert/filter", 
					"static": "mock/transport/alerts_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/order", 
					"static": "mock/transport/elms_order.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/order/filter", 
					"static": "mock/transport/elms_order_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/shipment", 
					"static": "mock/transport/elms_shipment.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/shipment/filter", 
					"static": "mock/transport/elms_shipment_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/shipmentIn", 
					"static": "mock/transport/elms_shipment.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/shipmentIn/filter", 
					"static": "mock/transport/elms_shipmentIn_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/shipmentOut", 
					"static": "mock/transport/elms_shipment.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/shipmentOut/filter", 
					"static": "mock/transport/elms_shipmentOut_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/box", 
					"static": "mock/transport/elms_box.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/box/filter", 
					"static": "mock/transport/elms_box_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/item", 
					"static": "mock/transport/elms_item.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/item/filter", 
					"static": "mock/transport/elms_item_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/order/static", 
					"static": "mock/transport/elm.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/shipment/static", 
					"static": "mock/transport/elm_shipment.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/box/static", 
					"static": "mock/transport/elm.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/item/static", 
					"static": "mock/transport/elm.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v1/kpi", 
					"static": "mock/transport/indicators.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/ir", 
					"static": "mock/transport/documents_irs.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/ir/static", 
					"static": "mock/transport/documents_ir.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/ir/filter", 
					"static": "mock/transport/documents_irs_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/ncr", 
					"static": "mock/transport/documents_ncrs.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/ncr/static", 
					"static": "mock/transport/documents_ncr.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/ncr/filter", 
					"static": "mock/transport/documents_ncrs_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/pod", 
					"static": "mock/transport/documents_pods.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/pod/static", 
					"static": "mock/transport/documents_pod.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/pod/filter", 
					"static": "mock/transport/documents_pods_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/archive", 
					"static": "mock/transport/documents_archives.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/archive/filter", 
					"static": "mock/transport/documents_archives_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/media", 
					"static": "mock/transport/documents_medias.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/media/filter", 
					"static": "mock/transport/documents_medias_filters.json"
				}, 
				
				// Stock section
				
				{
					"url": "../index_rest.php/api/stock/v1/warehouse", 
					"static": "mock/stock/warehouses.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/warehouse/static", 
					"static": "mock/stock/warehouse.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/movement", 
					"static": "mock/stock/movements.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/movement/filter", 
					"static": "mock/stock/movements_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/item", 
					"static": "mock/stock/items.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/item/static", 
					"static": "mock/stock/item.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/item/filter", 
					"static": "mock/stock/items_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/replenishment", 
					"static": "mock/stock/replenishments.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/replenishment/filter", 
					"static": "mock/stock/replenishments_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/kpi", 
					"static": "mock/stock/indicators.json"
				}

			]; 		
			
			for (var i in resources) {
				$httpBackend.when('GET', new RegExp('\\' + resources[i].url)).respond(function(method, url, data) {
					url = url.split('?')[0]; 
					console.log('url sans: ', url);  
					var request = new XMLHttpRequest();
					request.open('GET', resources[Utils.objectIndexbyKey(resources, "url", url)].static, false);
					request.send(null);
					return [request.status, request.response, {}];
				});
			}
			
			$httpBackend.when('POST', '../oauth/oauth.php').respond(
				{
					"access_token": "token",
					"refresh_token": "token"
				}
			);
		}
		$httpBackend.whenGET(/partials\/.*/).passThrough();
		$httpBackend.whenGET(/json\/.*/).passThrough();
		$httpBackend.whenGET(/img\/.*/).passThrough();
	});