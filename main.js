(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child._miestas_ = parent.prototype; return child; };

  jQuery(function() {
   

   // var Cities;
    Miestai = (function(_miestas) {
      __extends(Miestai, _miestas);
      function Miestai() {
        Miestai._miestas_.constructor.apply(this, arguments);
      }
      return Miestai;

    })(Backbone.Model);
    Detale = (function(_miestas) {
      __extends(Detale, _miestas);
      function Detale() { 
        Detale._miestas_.constructor.apply(this, arguments);
      }

      Detale.prototype.className = 'city-detail';
      d3.select('#city-detail')
      Detale.prototype.template = _.template($('#city-detail-tmp').html());
      Detale.prototype.initialize = function() {
        return _.bindAll(this);
      };

      Detale.prototype.render = function() {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
      };
      return Detale;

    })(Backbone.View);
    Miestenas = (function(_miestas) {
      __extends(Miestenas, _miestas);
      function Miestenas() {
        Miestenas._miestas_.constructor.apply(this, arguments);
      }
      Miestenas.prototype.model = Miestai;
      return Miestenas;

    })(Backbone.Collection);
    Vaizdas = (function(_miestas) {
      __extends(Vaizdas, _miestas);
      function Vaizdas() {
        Vaizdas._miestas_.constructor.apply(this, arguments);
      }


      Vaizdas.prototype.tagName = 'g';
      Vaizdas.prototype.initialize = function() {
        _.bindAll(this);
        this.parentView = this.options.parentView;
        this.el = this.parentView.map.append("svg:g").attr("id", "cities-" + this.className);
        this.collection = new Miestenas;
        this.collection.reset(this.options.collectionData);
        return this.render();
  

      };

//Mouse hover plus on click to retrieve NYT api headlines related to gender issues and the specific country 

      Vaizdas.prototype.render = function() {
        var projection, r, self;
        r = d3.scale.linear().domain(this.getDataMinMax()).range([1, 11]);
        projection = this.parentView.projection;
        self = this;
        this.el.selectAll("circle").data(this.collection.models).enter().append("svg:circle").attr("class", this.className).attr("id", function(d) {
          return d.cid;
        }).attr("r", function(d) {
          return r(d.get('value'));
        }).attr("cx", function(d) {
          return projection([d.get('longitude'), d.get('latitude')])[0];
        }).attr("cy", function(d) {
          return projection([d.get('longitude'), d.get('latitude')])[1];
        }).on("mouseover", function(d) {
          return self.showDetail(d, this);
        }).on("mouseout", function(d) {
          return self.hideDetail(d, this);

        }).on("click", function(d) {
          var temp = d.attributes.city;
          var city = temp[1];
          console.log(city);
          NYTimes(city);
        });

        return this;
      };

      Vaizdas.prototype.getDataMinMax = function() {
        var max, min, values;
        values = this.collection.pluck('value');
        min = values.reduce(function(a, b) {
          return Math.min(a, b);
        });
        max = values.reduce(function(a, b) {
          return Math.max(a, b);
        });
        return [min, max];
      };





//show box plus remove box when hovering with mouse
      Vaizdas.prototype.showDetail = function(city, dot) {
        

        var m, rendered, x, y, y2, _ref, _ref2;
        this.Detale = new Detale({
          model: city
        });
        rendered = this.Detale.render().el;
        $(this.parentView.el).append(rendered);
        _ref = $(dot).offset(), x = _ref.left, y = _ref.top;
        m = Math.ceil($(dot).attr('r'));
        _ref2 = [x + m, y + m], x = _ref2[0], y = _ref2[1];
        y2 = m + $(rendered).outerHeight() + 10;
       $(rendered).css("top", y - y2);
        $(rendered).css("left", x - ($(rendered).outerWidth() / 2));
        $(rendered).addClass($(dot).attr('class'));
        return $(rendered).fadeIn('fast');
      };


      Vaizdas.prototype.hideDetail = function(city) {
        return $(this.Detale.el).fadeOut('fast', function() {
          return $(this).remove();
        });
      };

     return Vaizdas;




// geo d3 code examples for the map

    })(Backbone.View);
    WorldView = (function(_miestas) {

      __extends(WorldView, _miestas);

      function WorldView() {
        WorldView._miestas_.constructor.apply(this, arguments);
      }

      WorldView.prototype.el = $('#map');

      WorldView.prototype.geojson_paths = world_countries;

      WorldView.prototype.initialize = function() {
        var height, width;
        _.bindAll(this);
        this.viewLayers = [];
        this.projection = d3.geo.mercator().scale(1).translate([0, 0]);
        this.path = d3.geo.path().projection(this.projection);
        width = $(this.el).width() || $(window).width();
        height = $(this.el).height() || $(window).height();
        this.map = d3.select("#" + $(this.el).attr('id')).append("svg:svg").attr("height", "100%").attr("width", "100%").attr("viewBox", "0 0 " + width + " " + height);
        this.world = this.map.append("svg:g").attr("id", "world");
        this.scaleWorldMap([width, height]);
        return this.render();
      };

      WorldView.prototype.render = function() {
        var features;
        features = this.world.selectAll('path');
        features.data(this.geojson_paths.features).enter().append('svg:path').attr('id', function(d) {
          return d.id;
        }).attr('d', this.path).append('svg:title').text(function(d) {
          return d.properties.name;
        });
        return this;
      };

      WorldView.prototype.addViewLayer = function(data, viewClass, cssClass) {
        var view;
        view = new viewClass({
          collectionData: data,
          parentView: this,
          className: cssClass
        });
        return this.viewLayers.push(view);
      };

      WorldView.prototype.scaleWorldMap = function(_arg) {
        var bounds, bounds0, height, scale, width, xscale, yscale;
        width = _arg[0], height = _arg[1];
        bounds0 = d3.geo.bounds(this.geojson_paths);
        bounds = bounds0.map(this.projection);
        xscale = width / Math.abs(bounds[1][0] - bounds[0][0]);
        yscale = height / Math.abs(bounds[1][1] - bounds[0][1]);
        scale = Math.min(xscale, yscale);
       this.projection.scale(scale);
        return this.projection.translate(this.projection([-bounds0[0][0], -bounds0[1][1]]));
      };
      return WorldView;

    })(Backbone.View);
    Backbone.sync = function(method, model, success, error) {
      return success();
    };
    worldMap = new WorldView;
    worldMap.addViewLayer(cities, Vaizdas, "layer");
  });




// NYT api to retrieve headlines related to gender equality issues 

}).call(this);

function NYTimes(city) {
    var queryURL = "https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=9bbd8167715c47cf98ffd217a669c995&sort=newest&q=" + "female " + "parliament  "+ city;
    $.ajax({
        url: queryURL,
        method: "GET"
      })

      .done(function(NYTresponse) {
        console.log(NYTresponse);
        console.log(NYTresponse.response.docs[0].web_url);
        var url = NYTresponse.response.docs[0].web_url;
        $("#article").empty();
        $("#article").prepend('<h3>Articles on Women Rights in the News</h3><ul id="display-article" class="list-group"></ul>');

        NytData = NYTresponse.response.docs;
        $("#display-article").empty();
        for (i = 0; i < 4; i++) {

        var newsURL = NytData[i].web_url;
        var nytArticleTitles = NytData[i].headline.main;
        
        NYT = "<a href='" + newsURL + "'>" + "<li class='Nyt_article_list list-group-item'>" + nytArticleTitles + "</li></a>";

        $("#display-article").append(NYT);
      }
    });
}