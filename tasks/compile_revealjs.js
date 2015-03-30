/*
 * grunt-compile-revealjs
 * https://github.com/Schepp/grunt-compile-revealjs
 *
 * Copyright (c) 2014 Christian Schaefer
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('compile_revealjs', 'Compiles reveal.js slidedecks', function () {
        // Iterate over all specified file groups.
        this.files.forEach(function (f) {
            var path = require('path'),
                sources = grunt.file.expand({}, f.src),
                setConfig = function (html, config) {
                    var globalAttributes = [
                            'accesskey',
                            'class',
                            'contenteditable',
                            'contextmenu',
                            'dir',
                            'draggable',
                            'dropzone',
                            'hidden',
                            'id',
                            'lang',
                            'spellcheck',
                            'style',
                            'tabindex',
                            'title',
                            'translate'
                        ],
                        attribute,
                        sectionHTML,
                        presentAttributesString,
                        presentAttributesArray,
                        presentAttributes = {};

                    sectionHTML = html.replace(/[\s\S]*(<section[^>]*>)[\s\S]*/, '$1');
                    presentAttributesString = sectionHTML.replace(/<section\s*(.*)>/, '$1');
                    presentAttributesString = presentAttributesString.replace(/([^'"])\s/g, '$1§');
                    presentAttributesArray = presentAttributesString.split(' ');
                    if (presentAttributesArray.length) {
                        presentAttributesArray.forEach(function (attribute) {
                            var keyvalueArray = attribute.split('='),
                                key = keyvalueArray[0].replace(/^data\-/, '').toLowerCase(),
                                value;

                            if (keyvalueArray.length > 1) {
                                value = keyvalueArray[1]
                                    .replace(/§/g, ' ')
                                    .replace(/^["']/, '')
                                    .replace(/["']$/, '');

                                if (key === 'id') {
                                    value = value
                                        .replace(/[^_a-z0-9]/g, "-");
                                }

                                presentAttributes[key] = value;
                            }
                        });
                    }

                    for (attribute in config) {
                        if (config.hasOwnProperty(attribute)) {
                            if (attribute === 'id') {
                                config[attribute] = config[attribute].replace(/[^_a-z0-9]/g, "-");
                            }

                            presentAttributes[attribute.toLowerCase()] = config[attribute];
                        }
                    }

                    sectionHTML = '<section';
                    for (attribute in presentAttributes) {
                        if (presentAttributes.hasOwnProperty(attribute)) {
                            sectionHTML += ' ';
                            if (globalAttributes.indexOf(attribute) !== -1) {
                                sectionHTML += attribute;
                            } else {
                                sectionHTML += 'data-' + attribute;
                            }
                            sectionHTML += '="';
                            sectionHTML += presentAttributes[attribute];
                            sectionHTML += '"';
                        }
                    }
                    sectionHTML += '>';
                    html = html.replace(/<section[^>]*>/, sectionHTML);

                    return html;
                },
                renderCurrentSlide = function (slide) {
                    var html = grunt.file.read(slide.template),
                        entry,
                        regex;

                    html = setConfig(html, slide.config);

                    for (entry in slide.data) {
                        if (slide.data.hasOwnProperty(entry)) {
                            regex = new RegExp('{{ ' + entry + ' }}', 'g');
                            html = html.replace(regex, slide.data[entry]);
                        }
                    }

                    return html;
                },
                renderSlide = function (slide) {
                    var html = "";

                    if (slide.slides) {
                        html += '<section>';
                        html += renderSubslides(slide.slides);
                        html += '</section>';
                        html = setConfig(html, slide.config);
                    } else {
                        html += renderCurrentSlide(slide);
                    }

                    return html;
                },
                renderVariant = function (variant, slides) {
                    var html = '',
                        regex = new RegExp('@@variant', 'g');

                    slides.forEach(function (slide) {
                        if (
                            slide.exclude &&
                            slide.exclude.forEach &&
                            slide.exclude.indexOf(variant) !== -1
                        ) {
                            return;
                        }
                        html += renderSlide(slide);
                    });

                    html = html.replace(regex, variant);

                    return html;
                };

            sources = sources.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    grunt.log.writeln('Source file "' + filepath + '" found.');
                    return true;
                }
            });

            sources.forEach(function (filepath) {
                var newbase = path.dirname(filepath),
                    master = path.basename(filepath).split('.')[0],
                    config = JSON.parse(grunt.file.read(filepath)),
                    origbase = process.cwd(),
                    layoutHtml;

                grunt.file.setBase(newbase);

                layoutHtml = grunt.file.read(config.layout);

                config.variants.push(master);
                config.variants.forEach(function (variant) {
                    var html = renderVariant(variant, config.slides),
                        regexEmptyAttribute = new RegExp('\\s[^\\s]+=[\'"]{0,1}{{ [^\\s]+ }}[\'"]{0,1}', 'g'),
                        regexEmptyElements = new RegExp('<[^>]+>\\s*{{ [^\\s]+ }}</[^>]+>', 'g'),
                        regexEmpty = new RegExp('{{ [^\\s]+ }}', 'g'),
                        regexSlides = new RegExp('{{ slides }}'),
                        destination;

                    html = html.replace(regexEmptyAttribute, '');
                    html = html.replace(regexEmptyElements, '');
                    html = html.replace(regexEmpty, '');
                    html = layoutHtml.replace(regexSlides, html);
                    destination = filepath
                        .replace(master, variant)
                        .replace('.json', '.html');
                    destination = path.basename(destination);
                    destination = f.dest ? f.dest + '/' + destination : destination;

                    grunt.log.writeln(destination);
                    grunt.file.write(destination, html);
                });

                // Reset the base
                grunt.file.setBase(origbase);
            });
        });
    });

};
