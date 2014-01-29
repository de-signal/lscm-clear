var planetaryjsDots = function(config) {
    var dots = [];
    config = config || {};

    var addDot = function(lng, lat, options) {
      options = options || {};
      options.color = options.color || config.color || 'white';
      options.angle = options.angle || config.angle || 1;
      var dot = { time: new Date(), options: options };
      if (config.latitudeFirst) {
        dot.lat = lng;
        dot.lng = lat;
      } else {
        dot.lng = lng;
        dot.lat = lat;
      }
      dots.push(dot);
    };

    var drawDots = function(planet, context) {
      var newDots = [];
      for (var i = 0; i < dots.length; i++) {
        var dot = dots[i];
        newDots.push(dot);
        drawDot(planet, context, dot);
      }
      dots = newDots;
    };

    var drawDot = function(planet, context, dot) {
      context.fillStyle = dot.options.color;
      var circle = d3.geo.circle().origin([dot.lng, dot.lat]).angle(dot.options.angle)();
      context.beginPath();
      planet.path.context(context)(circle);
      context.fill();
    };

    return function (planet) {
      planet.plugins.dots = {
        add: addDot
      };

      planet.onDraw(function() {
        planet.withSavedContext(function(context) {
          drawDots(planet, context);
        });
      });
    };
  }