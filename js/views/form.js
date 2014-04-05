define([
  'jquery',
  'backbone',
  'lodash',
  'mustache',
  'lib/events',
  'config',
  'querystring',
  'text!templates/form.html',
  'text!templates/plain-input.html',
  'text!templates/select-input.html',
  'text!templates/captcha.html'
], function($, Backbone, _, Mustache, Events, config, qs, formTemplate, plainInputTemplate, selectInputTemplate, captchaTemplate){
  function makeUID() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  var LegislatorView = Backbone.View.extend({
    el: '.form-container',
    events: {
      'submit form.congress-forms-test': 'fillOutForm',
      'click .btn-submit-captcha': 'fillOutCaptcha'
    },
    render: function () {
      var that = this;
      this.$el.show();

      var bioguide_id = this.model.get('bioguide_id');

      var format_label = function(string){
        var string_arr = string.replace("$","").replace("_"," ").split(" ");
        return _.map(string_arr, function(word){
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(" ");
      }

      $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
      };

      $.ajax({
        url: config.CONTACT_CONGRESS_SERVER + '/retrieve-form-elements',
        type: 'post',
        data: {bio_ids: [bioguide_id]},
        success: function( data ) {
          that.$el.html(Mustache.render(formTemplate, {}));

          // Get the required actions from contact congress
          var required_actions = data[bioguide_id].required_actions;
          required_actions = _.map(required_actions, function (action) {
            return {
              name: action.value,
              options_hash: action.options_hash
            }
          });

          // Merge the required actions with our default fields
          var actions = config.DEFAULT_FIELDS.concat(required_actions);
          actions = _.unique(actions, 'name');
          actions = _.map(actions, function (action) {
            return {
              name: action.name,
              label: action.label || format_label(action.name),
              options_hash: action.options_hash || null
            }
          });
          console.log(actions);
          // Loop through our newly merged actions and output them to form
          _.each(actions, function(field){
            if(field.type === 'textarea') {

            } else if (field.options_hash !== null) {

              if(!$.isArray(field.options_hash)) {
                field.options = [];
                _.each(field.options_hash, function(option, key){
                  field.options.push({name: key, value: option});
                });
                delete field.options_hash;
              };

              $('.required-fields-container').append(Mustache.render(selectInputTemplate, field));
            } else {
              $('.required-fields-container').append(Mustache.render(plainInputTemplate, field));
            }
          });
        }
      });
    },
    fillOutForm: function (ev) {
      // Submit form to contact congress server
      var form = $(ev.currentTarget);
      var data = form.serializeObject();
      console.log(data);
      var that = this;
      that.$el.find('input, textarea, button, select').attr('disabled', 'disabled');

      $.ajax({
        url: config.CONTACT_CONGRESS_SERVER + '/fill-out-form',
        type: 'post',
        data: {
          bio_id: this.model.get('bioguide_id'),
          uid: 'wwwwwww',
          fields: data
        },
        success: function( data ) {
          console.log(arguments);
          if(data.status === 'captcha_needed') {
            $('.captcha-container').append(Mustache.render(captchaTemplate, {captcha_url: data.url}));
          } else if (data.status === 'error') {
            that.$el.find('input, textarea, button, select').removeAttr('disabled');
            $('.form-error').slideDown(200).delay(4500).slideUp(200);
            Events.trigger('BIOGUIDE_ERROR');

          } else {
            $('.form-success').slideDown(200);
          }
        }
      });

      return false;
    },
    fillOutCaptcha: function (ev) {
      var answer = $('#captcha').val();
      var that = this;
      $.ajax({
        url: config.CONTACT_CONGRESS_SERVER + '/fill-out-captcha',
        type: 'post',
        data: {
          uid: 'wwwwwww',
          answer: answer
        },
        success: function( data ) {
          if(data.status === 'error') {
            $('.captcha-container').empty();
            that.$el.find('input, textarea, button, select').removeAttr('disabled');
            Events.trigger('BIOGUIDE_ERROR');
            $('.form-error').slideDown(200).delay(4500).slideUp(200);
          } else {
            $('.form-success').slideDown(200);
          };
        }
      });

      return false;
    },
    initialize: function () {
    }
  })
  return LegislatorView;
});

