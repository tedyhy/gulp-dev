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
    /* removeContentsInBlock */ !inDevelopmentMode);

  data = processFileContentsForBlock(
    data,
    '<!-- !dev -->',
    '<!-- /!dev -->',
    /* removeContentsInBlock */ inDevelopmentMode);

  return new Buffer(data);
}

function processFileContentsForBlock(
  fileContents,
  startBlockComment,
  endBlockComment,
  removeContentsInBlock) {
  var i;

  var stripHtmlCommentRegex = /<!--(.*)-->/;

  var inBlock = false;
  var indexesOfLinesToRemove = [];
  var lines = fileContents.split('\n');

  for(i = 0; i < lines.length; i++) {
    var line = lines[i];

    if(line === endBlockComment) {
     inBlock = false;
    }

    if(inBlock) {
      if(!removeContentsInBlock) {
        var match = line.match(stripHtmlCommentRegex);
        if(match) {
          lines[i] = match[1].trim();
        }
      } else {
        indexesOfLinesToRemove.push(i);
      }
    }

    if(line === startBlockComment || line === endBlockComment) {
      indexesOfLinesToRemove.push(i);
      inBlock = line === startBlockComment;
    }
  }

  //remove block comments
  var amountRemoved = 0;
  for(i = 0; i < indexesOfLinesToRemove.length; i++) {
    var index = indexesOfLinesToRemove[i];
    lines.splice(index - amountRemoved++, 1);
  }

  return lines.join('\n');
}
