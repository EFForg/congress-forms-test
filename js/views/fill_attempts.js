define([
  'jquery',
  'backbone',
  'underscore',
  'mustache',
  'moment',
  'querystring',
  'config',
  'jsyaml',
  'growl',
  'async',
  'text!templates/fill_attempt_error.html',
  'text!templates/fill_attempt_success.html',
  'text!templates/job_buttons.html',
  'lib/codemirror/codemirror.min',
  'lib/codemirror/mode/javascript/javascript.min'
], function($, Backbone, _, Mustache, moment, qs, config, jsyaml, growl, async, fillAttemptErrorTemplate, fillAttemptSuccessTemplate, jobButtonsTemplate, CodeMirror, cmj){
  var FillAttemptsView = Backbone.View.extend({
    el: '#fill-attempts-panel',

    events: {
      "click .load-job": "load_job",
      "click .delete-job": "delete_job",
      "click .fill_info_row": "toggle_additional_info",
      "click .save-job": "save_job",
      "click .try-job": "try_job"
    },

    initialize: function(options){
      _.bindAll(this, "job_loaded", "fill_attempt_html", "try_succeeded");
      this.jobs = options.jobs;
      jobs = this.jobs;
    },

    fetch_and_render: function(){
      var that = this;
      async.parallel({
        fill_attempts: function(cb){
          that.collection.fetch({
            success: function(res){
              cb(null, res);
            }
          });
        },
        jobs: function(cb){
          that.jobs.fetch({
            success: function(res){
              cb(null, res);
            }
          });
        }
      }, function(){
        that.render();
      });
    },

    render: function () {
      $('#fill-attempts-container', this.el).html(this.collection.map(this.fill_attempt_html).join(""));
      $('#actions-last-updated').text(this.collection.last_updated);
    },

    fill_attempt_html: function(fill_attempt, key){
      var job = this.jobs.get(fill_attempt.get('dj_id'));
      var vals = _.extend({
        time: moment(fill_attempt.attributes.run_at).format('MMMM Do YYYY, h:mm:ss a'),
        uid: key,
        tr_class: key % 2 == 1 ? "active" : "",
        screenshot_url: fill_attempt.attributes.screenshot,
        job_id: job ? job.id : "",
        error: job ? job.get('last_error') : ""
      }, fill_attempt.attributes);
      if(fill_attempt.attributes.status == "error" || fill_attempt.attributes.status == "failure"){
        return Mustache.render(fillAttemptErrorTemplate, vals);
      } else {
        return Mustache.render(fillAttemptSuccessTemplate, vals);
      }
    },

    load_job: function(e){
      e.stopPropagation();

      var job = this.jobs.get(Number($(e.currentTarget).data('id')));
      job.fetch({
        success: this.job_loaded,
        error: function(){
          growl.error("Could not load job.  Please try again in a moment.");
        }
      });
    },

    delete_job: function(e){
      var that = this;
      e.stopPropagation();

      var job_id = $(e.currentTarget).data('id');
      var job = this.jobs.get(Number(job_id));
      job.destroy({
        success: function(){
          growl.success("Job deleted.");
          if(that.current_job_id == job.id){
            that.remove_editor();
          }
          $('.job-buttons[data-id="' + job_id + '"], .job-label[data-id="' + job_id + '"]').remove();
        },
        error: function(){ growl.success("Job could not be deleted.  Please try again later."); }
      });
    },

    job_loaded: function(job){
      if(!this.editor){
        this.load_editor();
      }

      var json = JSON.stringify(job.get('arguments'), null, '\t');
      this.editor.setValue(json);
      this.current_job_id = job.id;
      $('#current_job_id', this.el).text(this.current_job_id);

      growl.success("Job loaded.");
    },

    load_editor: function(){
      var job_buttons = Mustache.render(jobButtonsTemplate, {});
      $('#editor-wrapper').html(job_buttons);

      this.editor = CodeMirror(function(elt) {
        $(elt).insertAfter(document.querySelector('#editor-panel').lastChild);
      }, {
        lineNumbers: true,
        mode: "javascript"
      });
    },

    remove_editor: function(){
      $('#editor-wrapper').html("");
      this.editor = null;
    },

    save_job: function(e){
      var job = this.jobs.get(this.current_job_id);

      try {
        var arguments = JSON.parse(this.editor.getValue());
      } catch(err) {
        growl.error("The JSON you've supplied is invalid.  Please look over your JSON string.");
      }

      job.save({ arguments: arguments }, {
        success: function(){
          growl.success("Job #" + String(job.id) + " saved" );
        },
        error: function(){
          growl.success("Something went wrong!  Please try again in a moment.");
        }
      });
    },

    try_job: function(e){
      var job = this.jobs.get(this.current_job_id);

      job.perform({
        success: this.try_succeeded,
        error: this.try_errored
      });
    },

    try_succeeded: function(res){
      growl.success("Job has been performed.");
      this.remove_editor();
      this.fetch_and_render();
    },

    try_errored: function(){
      growl.error("Job could not be performed.  Please try again later.");
    },

    toggle_additional_info: function(e){
      $('.fill_additional_info_row[data-id=' + $(e.currentTarget).data('id') + ']').toggle();
    }
  });

  return FillAttemptsView;
});
