var this_job;
define([
  'jquery',
  'backbone',
  'mustache',
  'text!templates/job.html',
  'lib/codemirror/codemirror.min',
  'lib/codemirror/mode/javascript/javascript.min'
], function($, Backbone, Mustache, jobTemplate, CodeMirror, cmj){
  var JobsView = Backbone.View.extend({
    render: function () {
      var jobs_view = this;

      this.render_list();

      var js_code = CodeMirror.fromTextArea(document.getElementById("javascript_code"), {
        lineNumbers: true,
        mode: "javascript"
      });

      $('.load-job').on('click', function(){
        var id = Number($(this).data('id'));
        var job = jobs_view.collection.get(id);
        this_job = job;
        job.fetch({
          success: function(){
            var json = JSON.stringify(job.get('arguments'), null, '\t');
            js_code.setValue(json);
          }
        });
      });
    },

    render_list: function() {
      $('.jobs-container').html(this.collection.map(function(job){
        return Mustache.render(jobTemplate, {
          id: job.id,
          created_at: job.created_at,
          updated_at: job.difference > 10000 ? job.updated_at : ""
        });
      }).join(""));
    }
  });
  return JobsView;
});
