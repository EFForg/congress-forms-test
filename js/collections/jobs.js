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
    }
  });
  return JobCollection;
});
