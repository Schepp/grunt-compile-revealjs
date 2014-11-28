/*
 * grunt-compile-revealjs
 * https://github.com/Schepp/grunt-compile-revealjs
 *
 * Copyright (c) 2014 Christian Schaefer
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('compile_revealjs', 'Compiles reveal.js slidedecks', function() {
    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      var path = require('path'),
          sources = grunt.file.expand({}, f.src),
          renderSlide = function(slide) {
            var html = "",
                entry,
                regex;

            if (slide.slides) {
              html += '<section>';

              slide.slides.forEach(function(subslide) {
                html += renderSlide(subslide);
              });

              html += '</section>';
            } else {
              html = grunt.file.read(slide.template);

              for (entry in slide.data) {
                if (slide.data.hasOwnProperty(entry)) {
                  regex = new RegExp('{{ ' + entry + ' }}', 'g');
                  html = html.replace(regex, slide.data[ entry ]);
                }
              }
            }

            return html;
          };

      sources = sources.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          grunt.log.writeln('Source file "' + filepath + '" found.');
          return true;
        }
      });

      sources.forEach(function(filepath) {
        var configJson = grunt.file.read(filepath),
            config = JSON.parse(configJson),
            regex = new RegExp('{{ slides }}'),
            layoutHtml = grunt.file.read(config.layout),
            slidesHtml = '',
            dest;

        config.slides.forEach(function(slide) {
          slidesHtml += renderSlide(slide);
        });

        layoutHtml = layoutHtml.replace(regex, slidesHtml);
        dest = filepath.replace('.json', '.html');
        dest = path.basename(dest);
        dest = f.dest ? f.dest + '/' + dest : dest;

        grunt.file.write(dest, layoutHtml);
      });
    });
  });

};