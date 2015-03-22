'use strict';

var path = require('path');
var fs = require('fs');

var rimraf = require('rimraf');

function createPlugin(options, done) {
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
    fs.mkdirSync(path.dirname(filePath), parseInt('0777', 8));
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
  done();

  //NOTE node-jasmine does not work with async callbacks yet (will do in 2.1)
  //TODO upgrade to 2.1 when it is released, and then use the below async code instead
  // fs.readFile(templatePath, function onReadTemplateFile(err, buffer) {
  //   var template = buffer.toString();
  //   var pluginFile = template
  //     .replace( /NAME/g , options.name)
  //     .replace( /CATEGORY/g , options.category);
  //   // done();
  //   fs.mkdir(path.dirname(filePath), parseInt('0777', 8), function onMadeDirectory(err) {
  //     if (err) {
  //       console.error(err);
  //     }
  //     fs.writeFile(filePath, pluginFile, function onWrotePluginFile(err) {
  //       if (err) {
  //         console.err(err);
  //       }
  //       done();
  //     });
  //   });
  // });
}

function cleanUpPlugin(options, done) {
  var requirePath = options.requirePath;

  try {
    rimraf.sync(requirePath);
  }
  catch (e) {
    //do nothing
  }
  done();

  //TODO async version, see comment above
  // try {
  //   rimraf(requirePath, function onRemovedDirectory(err) {
  //     if (err) {
  //       console.err(err);
  //     }
  //     done();
  //   });
  // }
  // catch (e) {
  //   console.error('Attempted to delete path, but failed: '+requirePath);
  // }
  // done();
}

module.exports = {
  createPlugin: createPlugin,
  cleanUpPlugin: cleanUpPlugin,
};
