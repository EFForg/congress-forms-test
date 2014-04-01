define([
  'jquery',
  'backbone',
  'mustache',
  'config'
], function($, Backbone, Mustache, config) {
  var LegislatorModel = Backbone.Model.extend({
    urlRoot: function () {
      var legislatorUrl = 'https://congress.api.sunlightfoundation.com/legislators?bioguide_id=' + this.options.bioguide_id + '&all_legislators=true&apikey=' + config.SUNLIGHT_API_KEY;
      return legislatorUrl;
    },
    initialize: function (options) {
      this.options = options;
    },
    parse: function (data) {
      // Return the actual legislator object to the BB model
      return data.results[0];
    }
  });
  return LegislatorModel;
});