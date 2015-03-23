'use strict';

var path = require('path');

var DEFAULT_PLUGIN_CATEGORY = 'task';
var DEFAULT_REGISTRY_NAME = 'DEFAULT_REGISTRY';

function isAbsolutePath(pathToTest) {
  //NOTE `path.isAbsolute()` is not available on NodeJs 0.10.x
  return (path.resolve(pathToTest) === path.normalize(pathToTest));
}

function parsePluginDefinition(pluginDefinition, options) {
  if (typeof pluginDefinition === 'string') {
    pluginDefinition = {
      category: (options.defaultPluginCategory || DEFAULT_PLUGIN_CATEGORY),
      name: pluginDefinition
    };
  }

  var name = pluginDefinition.name;

  // attempt to determine requirePath from name
  if (typeof name !== 'string' || name.length < 1) {
    throw new Error('Plugins should have a name');
  }

  // attempt to determine requirePath from name
  if (typeof pluginDefinition.category !== 'string' ||
    pluginDefinition.category.length < 1) {
    throw new Error('Plugins should have a category');
  }

  var requirePath = pluginDefinition.requirePath;
  if (typeof requirePath !== 'string') {
    var projectPath = (options.projectPath || path.resolve(__dirname, '../..'));
    if (!isAbsolutePath(projectPath)) {
      throw new Error('Project path should be an absolute path');
    }
    [
      // first, check if this plugin is installed as one of angularity's own dependencies
      path.resolve(projectPath, 'node_modules', name),
      // if not, check if this plugin is installed in the local project
      path.resolve('node_modules', name),
      // lastly, check if this plugin is installed as a global installation
      // (sibling folder to angularity itself)
      path.resolve(projectPath, '..', name)
    ].forEach(function testPossibleRequirePathForPlugin(pathToTest) {
      if (!requirePath) {
        try {
          require(pathToTest);
          // If require of the path did not throw, then we should use this path
          requirePath = pathToTest;
          // console.log('Plugin '+name+' will be loaded from ' + requirePath);
        }
        catch (e) {
          // Do nothing
          // console.log('Plugin '+name+' failed to load from ' + pathToTest);
        }
      }
    });
  }

  // if none of these exist, then the plugin cannot be found
  // fail immediately
  if (!requirePath) {
    throw new Error('Unable to find require path for plugin named ' + name);
  }
  else if (!isAbsolutePath(requirePath)) {
    throw new Error('Require path should resolve to an absolute path');
  }
  else {
    pluginDefinition.requirePath = requirePath;
  }

  return pluginDefinition;
}

var registries = {};

function get(registryName) {
  var options = {};
  var optionsHaveBeenSet = false;

  if (!registryName) {
    registryName = DEFAULT_REGISTRY_NAME;
  }
  if (typeof registryName !== 'string' || registryName.length < 1) {
    throw new Error('Invalid name for registry');
  }
  var fluent = registries[registryName];

  // If a registry by this name exists, simply return it
  // (Multiton pattern)
  if (!!fluent) {
    return fluent;
  }

  // Otherwise create a new registry with a fluent interface,
  // cache it, then return it
  fluent = {
    registry: {},
  };

  fluent.options = function setOptions(newOptions) {
    if (!newOptions) {
      throw new Error('Invalid options');
    }
    if (optionsHaveBeenSet) {
      throw new Error('Can only set options once for registry '+registryName);
    }
    options = newOptions;
    optionsHaveBeenSet = true;

    return fluent;
  };

  fluent.add = function addPlugins() {
    var argumentsAsArray = Array.prototype.slice.apply(arguments);
    var pluginDefinitions = [];
    argumentsAsArray.forEach(function(argument) {
      pluginDefinitions = pluginDefinitions.concat(argument);
    });
    pluginDefinitions.forEach(addPluginImpl);
    return fluent;
  };

  function addPluginImpl(pluginDefinition) {
    var parsedDefinition = parsePluginDefinition(pluginDefinition, options);

    // add to the appropriate registry
    var category = parsedDefinition.category;
    var registryCategory = fluent.registry[category];
    if (!registryCategory) {
      registryCategory = [];
      fluent.registry[category] = registryCategory;
    }
    registryCategory.push(parsedDefinition);
  }

  fluent.getAllOfCategory = function getAllPluginsOfCategory(category) {
    return (fluent.registry[category] || []);
  };

  fluent.getFullRegistry = function getFullPluginRegistry() {
    return fluent.registry;
  };

  fluent.getOptions = function getOptions() {
    return options;
  };

  registries[registryName] = fluent;

  return fluent;
}

function reset() {
  registries = {};
}

module.exports = {
  get: get,
  reset: reset,
};
