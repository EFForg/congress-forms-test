define([
  'jquery',
  'backbone',
  'mustache',
  'config',
  'moment',
  'lib/events'
], function($, Backbone, Mustache, config, Events){
  var LastProblemView = Backbone.View.extend({
    render: function () {
      console.log(this.model.attributes);
      if('error' in this.model.attributes){
        $('#error_status').html(moment(this.model.attributes.run_at).format('MMMM Do YYYY, h:mm:ss a'));
        $('#error_info').html(this.model.attributes.error).show();
      } else if('status' in this.model.attributes && this.model.attributes.status == "error"){
        $('#error_status').html(this.model.attributes.message);
      }

      if('screenshot' in this.model.attributes){
        $('#error_image').html("<img src='" + config.CONTACT_CONGRESS_SERVER + "/" + this.model.attributes.screenshot + "'>");
      }
    }
  })
  return LastProblemView;
});
