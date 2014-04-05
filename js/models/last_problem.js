define([
  'backbone',
  'config'
], function(Backbone, config) {
  var LastProblemModel = Backbone.Model.extend({
    urlRoot: function () {
      return config.CONTACT_CONGRESS_SERVER + '/most-recent-error-or-failure/' + this.options.bioguide_id
    },
    initialize: function (options) {
      this.options = options;
    }
  });
  return LastProblemModel;
});
