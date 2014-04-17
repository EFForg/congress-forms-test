require.config({
  paths: {
    jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min',
    lodash: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min',
    underscore: 'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
    backbone: 'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min',
    mustache: 'https://cdnjs.cloudflare.com/ajax/libs/mustache.js/0.7.2/mustache.min',
    text: 'https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.10/text',
    marked: 'https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.1/marked.min',
    fancybox: 'https://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.pack',
    async: 'lib/async',
    jsyaml: 'lib/js-yaml.min',
    moment: 'lib/moment.min',
    templates: '../templates',
    querystring: 'lib/querystring'
  }

});

require([
  'config',
  'jquery',
  'mustache',
  'querystring',
  'lib/events',
  'lodash',
  'jsyaml',
  'marked',
  'data/data',
  'fancybox',
  'async',
  'models/legislator',
  'models/fill_attempt',
  'collections/legislator_actions',
  'collections/fill_attempts',
  'views/legislator',
  'views/form',
  'views/legislator_actions',
  'views/legislator_status',
  'views/fill_attempts',
  'views/comments',
  'text!templates/legislator_status.html',
  'text!templates/legislator_status_row.html'
], function(
    config,
    $,
    Mustache,
    qs,
    Events,
    _,
    jsyaml,
    marked,
    Data,
    fancybox,
    async,
    LegislatorModel,
    FillAttemptModel,
    LegislatorActionCollection,
    FillAttemptCollection,
    LegislatorView,
    FormView,
    LegislatorActionsView,
    LegislatorStatusView,
    FillAttemptsView,
    Comments,
    legislatorStatusTemplate,
    legislatorStatusRowTemplate
  ){
  console.log(qs.get());
  // Get the legislator id from query string
  var bioguide_id = qs.get().bioguide_id || '';

  // Bring in Example data from YAML file
  $.ajax({
    url: 'https://corsgithub.herokuapp.com/unitedstates/contact-congress/master/support/variables.yaml',
    success: function (exampleYaml) {
      var exampleData = jsyaml.load(exampleYaml);
      var examples = [];
      _.each(exampleData, function(example, key) {
        examples.push({
          name: key,
          example: example.example
        });
      });
      // Turn example object into array
      config.EXAMPLE_DATA = examples;
      console.log(config.EXAMPLE_DATA);
      return;
    }
  });

  if(bioguide_id.length > 0) {
    $('.bioguide-form-container').show();
    // Fetch legislator data from Sunlight Labs
    var legislator = new LegislatorModel({
      bioguide_id: bioguide_id
    });
    var legislator_actions = new LegislatorActionCollection({
      bioguide_id: bioguide_id
    });
    var fill_attempts = new FillAttemptCollection({
      bioguide_id: bioguide_id
    });

    legislator.fetch({
      success: function (legislator) {
        console.log(legislator);
        var legislatorView = new LegislatorView({model: legislator});
        legislatorView.render();

        var formView = new FormView({model: legislator});
        formView.render();

        var comments = new Comments({model: legislator});
        comments.render();
        legislator_actions.fetch({
          success: function(legislator_actions){
            var legislator_actions_view = new LegislatorActionsView({
              collection: legislator_actions
            });
            // TODO - start refactoring these hacks
            // This one pulls the contact form url from the YAML file
            console.log(legislator_actions);
            if(legislator_actions.models[0] && legislator_actions.models[0].attributes.action === 'visit') {
              $('.contact-form-url').attr('href', legislator_actions.models[0].attributes.value);
              // Will remain the sunlight labs url if none set
            }
            legislator_actions_view.render();
          }
        });
      }
    })


    var showFillStatuses = function () {
      console.log('Reloading last error');
      fill_attempts.fetch({
        success: function(fill_attempts){
          console.log(fill_attempts);
          var fill_attempts_view = new FillAttemptsView({
            collection: fill_attempts
          });
          fill_attempts_view.render();
        }
      });
    }
    Events.on('BIOGUIDE_ERROR', showFillStatuses);
    showFillStatuses();
  } else {
    //LegislatorStatusView
    console.log(_.keys(Data.legislators).length);
    $('.legislator-status-container').show();
    async.parallel({
      congress_forms: function(cb){
        $.ajax({
          url: config.CONTACT_CONGRESS_SERVER + '/list-congress-members',
          success: function (legislators) {
            cb(null, legislators);
            return;
          }
        });
      },
      sunlight: function(cb){
        $.ajax({
          url: 'https://congress.api.sunlightfoundation.com/legislators?per_page=all&apikey=' + config.SUNLIGHT_API_KEY,
          success: function (legislator_obj) {
            cb(null, legislator_obj.results);
            return;
          }
        });
      }
    }, function(err, results){
      var current_legislators = _.object(_.map(results.sunlight, function(l){ return l.bioguide_id }),results.sunlight);
      var legislators = _.object(_.map(results.congress_forms, function(l){return l.bioguide_id}),results.congress_forms);

      var current_obj = _.map(current_legislators, function(current_legislator){
        if(current_legislator.bioguide_id in legislators){
          return legislators[current_legislator.bioguide_id];
        } else {
          return {
            form_domain_url: current_legislator.website,
            bioguide_id: current_legislator.bioguide_id
          }
        }
      });

      var current_legislators_sorted = _.sortBy(_.values(current_obj), function(legislator){
        return legislator.bioguide_id;
      });

      var former_legislators_arr = _.difference(_.keys(legislators), _.keys(current_legislators)).sort();
      var former_legislators = _.map(former_legislators_arr, function(former_bioguide_id){
        return legislators[former_bioguide_id];
      });

      var legislator_render_row = function(legislator){
        return Mustache.render(legislatorStatusRowTemplate, {
          congress_forms_server: config.CONTACT_CONGRESS_SERVER,
          link: "<a href='" + legislator.form_domain_url + "'>" + legislator.form_domain_url.replace("http://","").replace("https://","") + "</a>",
          bioguide_id: legislator.bioguide_id
        });
      }
      $('#current-legislators.legislator-status-container .status-container').html(Mustache.render(legislatorStatusTemplate));
      $('#current-legislators.legislator-status-container tbody').html(_.map(current_legislators_sorted, legislator_render_row).join(""));
      $('#former-legislators.legislator-status-container .status-container').html(Mustache.render(legislatorStatusTemplate));
      $('#former-legislators.legislator-status-container tbody').html(_.map(former_legislators, legislator_render_row).join(""));

    });
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
