define([
  'jquery',
  'backbone',
  'mustache',
  'text!templates/job.html'
], function($, Backbone, Mustache, jobTemplate){
  var JobsView = Backbone.View.extend({
    render: function () {
      $('.jobs-container').html(this.collection.map(function(job){
        return Mustache.render(jobTemplate, {
          id: job.id,
          created_at: job.created_at,
          updated_at: job.difference > 10000 ? job.updated_at : ""
        });
      })).join("");
    }
  })
  return JobsView;
});
