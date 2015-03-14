define([
  'backbone',
  'moment'
], function(Backbone, moment) {
  var JobModel = Backbone.Model.extend({
    parse: function(resp){
      this.created_at = moment(resp.created_at).format('MMMM Do YYYY, h:mm:ss a');
      this.updated_at = moment(resp.updated_at).format('MMMM Do YYYY, h:mm:ss a');
      return resp;
    }
  });
  return JobModel;
});
