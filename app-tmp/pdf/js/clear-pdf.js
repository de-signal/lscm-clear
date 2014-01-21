nv.addGraph(function() {
    var width = 200,
        height = 200;

    var chart = nv.models.pieChart()
        .x(function(d) { return d.key })
        .y(function(d) { return d.y })
        .color(d3.scale.category10().range())
        .width(width)
        .height(height);

      d3.select("#chart_flows svg")
          .datum(chartFlows)
        .transition().duration(1200)
          .attr('width', width)
          .attr('height', height)
          .call(chart);

    chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

    return chart;
});

nv.addGraph(function() {

		var width = 200,
		        height = 200;
		
	    var chart = nv.models.pieChart()
	        .x(function(d) { return d.key })
	        .y(function(d) { return d.y })
	        .color(d3.scale.category10().range())
	        .width(width)
	        .height(height);
	
	      d3.select("#chart_mode svg")
	          .datum(chartMode)
	        .transition().duration(1200)
	          .attr('width', width)
	          .attr('height', height)
	          .call(chart);
	
	    chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });
	
	    return chart;
});

nv.addGraph(function() {
    var chart = nv.models.multiBarChart()
      .barColor(d3.scale.category20().range())
      .margin({bottom: 100})
      .transitionDuration(300)
      .delay(0)
      .rotateLabels(45)
      .groupSpacing(0.1)
      .showControls(false)
      ;

    chart.multibar
      .hideable(true);

    chart.reduceXTicks(false).staggerLabels(false);

    chart.xAxis
        .showMaxMin(false);

    chart.yAxis;

    d3.select('#chart_greenlight svg')
        .datum(chartGreenlight)
       .call(chart);

    nv.utils.windowResize(chart.update);

    chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

    return chart;
});