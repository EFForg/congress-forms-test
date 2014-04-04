define([
  'jquery',
  'backbone',
  'mustache',
  'querystring',
  'config',
  'text!templates/legislator_action.html'
], function($, Backbone, Mustache, qs, config, legislatorActionTemplate){
  var LegislatorActionsView = Backbone.View.extend({
    render: function () {
      $('.legislator-actions-container').html(this.collection.map(function(legislator_action){
        return Mustache.render(legislatorActionTemplate, legislator_action.attributes)
      }).join(""));
    }
  })
  return LegislatorActionsView;
});
