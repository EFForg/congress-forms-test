define([
  'jquery',
  'backbone',
  'lodash',
  'mustache',
  'lib/events',
  'config',
  'querystring',
  'data/data',
  'text!templates/form.html',
  'text!templates/plain-input.html',
  'text!templates/select-input.html',
  'text!templates/captcha.html'
], function($, Backbone, _, Mustache, Events, config, qs, Data, formTemplate, plainInputTemplate, selectInputTemplate, captchaTemplate){
  function makeUID() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  var LegislatorView = Backbone.View.extend({
    captcha_uid: makeUID(),
    el: '.form-container',
    events: {
      'submit form.congress-forms-test': 'fillOutForm',
      'click .btn-submit-captcha': 'fillOutCaptcha',
      'click .btn-populate-defaults': 'populateDefaults'
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
          that.$el.html(Mustache.render(formTemplate, {bioguide_id: bioguide_id}));

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
          // Loop through our newly merged actions and output them to form
          _.each(actions, function(field){
            if(field.type === 'textarea') {

            } else if (field.options_hash !== null || field.name === '$ADDRESS_STATE_POSTAL_ABBREV' || field.name === '$ADDRESS_STATE') {
              // TODO - This logic is god awful, clean it up once it all makes more sense
              // or maybe the server can return a better data type
              // There is some logic here to handle if options_hash is an array, object or string
              if(field.name === '$ADDRESS_STATE_POSTAL_ABBREV' || field.name === '$ADDRESS_STATE') {
                field.options = config.STATES;
                delete field.options_hash;
              } 

              // If options_hash is an array of objects
              if(field.options_hash && $.isArray(field.options_hash) && typeof field.options_hash[0] === 'object') {
                var temp_options_hash = {};
                _.each(field.options_hash, function(option, key){
                  // Loop through properties of nested object
                  _.each(option, function (prop, propName) {
                    temp_options_hash[propName] = prop;
                  });
                });
                console.log(temp_options_hash);
                field.options_hash = temp_options_hash;
              }

              // If options_hash an object?
              if(field.options_hash && !$.isArray(field.options_hash)) {
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
      if(Data.legislators[that.model.get('bioguide_id')]) {
        var zip4 =  Data.legislators[that.model.get('bioguide_id')].zip4;
        data['$ADDRESS_ZIP4'] = zip4;
      }
      $.ajax({
        url: config.CONTACT_CONGRESS_SERVER + '/fill-out-form',
        type: 'post',
        data: {
          bio_id: this.model.get('bioguide_id'),
          uid: that.captcha_uid,
          fields: data
        },
        success: function( data ) {
          console.log(arguments);
          if(data.status === 'captcha_needed') {
            $('.captcha-container').append(Mustache.render(captchaTemplate, {captcha_url: config.CONTACT_CONGRESS_SERVER + data.url}));
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
      that.$el.find('input, textarea, button, select').attr('disabled', 'disabled');

      $.ajax({
        url: config.CONTACT_CONGRESS_SERVER + '/fill-out-captcha',
        type: 'post',
        data: {
          uid: that.captcha_uid,
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
      var that = this;
      Events.on('BIOGUIDE_ERROR', function () {
        // If there is a form error, reset the UID
        that.captcha_uid = makeUID();
      });
    },
    populateDefaults: function () {
      var that = this;

      // Required fields example data
      _.each(config.EXAMPLE_DATA, function(example) {
        $('[type="text"][name="' + example.name + '"]').val(example.example);
      });

      // Legislator specific example data
      var legislator = Data.legislators[that.model.get('bioguide_id')];
      if(legislator) {
        $('[type="text"][name="$ADDRESS_ZIP5"]').val(legislator.zip5);
        $('[type="text"][name="$ADDRESS_STREET"]').val(legislator.example_address);
        $('[type="text"][name="$ADDRESS_CITY"]').val(legislator.example_city);
        $('[type="text"][name="$ADDRESS_ZIP4"]').val(legislator.zip4);
      }
    }
  })
  return LegislatorView;
});

