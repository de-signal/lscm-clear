'use strict';

/* Services */

angular.module('clearApp.services', ['ngResource'])
	.factory('Base64', function() {
	    var keyStr = 'ABCDEFGHIJKLMNOP' + 'QRSTUVWXYZabcdef' + 'ghijklmnopqrstuv' + 'wxyz0123456789+/' + '=';
		return {
	        encode: function (input) {
	            var output = "";
	            var chr1, chr2, chr3 = "";
	            var enc1, enc2, enc3, enc4 = "";
	            var i = 0;
	 
	            do {
	                chr1 = input.charCodeAt(i++);
	                chr2 = input.charCodeAt(i++);
	                chr3 = input.charCodeAt(i++);
	 
	                enc1 = chr1 >> 2;
	                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	                enc4 = chr3 & 63;
	 
	                if (isNaN(chr2)) {
	                    enc3 = enc4 = 64;
	                } else if (isNaN(chr3)) {
	                    enc4 = 64;
	                }
	 
	                output = output +
	                    keyStr.charAt(enc1) +
	                    keyStr.charAt(enc2) +
	                    keyStr.charAt(enc3) +
	                    keyStr.charAt(enc4);
	                chr1 = chr2 = chr3 = "";
	                enc1 = enc2 = enc3 = enc4 = "";
	            } while (i < input.length);
	            return output;
	        },
	 
	        decode: function (input) {
	            var output = "";
	            var chr1, chr2, chr3 = "";
	            var enc1, enc2, enc3, enc4 = "";
	            var i = 0;
	 
	            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	            var base64test = /[^A-Za-z0-9\+\/\=]/g;
	            if (base64test.exec(input)) {
	                alert("There were invalid base64 characters in the input text.\n" +
	                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
	                    "Expect errors in decoding.");
	            }
	            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	 
	            do {
	                enc1 = keyStr.indexOf(input.charAt(i++));
	                enc2 = keyStr.indexOf(input.charAt(i++));
	                enc3 = keyStr.indexOf(input.charAt(i++));
	                enc4 = keyStr.indexOf(input.charAt(i++));
	 
	                chr1 = (enc1 << 2) | (enc2 >> 4);
	                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	                chr3 = ((enc3 & 3) << 6) | enc4;
	 
	                output = output + String.fromCharCode(chr1);
	 
	                if (enc3 != 64) {
	                    output = output + String.fromCharCode(chr2);
	                }
	                if (enc4 != 64) {
	                    output = output + String.fromCharCode(chr3);
	                }
	 
	                chr1 = chr2 = chr3 = "";
	                enc1 = enc2 = enc3 = enc4 = "";
	 
	            } while (i < input.length);
	 		
	            return output;
	        }
		};
	})
	.factory('Utils', function(){
		return {
			dateToTimestamp: function(date) {
				if (date instanceof Date) return Math.floor( date.getTime() / 1000 ); 
				else return null;
			}, 
			timestampToDate: function(timestamp) {
				 return new Date( timestamp * 1000 );
			}, 
			is_empty: function (obj) {
				var hasOwnProperty = Object.prototype.hasOwnProperty;
			    // null and undefined are empty
			    if (obj == null) return true;
			    // Assume if it has a length property with a non-zero value
			    // that that property is correct.
			    if (obj.length && obj.length > 0)    return false;
			    if (obj.length === 0)  return true;
			
			    for (var key in obj) {
			        if (hasOwnProperty.call(obj, key))    return false;
			    }
			    // Doesn't handle toString and toValue enumeration bugs in IE < 9
			    return true;
			}, 
			IndxOf: function(myArray, searchTerm, property) {
			    for(var i = 0, len = myArray.length; i < len; i++) {
			        if (myArray[i][property] === searchTerm) return i+1;
			    }
			    return -1;
			}, 
			collect: function (a,b){
			    var c = {};
			    for (var att in a) { c[att] = a[att]; }
			    for (var att in b) { c[att] = b[att]; }
			    return c;
			}, 
			clone: function (obj) {
			    // Handle the 3 simple types, and null or undefined
			    if (null == obj || "object" != typeof obj) return obj;
			
			    // Handle Date
			    if (obj instanceof Date) {
			        var copy = new Date();
			        copy.setTime(obj.getTime());
			        return copy;
			    }
			
			    // Handle Array
			    if (obj instanceof Array) {
			        var copy = [];
			        for (var i = 0, len = obj.length; i < len; i++) {
			            copy[i] = clone(obj[i]);
			        }
			        return copy;
			    }
			
			    // Handle Object
			    if (obj instanceof Object) {
			        var copy = {};
			        for (var attr in obj) {
			            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
			        }
			        return copy;
			    }
			
			    throw new Error("Unable to copy obj! Its type isn't supported.");
			}
		}
	})
	.factory('ClearFn', ['$filter', '$rootScope', '$location', '$modal', 'toaster', 'Utils', function($filter, $rootScope, $location, $modal, toaster, Utils){
		return {
			badgesDisplay: function(query) {
				var badges = [];
				if (query.reference) badges.push({'name': 'reference', 'display': query.related_to + ' reference: ' + query.reference });
				if (query.location) badges.push({'name': 'location', 'display': 'Location: ' + query.location});
				if (query.user) badges.push({'name': 'user', 'display': 'User: ' + query.user });
				if (query.date_from) badges.push({'name': 'date_from', 'display': 'From: ' + $filter('date')(query.date_from*1000, 'dd.MM.yy') });
				if (query.date_to) badges.push({'name': 'date_to', 'display': 'To: ' + $filter('date')(query.date_to*1000, 'dd.MM.yy') });
				
				return badges;
			}, 
			filterRemove: function(badge, query) {
				delete query[badge];
				if (badge === 'reference') delete query.related_to;
				return query;
			}, 
			modalOpen: function (elm, required, $event) {            
	        	if ($event.stopPropagation) $event.stopPropagation();
				if (required.editable || !required.completed) {
		            var modalInstance = $modal.open({
		                templateUrl: 'partials/tplModal.html',
		                controller: 'TplModalCtrl',
		                resolve: {
		                  required: function () {
		                    return required;
		                  },
		                  elm: function () {
		                    return elm;
		                  }
		                    
		                }
		            });
					modalInstance.result.then(function (selectedItem) {
	//				    $scope.selected = selectedItem;
					}, function () {
	//                $log.info('Modal dismissed at: ' + new Date());
					});
				}
	        }, 
	        trackingToggle: function(elm, $event) {
	        	if ($event.stopPropagation) $event.stopPropagation(); 
	        	elm.tracking=!elm.tracking;
	        }, 
	        propertySave: function(elm, type, group) {
	        	$rootScope.currentGroup = group;
				console.log('saving property');
	        	elm.$save({update:type}, function(p, response) {
	        	    if (response("X-Clear-updatedProperty")==="success") {
	        	    	toaster.pop("success", "Updated property", response("X-Clear-updatedPropertyName"));
	        	    } else if (response("X-Clear-updatedProperty")==="warning") {
	        	    	toaster.pop("warning", "Property has not been updated", response("X-Clear-updatedPropertyName"));
	        	    } else if (response("X-Clear-updatedProperty")==="error") {
	        	    	toaster.pop("error", "Property has not been updated", response("X-Clear-updatedPropertyName"));
	        	    }
	        		console.log('saved-> elm: ', elm,'/ type: ', type,'/ group: ', group) 
	        	});
	        }, 
	        requiredSave: function (elm, id) {
	            elm.$save({update:'required', update_id:id}, function(p, response) {
	            	if (response("X-Clear-updatedRequired")==="success") {
	            		toaster.pop("success", "Updated required element", response("X-Clear-updatedRequiredName"));
	            	} else if (response("X-Clear-updatedRequired")==="error") {
	            		toaster.pop("error", "Required element has not been updated", response("X-Clear-updatedRequiredName"));
	            	}
	            	
	            	if (response("X-Clear-updatedMilestone")==="success") {
	            		toaster.pop("success", "Updated milestone", response("X-Clear-updatedMilestoneName"));
	            	} else if (response("X-Clear-updatedMilestone")==="error") {
	            		toaster.pop("error", "Milestone has not been updated", response("X-Clear-updatedMilestoneName"));
	            	}
	            	console.log('saved-> elm: ', elm,'/ type: required / update_id: ', id); 
	            });
	        }, 
	        calDisabled: function(date, mode) {
	        	return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	        }, 
	        go: function (type, id, related) {
	        	$rootScope.tvScreen = false;
	        	$location.$$search = {};
	        	$location.path( type + '/' + id )
	        	if (related) {
	        		$location.search('related_type', related).hash('related');
	        	}
	        	console.log('go ->', type, id, related);
	        }, 
	        propertiesDate: function (elm){
	        	// init date properties from unix timestamp to javascript date
	        	var date = {};
	        	for (var group in elm.properties) {
	        		for (var property in elm.properties[group].set) {
	        			var property = elm.properties[group].set[property];
	        			if (property.type === 'date') {
	        				date[property.name] = {};
	        				if (property.value)	date[property.name].value = Utils.timestampToDate(property.value);
	        			}
	        		}
	        	}
	        	return date;
	        }, 
	        qrCodeGoogle: function (elm) {
	        	var e;
	        	switch (elm.type) {
	        		case 'order': e = 'O'; break;
	        		case 'shipment': e = 'S'; break;
	        		case 'box': e = 'B'; break;
	        		case 'item': e = 'I'; break;
	        	}
	        	return 'http://chart.apis.google.com/chart?cht=qr&chs=63x63&chl='+ e + elm.id + '&chld=H%7C0';
	        }
		}
	}])
	.factory('ChartsConfig', function(){
		var colorBest = '#5cb85c', 
			colorGood = '#a6b15b', 
			colorMedium = '#eeac57', 
			colorBad = '#e28054', 
			colorWorst = '#d75452'; 
		var colorArrayBest = [colorBest, '#FFFFFF'],
			colorArrayGood = [colorGood, '#FFFFFF'],
			colorArrayMedium = [colorMedium, '#FFFFFF'],
			colorArrayBad = [colorBad, '#FFFFFF'],
			colorArrayWorst = [colorWorst, '#FFFFFF'],
			colorArrayBrand = ['#FFCC0F', '#C79F25', '#705A11', '#9C863D', '#BCAD74', '#FFE699'],
			colorArrayOrder = ['#FF7F00', '#C96301', '#703700', '#9D6826', '#BC9461', '#FFBF81'],
			colorArrayShipment = ['#7EDF02', '#65AD01', '#366201', '#688F25', '#95B164', '#BFEF81'],
			colorArrayBox = ['#36BFE3', '#3194A7', '#1C554F', '#4F8180', '#82A9A8', '#A0DFF0'],
			colorArrayItem = ['#FF7D9F', '#C66378', '#6F373A', '#9B6865', '#BD9595', '#FFBED0'];
		
		var snapToGrid = function (value) {
			var dest = null;
			var gridArray = [ 0, 20, 40, 60, 80, 101 ];
			for (var i=0, len=gridArray.length; i<gridArray.length; i++) {
				if (gridArray[i] > value) {
					dest = i-1;
					break;
				}
			}
			return dest;
		}
		
		return {
			colors: { 
				brand: function() {
					return function(d, i) {
				    	return colorArrayBrand[i];
				    };
				},
				order: function() {
					return function(d, i) {
				    	return colorArrayOrder[i];
				    };
				},
				shipment: function() {
					return function(d, i) {
				    	return colorArrayShipment[i];
				    };
				},
				box: function() {
					return function(d, i) {
				    	return colorArrayBox[i];
				    };
				},
				item: function() {
					return function(d, i) {
				    	return colorArrayItem[i];
				    };
				}
			}, 
			tooltips: {
				pieChart: function(){
					return function(key, x, y, e, graph) {
				    	return  '<h6>' + key + '</h6>' + '<p>' + x + '</p>'
					}
				},
				hBarChart: function(){
					return function(key, x, y, e, graph) {
				    	return  '<h6>' + key + '</h6>' + '<p>' +  y + '</p>'
					}
				},
				vBarChart: function(){
					return function(key, x, y, e, graph) {
				    	return  '<h6>' + x + ' / ' + key + '</h6>' + '<p>' +  y + '</p>'
					}
				}
			}, 
			chartFn: function (datas) {
				datas.xFunction = function(){
				    return function(d) {
				        return d.key;
				    };
				}
				datas.yFunction = function(){
				    return function(d) {
				        return d.value;
				    };
				}
				datas.descriptionFunction = function(){
				    return function(d){
				        return d.key;
				    }
				}
			}, 
			chartColorFn: function (value) {
				var colorArrayScale = [ colorArrayWorst, colorArrayBad, colorArrayMedium, colorArrayGood, colorArrayBest ];
				return function() {
					return function(d, i) {
				    	return colorArrayScale[snapToGrid(value)][i];
				    };
				}
			}, 
			typeColorFn: function (value) {
				var colorArrayScale = [ colorWorst, colorBad, colorMedium, colorGood, colorBest ];
				return { 'color': colorArrayScale[snapToGrid(value)] };	
			}, 
			textLabelFn: function (value) {
				var textArrayScale = [ 'Worst', 'Bad', 'Medium', 'Good', 'Best' ];
				return textArrayScale[snapToGrid(value)];	
			}, 
			assignChartsProperties: function (object, id) {
				object.id = id;
				this.chartFn(object);
				object.chartColor = this.chartColorFn(object.value); 
				object.typeColor = this.typeColorFn(object.value); 
				object.textLabel = this.textLabelFn(object.value); 
				object.datas =  [
				    { "key": "key_1", "value": object.value },
				    { "key": "key_2", "value": 100-object.value }
				];
			}
		}
	})
	.factory('User', function($resource){
		return $resource('../index_rest.php/api/clear/v1/:type/:i', 
			{}, 
			{	'login': { method: 'GET', isArray:true }
			});
	})
	.factory('Elements', function($resource) {
	    return $resource('../index_rest.php/api/clear/v2/:type/:id', { type:'@type', id:'@id' },
	    {	'rec': {method: 'POST', isArray:false }
	    });
	})
	.factory('Elements_v1', function($resource) {
	    return $resource('../index_rest.php/api/clear/v1/:type/:id', { type:'@type', id:'@id' });
	})
	.factory('StaticDashboardList', function($resource){
		return $resource('json/elms_tv.json');
	})
	.factory('InspectionReports', function($resource){
		return $resource('json/documents_inspectionReports.json');
	})
	.factory('InspectionReportsFilters', function($resource){
		return $resource('json/documents_inspectionReports_filters.json');
	})
	.factory('InspectionReport', function($resource){
		return $resource('json/documents_inspectionReport.json');
	})
	.factory('NonComplianceReports', function($resource){
		return $resource('json/documents_nonComplianceReports.json');
	})
	.factory('NonComplianceReportsFilters', function($resource){
		return $resource('json/documents_nonComplianceReports_filters.json');
	})
	.factory('NonComplianceReport', function($resource){
		return $resource('json/documents_nonComplianceReport.json');
	})
	.factory('ProofsOfDelivery', function($resource){
		return $resource('json/documents_proofsOfDelivery.json');
	})
	.factory('ProofsOfDeliveryFilters', function($resource){
		return $resource('json/documents_proofsOfDelivery_filters.json');
	})
	.factory('ProofOfDelivery', function($resource){
		return $resource('json/documents_proofOfDelivery.json');
	})
	.factory('StaticIndicators', function($resource){
		 return $resource('json/indicators.json');
	})
	.factory('Elms', function($resource){
		return $resource('json/elms.json');
	})
	.factory('Elm', function($resource){
		return $resource('json/elm.json');
	})
	.factory('SearchFilters', function($resource){
		return $resource('json/search_filters.json');
	})
	.factory('GuidelinesProcess', function($resource){
		return $resource('json/guidelines_process.json');
	})
	.factory('GuidelinesWeb', function($resource){
		return $resource('json/guidelines_web.json');
	})
	.factory('GuidelinesMobile', function($resource){
		return $resource('json/guidelines_mobile.json');
	})
	.factory('News', function($resource){
		return $resource('json/news.json');
	})
	.value('version', '2.7');