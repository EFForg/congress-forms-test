define([
  'text!https://rawgit.com/EFForg/congress-zip-plus-four/master/legislators.json',
], function(legislators) {
  return {
    legislators: JSON.parse(legislators)
  }
});
