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
					"static": "conf/mock/user.json"
				}, 
			
				// images
				{
					"url": "/index_rest.php/api/clear/v1/file/temp_horiz.jpg", 
					"static": "conf/mock/img/temp_horiz.jpg"
				}, 
				{
					"url": "/index_rest.php/api/clear/v1/file/temp_vert.jpg", 
					"static": "conf/mock/img/temp_vert.jpg"
				}, 
				{
					"url": "/index_rest.php/api/clear/v1/file/temp_signature.jpg", 
					"static": "conf/mock/img/temp_vert.jpg"
				},
			
				// Transport section
				{
					"url": "../index_rest.php/api/clear/v1/report", 
					"static": "modules/transport/mock/dashboardReports.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v1/dashboard", 
					"static": "modules/transport/mock/dashboardElms.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/alert", 
					"static": "modules/transport/mock/alerts.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/alert/filter", 
					"static": "modules/transport/mock/alerts_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/order", 
					"static": "modules/transport/mock/elms_order.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/order/filter", 
					"static": "modules/transport/mock/elms_order_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/shipment", 
					"static": "modules/transport/mock/elms_shipment.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/shipment/filter", 
					"static": "modules/transport/mock/elms_shipment_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/shipmentIn", 
					"static": "modules/transport/mock/elms_shipment.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/shipmentIn/filter", 
					"static": "modules/transport/mock/elms_shipmentIn_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/shipmentOut", 
					"static": "modules/transport/mock/elms_shipment.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/shipmentOut/filter", 
					"static": "modules/transport/mock/elms_shipmentOut_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/box", 
					"static": "modules/transport/mock/elms_box.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/box/filter", 
					"static": "modules/transport/mock/elms_box_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/item", 
					"static": "modules/transport/mock/elms_item.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/item/filter", 
					"static": "modules/transport/mock/elms_item_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/order/static", 
					"static": "modules/transport/mock/elm.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/shipment/static", 
					"static": "modules/transport/mock/elm_shipment.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/box/static", 
					"static": "modules/transport/mock/elm.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/elements/item/static", 
					"static": "modules/transport/mock/elm.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v1/kpi", 
					"static": "modules/transport/mock/indicators.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/ir", 
					"static": "modules/transport/mock/documents_irs.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/ir/static", 
					"static": "modules/transport/mock/documents_ir.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/ir/filter", 
					"static": "modules/transport/mock/documents_irs_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/ncr", 
					"static": "modules/transport/mock/documents_ncrs.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/ncr/static", 
					"static": "modules/transport/mock/documents_ncr.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/ncr/filter", 
					"static": "modules/transport/mock/documents_ncrs_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/pod", 
					"static": "modules/transport/mock/documents_pods.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/pod/static", 
					"static": "modules/transport/mock/documents_pod.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/pod/filter", 
					"static": "modules/transport/mock/documents_pods_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/archive", 
					"static": "modules/transport/mock/documents_archives.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/archive/filter", 
					"static": "modules/transport/mock/documents_archives_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/media", 
					"static": "modules/transport/mock/documents_medias.json"
				}, 
				{
					"url": "../index_rest.php/api/clear/v2/documents/media/filter", 
					"static": "modules/transport/mock/documents_medias_filters.json"
				}, 
				
				// Stock section
				
				{
					"url": "../index_rest.php/api/stock/v1/warehouse", 
					"static": "modules/stock/mock/warehouses.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/warehouse/static", 
					"static": "modules/stock/mock/warehouse.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/movement", 
					"static": "modules/stock/mock/movements.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/movement/filter", 
					"static": "modules/stock/mock/movements_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/item", 
					"static": "modules/stock/mock/items.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/item/static", 
					"static": "modules/stock/mock/item.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/item/filter", 
					"static": "modules/stock/mock/items_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/replenishment", 
					"static": "modules/stock/mock/replenishments.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/replenishment/filter", 
					"static": "modules/stock/mock/replenishments_filters.json"
				}, 
				{
					"url": "../index_rest.php/api/stock/v1/kpi", 
					"static": "modules/stock/mock/indicators.json"
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
		$httpBackend.whenGET(/^[^.]+$|\.(?!(html|png|jpg|json|svg)$)([^.]+$)/).passThrough();
		$httpBackend.whenGET(/.*/).passThrough();
		$httpBackend.whenPOST(/.*/).passThrough();
		$httpBackend.whenPUT(/.*/).passThrough();
		
	});