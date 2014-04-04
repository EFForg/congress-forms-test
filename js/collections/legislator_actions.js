define([
  'backbone',
  'config',
  'moment',
  'models/legislator_action'
], function(Backbone, config, moment, LegislatorActionModel) {
  var LegislatorActionCollection = Backbone.Collection.extend({
    url: function(){
      return config.CONTACT_CONGRESS_SERVER + '/list-actions/' + this.options.bioguide_id
    },
    parse: function(resp){
      this.last_updated = moment(resp.last_updated).format('MMMM Do YYYY, h:mm:ss a');
      return resp.actions;
    },
    model: LegislatorActionModel,
    initialize: function (options) {
      this.options = options;
    }
  });
  return LegislatorActionCollection;
});
