define([
  'jquery',
  'backbone',
  'underscore',
  'mustache',
  'lib/events',
  'config',
  'querystring',
  'data/data',
  'views/captcha',
  'views/recaptcha',
  'text!templates/form.html',
  'text!templates/plain-input.html',
  'text!templates/select-input.html',
], function($, Backbone, _, Mustache, Events, config, qs, Data, CaptchaView, RecaptchaView, formTemplate, plainInputTemplate, selectInputTemplate){
  var LegislatorView = Backbone.View.extend({
    el: '.form-container',
    events: {
      'submit form.congress-forms-test': 'fillOutForm',
      'click .btn-submit-captcha': 'submitCaptcha',
      'click .btn-populate-defaults': 'populateDefaults',
      'click .recaptcha-submit': 'submitCaptcha'
    },

    initialize: function () {
      _.bindAll(this, 'submitSuccessHandler');
    },

    has_recaptcha: false,

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
        url: config.PHANTOM_DC_SERVER + '/retrieve-form-elements',
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
            if(field.options_hash && 'google_recaptcha' in field.options_hash){
              that.has_recaptcha = true;
            }
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

    submitSuccessHandler: function(data){
      if(data.status === 'captcha_needed') {

        if(this.captcha_view)
          this.captcha_view.undelegateEvents();

        captcha_url = data.url.match(/^http(s)?:\/\//) ? data.url : config.PHANTOM_DC_SERVER + '/' + data.url;
        if(this.has_recaptcha){
          this.captcha_view = new RecaptchaView({
            el: '.captcha-container .form-group',
            captcha_url: captcha_url
          });
        } else {
          this.captcha_view = new CaptchaView({
            el: '.captcha-container .form-group',
            captcha_url: captcha_url
          });
        }
        this.captcha_view.render();

        $('.captcha-container').show();

        if(data.uid){
          this.current_uid = data.uid;
        }

      } else if (data.status === 'error') {
        this.$el.find('input, textarea, button, select').removeAttr('disabled');
        $('.form-error').slideDown(200).delay(4500).slideUp(200);
        Events.trigger('BIOGUIDE_ERROR');
      } else {
        $('.captcha-container').hide();
        $('.form-success').slideDown(200);
      }
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
        url: config.PHANTOM_DC_SERVER + '/fill-out-form',
        type: 'post',
        xhrFields: {
          withCredentials: true
        },
        data: {
          bio_id: this.model.get('bioguide_id'),
          fields: data
        },
        success: this.submitSuccessHandler
      });

      return false;
    },

    submitCaptcha: function (ev) {
      this.captcha_view.disable();
      this.$el.find('input, textarea, button, select').attr('disabled', 'disabled');

      $.ajax({
        url: config.PHANTOM_DC_SERVER + '/fill-out-captcha',
        type: 'post',
        xhrFields: {
          withCredentials: true
        },
        data: {
          uid: this.current_uid,
          answer: this.captcha_view.getAnswer()
        },
        success: this.submitSuccessHandler
      });

      return false;
    },

    populateDefaults: function () {
      var that = this;

      // Required fields example data
      _.each(config.EXAMPLE_DATA, function(example) {
        $('[type="text"][name="' + example.name + '"]').val(example.example);
      });

      // Legislator specific example data
      if(Data.legislators[that.model.get('bioguide_id')]) {
        var zip5 =  Data.legislators[that.model.get('bioguide_id')].zip5;
        $('[type="text"][name="$ADDRESS_ZIP5"]').val(zip5);

        var street =  Data.legislators[that.model.get('bioguide_id')].example_address;
        $('[type="text"][name="$ADDRESS_STREET"]').val(street);

        var city =  Data.legislators[that.model.get('bioguide_id')].example_city;
        $('[type="text"][name="$ADDRESS_CITY"]').val(city);

        var zip4 =  Data.legislators[that.model.get('bioguide_id')].zip4;
        $('[type="text"][name="$ADDRESS_ZIP4"]').val(zip4);

        var state =  Data.legislators[that.model.get('bioguide_id')].example_state;
        $('select[name="$ADDRESS_STATE_POSTAL_ABBREV"]').val(state);
        $('select[name="$ADDRESS_STATE_FULL"]').val(state);
      }
    }
  })
  return LegislatorView;
});

