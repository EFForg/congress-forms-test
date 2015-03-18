define([
  'jquery',
  'backbone',
  'underscore',
  'mustache',
  'moment',
  'querystring',
  'config',
  'jsyaml',
  'text!templates/fill_attempt_error.html',
  'text!templates/fill_attempt_success.html',
  'lib/codemirror/codemirror.min',
  'lib/codemirror/mode/javascript/javascript.min'
], function($, Backbone, _, Mustache, moment, qs, config, jsyaml, fillAttemptErrorTemplate, fillAttemptSuccessTemplate, CodeMirror, cmj){
  var FillAttemptsView = Backbone.View.extend({
    el: '#fill-attempts-container',

    events: {
      "click .load-job": "load_job",
      "click .fill_info_row": "toggle_additional_info",
    },

    initialize: function(options){
      _.bindAll(this, "job_loaded");
      this.jobs = options.jobs;
    },

    render: function () {
      var fill_attempts_view = this;
      var x = 0;
      this.$el.html(this.collection.map(function(fill_attempt){
        var job = fill_attempts_view.jobs.get(fill_attempt.get('dj_id'));
        var vals = _.extend({
          time: moment(fill_attempt.attributes.run_at).format('MMMM Do YYYY, h:mm:ss a'),
          uid: x,
          tr_class: ++x % 2 == 0 ? "active" : "",
          screenshot_url: fill_attempt.attributes.screenshot,
          dj_id: job ? job.id : "",
          error: job ? job.get('last_error') : ""
        }, fill_attempt.attributes);
        if(fill_attempt.attributes.status == "error" || fill_attempt.attributes.status == "failure"){
          return Mustache.render(fillAttemptErrorTemplate, vals);
        } else {
          return Mustache.render(fillAttemptSuccessTemplate, vals);
        }
      }).join(""));

      $('#actions-last-updated').text(this.collection.last_updated);
    },

    load_job: function(e){
      e.stopPropagation();

      if(!this.editor){
        this.load_editor();
      }
      var id = Number($(e.currentTarget).data('id'));
      var job = this.jobs.get(id);
      job.fetch({
        success: this.job_loaded
      });
    },

    job_loaded: function(job){
      var json = JSON.stringify(job.get('arguments'), null, '\t');
      this.editor.setValue(json);
    },

    load_editor: function(){
      this.editor = CodeMirror(function(elt) {
        var panel_body = document.querySelector('.fill-attempts-panel .panel-body');
        panel_body.insertBefore(elt, panel_body.firstChild);
      }, {
        lineNumbers: true,
        mode: "javascript"
      });
    },

    toggle_additional_info: function(e){
      $('.fill_additional_info_row[data-id=' + $(e.currentTarget).data('id') + ']').toggle();
    }
  })
  return FillAttemptsView;
});
