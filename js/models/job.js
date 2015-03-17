define([
  'config',
  'backbone',
  'moment'
], function(config, Backbone, moment) {
  var JobModel = Backbone.Model.extend({
    url: function(){
      return config.CONTACT_CONGRESS_SERVER + '/job-details/' + this.id + '?debug_key=' + config.DEBUG_KEY
    },

    parse: function(resp){
      this.created_at = moment(resp.created_at).format('MMMM Do YYYY, h:mm:ss a');
      this.updated_at = moment(resp.updated_at).format('MMMM Do YYYY, h:mm:ss a');
      this.difference = moment(resp.updated_at) - moment(resp.created_at);
      return resp;
    }
  });
  return JobModel;
});
