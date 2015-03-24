'use strict';

var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');
var mkdirp = require('mkdirp');

function createPlugin(options) {
  var requirePath = path.resolve(options.requirePath);
  var filePath = path.join(requirePath, 'index.js');
  var templatePath = path.resolve('test/example-plugin.template.js');
  var template;
  try {
    template = fs.readFileSync(templatePath);
  }
  catch (e) {
    //do nothing
  }
  var pluginFile = template
    .toString()
    .replace( /NAME/g , options.name)
    .replace( /CATEGORY/g , options.category);
  try {
    mkdirp.sync(path.dirname(filePath), {
      mode: parseInt('0777', 8),
    });
  }
  catch (e) {
    //do nothing
  }
  try {
    fs.writeFileSync(filePath, pluginFile);
  }
  catch (e) {
    //do nothing
  }
}

function cleanUpPlugin(options) {
  var requirePath = options.requirePath;

  try {
    rimraf.sync(requirePath);
  }
  catch (e) {
    //do nothing
  }
}

module.exports = {
  createPlugin: createPlugin,
  cleanUpPlugin: cleanUpPlugin,
};
