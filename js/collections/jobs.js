define([
  'backbone',
  'config',
  'moment',
  'models/job'
], function(Backbone, config, moment, JobModel) {
  var JobCollection = Backbone.Collection.extend({
    url: function(){
      return config.PHANTOM_DC_SERVER + '/list-jobs/' + this.options.bioguide_id + '?debug_key=' + config.DEBUG_KEY
    },
    model: JobModel,
    initialize: function (options) {
      this.options = options;
    },

    batch_save: function(options){
      console.log(JSON.stringify(options));
      var ajax_hash = _.extend({
        url: config.PHANTOM_DC_SERVER + '/batch-job-save/' + this.options.bioguide_id + '?debug_key=' + config.DEBUG_KEY,
        type: "POST",
        data: {
          if_arguments: JSON.stringify(options.if_arguments),
          then_arguments: JSON.stringify(options.then_arguments)
        }
      }, options);
      $.ajax(ajax_hash);
    }
  });
  return JobCollection;
});
