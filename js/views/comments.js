define([
  'jquery',
  'backbone',
  'mustache',
  'querystring',
  'config',
  'text!templates/comments.html'
], function($, Backbone, Mustache, qs, config, commentsTemplate){
  var CommentsView = Backbone.View.extend({
    render: function () {
        console.log(this.model.attributes);
      $('.comments-container').html(
        Mustache.render(commentsTemplate, this.model.attributes)
      );
    }
  })
  return CommentsView;
});
