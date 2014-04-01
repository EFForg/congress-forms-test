require.config({
  paths: {
    jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min',
    lodash: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min',
    underscore: 'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
    backbone: 'http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
    mustache: 'https://cdnjs.cloudflare.com/ajax/libs/mustache.js/0.7.2/mustache.min',
    text: 'https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.10/text',
    templates: '../templates',
    querystring: 'lib/querystring'
  }

});

require([
  'jquery',
  'mustache',
  'querystring',
  'models/legislator',
  'views/legislator',
  'views/form'
], function($, Mustache, qs, LegislatorModel, LegislatorView, FormView){

  // Get the legislator id from query string 
  var bioguide_id = qs.get().bioguide_id || '';

  // Fetch legislator data from Sunlight Labs
  var legislator = new LegislatorModel({
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