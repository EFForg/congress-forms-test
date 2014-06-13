define([
  'backbone',
  'config',
  'models/fill_attempt'
], function(Backbone, config, FillAttemptModel) {
  var FillAttemptCollection = Backbone.Collection.extend({
    url: function(){
      return config.CONTACT_CONGRESS_SERVER + '/recent-statuses-detailed/' + this.options.bioguide_id + '?debug_key=' + config.DEBUG_KEY
    },
    model: FillAttemptModel,
    initialize: function (options) {
      this.options = options;
    }
  });
  return FillAttemptCollection;
});
