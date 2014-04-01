define([
  'jquery',
  'backbone',
  'mustache',
  'querystring',
  'text!templates/legislator.html'
], function($, Backbone, Mustache, qs, legislatorTemplate){
  var LegislatorView = Backbone.View.extend({
    render: function () {
      console.log(this.options);
      $('.legislator-container').html(Mustache.render(legislatorTemplate, this.model.attributes));
    }
  })
  return LegislatorView;
});