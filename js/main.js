require.config({
  paths: {
    jquery: 'lib/jquery/jquery.min',
    underscore: 'lib/lodash/lodash.min',
    backbone: 'lib/backbone/backbone.min',
    mustache: 'lib/mustache/mustache.min',
    text: 'lib/text/text.min',
    marked: 'lib/marked/marked.min',
    async: 'lib/async/async.min',
    jsyaml: 'lib/js-yaml/js-yaml.min',
    moment: 'lib/moment/moment.min',
    templates: '../templates',
    querystring: 'lib/querystring'
  },
  config: {
    text: {
      useXhr: function(){
        return true;
      }
    }
  }

});

require([
  'config',
  'jquery',
  'mustache',
  'querystring',
  'lib/events',
  'underscore',
  'jsyaml',
  'marked',
  'data/data',
  'async',
  'models/legislator',
  'models/fill_attempt',
  'collections/legislator_actions',
  'collections/fill_attempts',
  'collections/jobs',
  'views/legislator',
  'views/form',
  'views/legislator_actions',
  'views/legislator_status',
  'views/fill_attempts',
  'views/jobs',
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
    async,
    LegislatorModel,
    FillAttemptModel,
    LegislatorActionCollection,
    FillAttemptCollection,
    JobCollection,
    LegislatorView,
    FormView,
    LegislatorActionsView,
    LegislatorStatusView,
    FillAttemptsView,
    JobsView,
    Comments,
    legislatorStatusTemplate,
    legislatorStatusRowTemplate
  ){
  console.log(qs.get());
  // Get the legislator id from query string 
  var bioguide_id = qs.get().bioguide_id || '';

  // Bring in Example data from YAML file
  $.ajax({
    url: 'https://rawgit.com/unitedstates/contact-congress/master/support/variables.yaml',
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
    var jobs = new JobCollection({
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

    var showJobs = function () {
      jobs.fetch({
        success: function(jobs){
          var jobs_view = new JobsView({
            collection: jobs
          });
          jobs_view.render();
        }
      });
    }
    Events.on('BIOGUIDE_ERROR', showFillStatuses);
    showFillStatuses();
    showJobs();
  } else {
    //LegislatorStatusView
    console.log(_.keys(Data.legislators).length);
    $('.legislator-status-container').show();

    async.parallel({
      congress_forms: function(cb){
        $.ajax({
          url: config.CONTACT_CONGRESS_SERVER + '/list-congress-members?debug_key=' + config.DEBUG_KEY,
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

      var current_legislators_sorted;
      // switch weather it is ascending or not after every sort
      var ascending = true;

      function sort_by(property){
        current_legislators_sorted = _.sortBy(_.values(current_obj), function(legislator){
          return legislator[property] || 0;
        });
        if(!ascending){
          current_legislators_sorted = current_legislators_sorted.reverse();
        }
        ascending = !ascending;
      }

      function render_rows(){
        $('#current-legislators.legislator-status-container tbody').html(_.map(current_legislators_sorted, legislator_render_row).join(""));
      }

      var former_legislators_arr = _.difference(_.keys(legislators), _.keys(current_legislators)).sort();
      var former_legislators = _.map(former_legislators_arr, function(former_bioguide_id){
        return legislators[former_bioguide_id];
      });

      var legislator_render_row = function(legislator){
        return Mustache.render(legislatorStatusRowTemplate, {
          congress_forms_server: config.CONTACT_CONGRESS_SERVER,
          debug_key: config.DEBUG_KEY,
          link: (legislator.form_domain_url ? "<a href='" + legislator.form_domain_url + "'>" + legislator.form_domain_url.replace("http://","").replace("https://","") + "</a>" : ""),
          bioguide_id: legislator.bioguide_id,
          jobs: legislator.jobs || ""
        });
      }
      $('#current-legislators.legislator-status-container .status-container').html(Mustache.render(legislatorStatusTemplate));
      sort_and_render('bioguide_id')();
      $('#former-legislators.legislator-status-container .status-container').html(Mustache.render(legislatorStatusTemplate));
      $('#former-legislators.legislator-status-container tbody').html(_.map(former_legislators, legislator_render_row).join(""));

      function sort_and_render(property){
        return function(){
          $('thead td').removeClass('header_sorted');
          $('.' + property + '_header').addClass('header_sorted');
          sort_by(property);
          render_rows();
        };
      }
      $('.bioguide_id_header').on('click', sort_and_render('bioguide_id'));
      $('.jobs_header').on('click', sort_and_render('jobs'));
    });
  }
});
