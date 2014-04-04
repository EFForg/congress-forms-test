define([
  'backbone',
  'config',
  'models/legislator_action'
], function(Backbone, config, LegislatorActionModel) {
  var LegislatorActionCollection = Backbone.Collection.extend({
    url: function(){
      return config.CONTACT_CONGRESS_SERVER + '/list-actions/' + this.options.bioguide_id
    },
    model: LegislatorActionModel,
    initialize: function (options) {
      this.options = options;
    }
  });
  return LegislatorActionCollection;
});
