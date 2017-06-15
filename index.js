/*
Copyright (c) 2014-2017 Ryan Olson

GNU GENERAL PUBLIC LICENSE
    Version 3, 29 June 2007

This file is part of gulp-dev.

gulp-dev is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

gulp-dev is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with gulp-dev.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

var gutil = require('gulp-util');
var through = require('through2');

module.exports = function(inDevelopmentMode) {
  return through.obj(function (file, enc, cb) {
    //pass through
    if(file.isNull()) {
      this.push(file);
      return cb();
    }

    //streams not supported
    if(file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-dev', 'streaming not supported'));
      return cb();
    }

    var fileContents = file.contents.toString('utf-8');
    file.contents = processFileContents(fileContents, inDevelopmentMode);

    this.push(file);
    return cb();
  });
};

function processFileContents(fileContents, inDevelopmentMode) {
  var data = fileContents;

  data = processFileContentsForBlock(
    data,
    '<!-- dev -->',
    '<!-- /dev -->',
    /* commentOutContentsInBlock */ !inDevelopmentMode);

  data = processFileContentsForBlock(
    data,
    '<!-- !dev -->',
    '<!-- /!dev -->',
    /* commentOutContentsInBlock */ inDevelopmentMode);

  return new Buffer(data);
}

function processFileContentsForBlock(
  fileContents,
  startBlockComment,
  endBlockComment,
  commentOutContentsInBlock) {
  var i;

  var stripHtmlCommentRegex = /<!--(.*)-->/;

  var inBlock = false;
  var lines = fileContents.split('\n');

  for(i = 0; i < lines.length; i++) {
    var line = lines[i];

    if(line.indexOf(endBlockComment) >= 0) {
     inBlock = false;
    }

    if(inBlock) {
      var match = line.match(stripHtmlCommentRegex);
      if(!commentOutContentsInBlock) {
        if(match) {
          lines[i] = match[1].trim();
        }
      } else {
        if(!match) { //if isn't already commented out
          lines[i] = '<!-- {0} -->'.replace('{0}', line);
        }
      }
    }

    if((line.indexOf(startBlockComment) >= 0) || (line.indexOf(endBlockComment) >= 0)) {
      inBlock = (line.indexOf(startBlockComment) >= 0);
    }
  }

  return lines.join('\n');
}
