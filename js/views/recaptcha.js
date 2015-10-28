define([
  'jquery',
  'backbone',
  'underscore',
  'mustache',
  'text!templates/recaptcha.html'
], function($, Backbone, _, Mustache, recaptchaTemplate){
  var RecaptchaView = Backbone.View.extend({
    events: {
      'click .recaptcha-option': 'toggleChecked'
    },

    initialize: function(options){
      this.captcha_url = options.captcha_url;
      this.options_selected = {};
    },

    render: function(){
      this.$el.html(
        Mustache.render(recaptchaTemplate, {captcha_url: this.captcha_url})
      );
    },

    disable: function(){
      $('.recaptcha-overlay', this.el).addClass('loading');
    },

    focus: function(){},

    options_selected: {},

    toggleChecked: function(ev){
      var new_value = !this.options_selected[$(ev.target, this.el).data('recaptcha-option')];
      this.options_selected[$(ev.target, this.el).data('recaptcha-option')] = new_value;
      if(new_value){
        $(ev.target).html('&#10003;');
      } else {
        $(ev.target).html('');
      }
    },

    getAnswer: function(){
      return _.map(_.pick(this.options_selected, function(val){
        return val == true;
      }), function(val, key){
        return key;
      }).join(',');
    }
  }); 
  return RecaptchaView;
});
