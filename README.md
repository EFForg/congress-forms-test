congress-forms-test
===================


Way for volunteers to test EFF's congress-forms repo

<a href="javascript:(function(){s=document.createElement('script');s.type='text/javascript';s.src='https://raw.github.com/davatron5000/fitWeird/master/fitWeird.js?v='+parseInt(Math.random()*99999999);document.body.appendChild(s);})();">Copy this to book mark bar</a>

```
javascript:(function(){s=document.createElement('script');s.type='text/javascript';s.src='https://raw.github.com/davatron5000/fitWeird/master/fitWeird.js?v='+parseInt(Math.random()*99999999);document.body.appendChild(s);})();
```

## Usage

Check out the [congress-forms repo](https://github.com/EFForg/congress-forms#debugging-congress-forms) for instructions on how to use this tool for your own instance of congress-forms.

## Developers

To build the js assets, make sure you have [bower](http://bower.io/), [npm](https://www.npmjs.com/), and [grunt](http://gruntjs.com/) installed.

Then run:

    $ npm install

Now you can build the assets defined in `bower.json`:

    $ grunt bower
    $ grunt minify
