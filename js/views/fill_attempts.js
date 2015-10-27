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
  'views/captcha',
  'views/recaptcha',
  'text!templates/fill_attempt_error.html',
  'text!templates/fill_attempt_success.html',
  'text!templates/fill_attempts_loading.html',
  'text!templates/job_buttons.html',
  'text!templates/batch_editor.html',
  'lib/codemirror/codemirror.min',
  'lib/codemirror/mode/javascript/javascript.min'
], function($, Backbone, _, Mustache, moment, qs, config, jsyaml, growl, async, CaptchaView, RecaptchaView, fillAttemptErrorTemplate, fillAttemptSuccessTemplate, fillAttemptsLoadingTemplate, jobButtonsTemplate, batchEditorTemplate, CodeMirror, cmj){
  var FillAttemptsView = Backbone.View.extend({
    el: '#fill-attempts-panel',

    events: {
      "click .load-job": "load_job",
      "click .delete-job": "delete_job",
      "click .fill_info_row": "toggle_additional_info",
      "click .save-job": "save_job",
      "click .try-job": "try_job",
      'click .btn-submit-captcha': 'captcha_submitted',
      'click .recaptcha-submit': 'captcha_submitted',
      "click #header-time": "sort_by_time",
      "click #header-job-id": "sort_by_job_id",
      "click #view-all-attempts": "view_all",
      "click #batch-modify": "batch_modify",
      "click #batch-save": "batch_save"
    },

    initialize: function(options){
      _.bindAll(this, "job_loaded", "fill_attempt_html", "try_succeeded", "render");
      this.jobs = options.jobs;
      this.form_view = options.form_view;
    },

    fetch_and_render: function(){
      var that = this;

      $('#fill-attempts-container', this.el).html(Mustache.render(fillAttemptsLoadingTemplate, {}));
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

    ascending: false,
    sort_by: 'time',
    sort_by_time: function(){
      this.ascending = !this.ascending;
      this.sort_by = 'time';
      this.render();
    },

    sort_by_job_id: function(){
      this.ascending = !this.ascending;
      this.sort_by = 'job_id';
      this.render();
    },

    sorted_collection: function(){
      var that = this;
      var collection = this.collection.sortBy(function(fill_attempt){
        if(that.sort_by == 'time'){
          return fill_attempt.get('run_at');
        }
        if(that.sort_by == 'job_id'){
          var job = that.jobs.get(fill_attempt.get('dj_id'));
          return job ? job.id : 0;
        }
      });
      if(!this.ascending){
        collection = collection.reverse();
      }
      return collection;
    },

    render: function () {
      $('#fill-attempts-container', this.el).html(this.sorted_collection().map(this.fill_attempt_html).join(""));
      $('#actions-last-updated').text(this.collection.last_updated);
    },

    fill_attempt_html: function(fill_attempt, key){
      var job = this.jobs.get(fill_attempt.get('dj_id'));
      var screenshot = fill_attempt.attributes.screenshot;
      if(screenshot){
        screenshot = screenshot.match(/^http(s)?:\/\//) ? screenshot : config.PHANTOM_DC_SERVER + '/' + screenshot;
      }
      var vals = _.extend({
        time: moment(fill_attempt.attributes.run_at).format('MMMM Do YYYY, h:mm:ss a'),
        uid: key,
        tr_class: key % 2 == 1 ? "active" : "",
        screenshot_url: screenshot,
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

      window.location = "#fill-attempts-panel";
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
      $('#loader').show();
      var job = this.jobs.get(this.current_job_id);

      job.perform({
        success: this.try_succeeded,
        error: this.try_errored
      });
    },

    try_succeeded: function(data){
      $('#loader').hide();
      if(data.status == "captcha_needed"){
        if(this.captcha_view)
          this.captcha_view.undelegateEvents();

        captcha_url = data.url.match(/^http(s)?:\/\//) ? data.url : config.PHANTOM_DC_SERVER + '/' + data.url;
        if(this.form_view.has_recaptcha){
          this.captcha_view = new RecaptchaView({
            el: '#captcha-panel',
            captcha_url: captcha_url
          });
        } else {
          this.captcha_view = new CaptchaView({
            el: '#captcha-panel',
            captcha_url: captcha_url
          });
        }
        this.captcha_view.render();

        this.captcha_view.focus();

        if(data.uid){
          this.current_uid = data.uid;
        }

        $('#captcha-panel').show();
      } else {
        growl.info("Job has been performed.");
        this.remove_editor();
        this.fetch_and_render();
      }
    },

    captcha_submitted: function(res){
      $('#loader').show();
      var job = this.jobs.get(this.current_job_id);

      $('#captcha-panel').hide();
      job.perform_captcha({
        success: this.try_succeeded,
        error: this.try_errored,
        uid: this.current_uid,
        answer: this.captcha_view.getAnswer()
      });
    },

    try_errored: function(){
      $('#loader').hide();
      growl.error("Job could not be performed.  Please try again later.");
    },

    toggle_additional_info: function(e){
      $('.fill_additional_info_row[data-id=' + $(e.currentTarget).data('id') + ']').toggle();
    },

    view_all: function(e){
      var that = this;
      this.collection.all_statuses = true;
      this.collection.fetch({
        success: that.render
      });
      $(e.currentTarget).hide();
    },

    batch_modify: function(e){
      $('#batch-editor-wrapper').toggle();
      if(!this.batch_if_editor){
        this.load_batch_editor();
      }
    },

    load_batch_editor: function(){
      var batch_editor = Mustache.render(batchEditorTemplate, {});
      $('#batch-editor-wrapper').html(batch_editor);

      this.batch_if_editor = CodeMirror(function(elt) {
        $(elt).insertAfter(document.querySelector('#batch-editor-if-panel').lastChild);
      }, {
        lineNumbers: true,
        mode: "javascript",
        value: JSON.stringify([{"$NAME_PREFIX": "Mr. "}, "Example campaign"], null, '\t')
      });

      this.batch_then_editor = CodeMirror(function(elt) {
        $(elt).insertAfter(document.querySelector('#batch-editor-then-panel').lastChild);
      }, {
        lineNumbers: true,
        mode: "javascript",
        value: JSON.stringify([{"$NAME_PREFIX": "Mr."}], null, '\t')
      });
    },

    batch_save: function(){
      try {
        var if_arguments = JSON.parse(this.batch_if_editor.getValue());
      } catch(err) {
        growl.error("The JSON you've supplied for 'if' is invalid.  Please look over your JSON string.");
      }

      try {
        var then_arguments = JSON.parse(this.batch_then_editor.getValue());
      } catch(err) {
        growl.error("The JSON you've supplied for 'then' is invalid.  Please look over your JSON string.");
      }

      if(if_arguments && then_arguments){
        this.jobs.batch_save({
          if_arguments: if_arguments,
          then_arguments: then_arguments,
          success: function(){
            growl.success("Batch save completed.");
          },
          error: function(){
            growl.error("Batch save could not be completed.  Please try again in a moment.");
          }
        });
      };
    }
  });

  return FillAttemptsView;
});
