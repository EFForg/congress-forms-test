define([
  'jquery',
  'backbone',
  'underscore',
  'mustache',
  'text!templates/captcha.html'
], function($, Backbone, _, Mustache, captchaTemplate){
  var CaptchaView = Backbone.View.extend({
    initialize: function(options){
      this.captcha_url = options.captcha_url;
    },

    render: function(){
      this.$el.html(
        Mustache.render(captchaTemplate, {captcha_url: this.captcha_url})
      );
    },

    disable: function(){},

    focus: function(){
      $('#captcha-answer', this.el).focus();
    },

    getAnswer: function(){
      return $('#captcha-answer', this.el).val();
    }
  }); 
  return CaptchaView;
});
