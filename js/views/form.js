define([
  'jquery',
  'backbone',
  'lodash',
  'mustache',
  'config',
  'querystring',
  'text!templates/form.html',
  'text!templates/plain-input.html',
  'text!templates/select-input.html'
], function($, Backbone, _, Mustache, config, qs, formTemplate, plainInputTemplate, selectInputTemplate){
  var LegislatorView = Backbone.View.extend({
    el: '.form-container',
    events: {
      'submit form.congress-forms-test': 'fillOutForm'
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


      $.ajax({
        url: config.CONTACT_CONGRESS_SERVER + '/fill-out-form',
        type: 'post',
        data: {
          bio_id: this.model.get('bioguide_id'),
          uid: 'tesadadas',
          fields: data
        },
        success: function( data ) {
          console.log(arguments);
        }
      });

      return false;
    },
    initialize: function () {
    }
  })
  return LegislatorView;
});

