define({
  get: function () {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1].indexOf('#') === -1 ? hash[1] : hash[1].substr(0, hash[1].indexOf('#'));
    }
    return vars;
  }
});