require.config({
  paths: {
    jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min',
    lodash: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min',
    underscore: 'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
    backbone: 'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
    mustache: 'https://cdnjs.cloudflare.com/ajax/libs/mustache.js/0.7.2/mustache.min',
    text: 'https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.10/text',
    marked: 'https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.1/marked.min',
    fancybox: 'https://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.pack',
    jsyaml: 'lib/js-yaml.min',
    templates: '../templates',
    querystring: 'lib/querystring'
  }

});

require([
  'jquery',
  'mustache',
  'querystring',
  'marked',
  'fancybox',
  'models/legislator',
  'collections/legislator_actions',
  'views/legislator',
  'views/form',
  'views/legislator_actions',
  'views/legislator_status'
], function($, Mustache, qs, marked, fancybox, LegislatorModel, LegislatorActionCollection, LegislatorView, FormView, LegislatorActionsView, LegislatorStatusView){

  // Get the legislator id from query string 
  var bioguide_id = qs.get().bioguide_id || '';

  if(bioguide_id.length > 0) {
    $('.bioguide-form-container').show();
    // Fetch legislator data from Sunlight Labs
    var legislator = new LegislatorModel({
      bioguide_id: bioguide_id
    });
    var legislator_actions = new LegislatorActionCollection({
      bioguide_id: bioguide_id
    });

    legislator.fetch({
      success: function (legislator) {
        console.log(legislator);
        var legislatorView = new LegislatorView({model: legislator});
        legislatorView.render();

        var formView = new FormView({model: legislator});
        formView.render();
      }
    })

    legislator_actions.fetch({
      success: function(legislator_actions){
        var legislator_actions_view = new LegislatorActionsView({
          collection: legislator_actions
        });
        legislator_actions_view.render();
      }
    });
  } else {
    //LegislatorStatusView
    $('.legislator-status-container').show();
    $.ajax({
      url: 'http://corsgithub.herokuapp.com/EFForg/congress-forms/master/status.md',
      success: function (res) {
        $('.legislator-status-container .status-container').html(marked(res));
        $('.legislator-status-container table').addClass('table table-striped');
        var idCols = $('.legislator-status-container tr td:first-child');
        console.log(idCols);
        $.each(idCols, function(index, col) {
          $(col).html('<a href="?bioguide_id=' + $(col).text() + '"">' + $(col).text() + '</a>');
        });
      }
    })
    console.log('markdown');
  }
});











/* 
var helper = {
  dc_zips: [20001, 20002, 20003, 20004, 20005, 20006, 20007, 20008, 20009, 20010, 20011, 20012, 20015, 20016, 20017, 20018, 20019, 20020, 20024, 20032, 20036, 20037, 20045, 20052, 20053, 20057, 20064, 20202, 20204, 20228, 20230, 20240, 20245, 20260, 20307, 20317, 20319, 20373, 20390, 20405, 20418, 20427, 20506, 20510, 20520, 20535, 20540, 20551, 20553, 20560, 20565, 20566, 20593],
  zip_in_dc: function(zip){
    return ~_.indexOf(this.dc_zips, Number(zip));
  },
  format_label: function(string){
    var string_arr = string.replace("$","").replace("_"," ").split(" ");
    return _.map(string_arr, function(word){
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(" ");
  },
  create_uid: function(value, bio_id){
    return bio_id + "__" + value.replace("$","");
  }
}
*/
