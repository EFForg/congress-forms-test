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
  'text!templates/fill_attempt_success.html'
], function($, Backbone, _, Mustache, moment, qs, config, jsyaml, fillAttemptErrorTemplate, fillAttemptSuccessTemplate){
  var FillAttemptsView = Backbone.View.extend({
    render: function () {
      var x = 0;
      $('.fill-attempts-container').html(this.collection.map(function(fill_attempt){
        var vals = _.extend({
          time: moment(fill_attempt.attributes.run_at).format('MMMM Do YYYY, h:mm:ss a'),
          uid: x,
          tr_class: ++x % 2 == 0 ? "active" : "",
          screenshot_url: fill_attempt.attributes.screenshot,
          dj_id: fill_attempt.attributes.dj_id
        }, fill_attempt.attributes);
        if(fill_attempt.attributes.status == "error" || fill_attempt.attributes.status == "failure"){
          return Mustache.render(fillAttemptErrorTemplate, vals);
        } else {
          return Mustache.render(fillAttemptSuccessTemplate, vals);
        }
      }).join(""));

      $('.fill_info_row').on('click', function(){
        $('.fill_additional_info_row[data-id=' + $(this).data('id') + ']').toggle();
      });

      $('#actions-last-updated').text(this.collection.last_updated);
    }
  })
  return FillAttemptsView;
});
