# grunt-compile-reveal

> Compiles reveal.js slide decks

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-compile-reveal --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-compile-reveal');
```

## The "compile_revealjs" task

### Overview
In your project's Gruntfile, add a section named `compile_revealjs` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  compile_revealjs: {
    slidedecks: {
      src: ["json/**/*.json"],
      dest: "./"
    }
  },
});
```

Every JSON file represents a whole slide deck and needs to follow this scheme:

```js
{
  "layout": "layout/index.html",
  "slides": [
    {
      "template": "templates/headline-text.html",
      "data": {
        "headline": "Headline",
        "text": "Lorem ipsum"
      }
    }, {
      "slides": [
        {
          "template": "templates/headline-text.html",
          "data": {
              "headline": "Headline Subslide 1",
              "text": "Lorem ipsum"
          }
        }, {
          "template": "templates/headline-text.html",
          "data": {
              "headline": "Headline Subslide 2",
              "text": "Lorem ipsum"
          }
        }
      ]
    }
  ]
}
```

```layout``` defines the outer hull of your presentation, basically everything except what is inside ```<div class="slides">```. Place a ```{{ slides }}``` Where the slides should be inserted later. E.g.:

 ```html
 <div class="slides">{{ slides }}</div>
 ```

```slides```is an array of all the slides.

```template``` defines for each slide which HTML template to use.

```data``` holds all the values to put into the template. E.g. the value ```headline``` value would be inserted into the template at a placeholder named ```{{ headline }}```.

If you want to put (vertical) subslides into a (horizontal) slide, slip another property ```slides``` into a slide array item that you then populate the same way as the higher level ```slides``` property.

Why is it not called ```subslides``` or something similar? Well, the way it is now you can rearrange the nesting of your presentation by just copying and pasting.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
