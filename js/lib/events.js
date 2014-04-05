define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone){
  var vent = _.extend({}, Backbone.Events);
  // acts as an app-wide event hub
  return vent;
});