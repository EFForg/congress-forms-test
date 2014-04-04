define([
  'jquery',
  'backbone',
  'underscore',
  'mustache',
  'querystring',
  'config',
  'jsyaml',
  'text!templates/legislator_action.html'
], function($, Backbone, _, Mustache, qs, config, jsyaml, legislatorActionTemplate){
  var LegislatorActionsView = Backbone.View.extend({
    render: function () {
      $('.legislator-actions-container').html(this.collection.map(function(legislator_action){
        var options = legislator_action.attributes.options == null ? "" : jsyaml.load(legislator_action.attributes.options);
        var options_html;
        if(typeof options == 'string'){
          options_html = "<em>" + options + "</em>";
        } else {
          options_html = "<ul>" + _.map(options, function(option){ return "<li>" + option + "</li>"; }).join("") + "</ul>";
        }
        return Mustache.render(legislatorActionTemplate, _.extend(
          {
            tr_class: legislator_action.attributes.step % 2 == 0 ? "active" : "",
            jsyaml: jsyaml,
            options_html: options_html
          },
          legislator_action.attributes
        ))
      }).join(""));
      $('.info_row').on('click', function(){
        $('.additional_info_row[data-step=' + $(this).data('step') + ']').toggle();
      });
    }
  })
  return LegislatorActionsView;
});
