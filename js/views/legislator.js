define([
  'jquery',
  'backbone',
  'mustache',
  'querystring',
  'config',
  'text!templates/legislator.html'
], function($, Backbone, Mustache, qs, config, legislatorTemplate){
  var LegislatorView = Backbone.View.extend({
    render: function () {
      console.log(this.options);
      $('.legislator-container').html(
        Mustache.render(legislatorTemplate, _.extend({congress_forms_server: config.CONTACT_CONGRESS_SERVER}, this.model.attributes))
      );
    }
  })
  return LegislatorView;
});
