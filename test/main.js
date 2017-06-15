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
var assert = require('assert');
var fs = require('fs');
var gutil = require('gulp-util');
var dev = require('../');

it('should transform html file for development', function(cb) {
  var stream = dev(true);

  var filename = 'test/fixtures/test.html';
  var expectedFilename = 'test/fixtures/expected-for-development.html';

  stream.on('data', function(file) {
    var fileContents = file.contents.toString('utf-8');
    assert(fileContents === expectedFileContents,
      'files did NOT match.');
  });

  stream.on('end', cb);

  var testFile = fs.readFileSync(filename);
  var expectedFileContents = fs.readFileSync(expectedFilename).toString('utf-8');

  stream.write(new gutil.File({
    contents: new Buffer(testFile.toString())
  }));

  stream.end();
});

it('should transform html file for production', function(cb) {
  var stream = dev(false);

  var filename = 'test/fixtures/test.html';
  var expectedFilename = 'test/fixtures/expected-for-prod.html';

  stream.on('data', function(file) {
    var fileContents = file.contents.toString('utf-8');
    assert(fileContents === expectedFileContents,
      'files did NOT match.');
  });

  stream.on('end', cb);

  var testFile = fs.readFileSync(filename);
  var expectedFileContents = fs.readFileSync(expectedFilename).toString('utf-8');

  stream.write(new gutil.File({
    contents: new Buffer(testFile.toString())
  }));

  stream.end();
});
