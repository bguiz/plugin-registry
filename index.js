'use strict';

var path = require('path');

var DEFAULT_PLUGIN_CATEGORY = 'task';
var DEFAULT_REGISTRY_NAME = 'DEFAULT_REGISTRY';

function isAbsolutePath(pathToTest) {
  //NOTE `path.isAbsolute()` is not available on NodeJs 0.10.x
  return (path.resolve(pathToTest) === path.normalize(pathToTest));
}

function parsePluginDefinition(pluginDefinition, context) {
  if (typeof pluginDefinition === 'string') {
    pluginDefinition = {
      category: (context.defaultPluginCategory || DEFAULT_PLUGIN_CATEGORY),
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
  var plugin;

  var failedRequirePaths = [];
  if (typeof requirePath !== 'string') {
    var toolPath = (context.toolPath || path.resolve(__dirname, '../..'));
    var projectPath = (context.projectPath || path.resolve('.'));
    if (!isAbsolutePath(toolPath)) {
      throw new Error('Tool path should be an absolute path');
    }
    if (!isAbsolutePath(projectPath)) {
      throw new Error('Project path should be an absolute path');
    }
    [
      // first, check if this plugin is installed as one of tool's own dependencies
      path.resolve(toolPath, 'node_modules', name),
      // if not, check if this plugin is installed in the local project
      path.resolve(projectPath, 'node_modules', name),
      // lastly, check if this plugin is installed as a global installation
      // (sibling folder to tool itself)
      path.resolve(toolPath, '..', name)
    ].forEach(function testPossibleRequirePathForPlugin(pathToTest) {
      if (!requirePath) {
        try {
          plugin = require(pathToTest);
          // If require of the path did not throw, then we should use this path
          requirePath = pathToTest;
          // console.log('Plugin '+name+' will be loaded from ' + requirePath);
        }
        catch (e) {
          // Do nothing
          // console.log('Plugin '+name+' failed to load from ' + pathToTest);
          failedRequirePaths.push(pathToTest);
        }
      }
    });
  }

  // if none of these exist, then the plugin cannot be found
  // fail immediately
  if (!requirePath) {
    throw new Error([
      'Unable to find require path for plugin named '+name+':'
    ]
      .concat(failedRequirePaths)
      .join('\n'));
  }
  else if (!isAbsolutePath(requirePath)) {
    throw new Error('Require path should resolve to an absolute path');
  }
  else {
    pluginDefinition.requirePath = requirePath;
    pluginDefinition.plugin = plugin;
  }

  return pluginDefinition;
}

var registries = {};

function get(registryName) {
  var context = {};
  var contextHasBeenSet = false;

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

  fluent.context = function setContext(newContext) {
    if (!newContext) {
      throw new Error('Invalid context');
    }
    if (contextHasBeenSet) {
      throw new Error('Can only set context once for registry '+registryName);
    }
    context = newContext;
    contextHasBeenSet = true;

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
    var parsedDefinition = parsePluginDefinition(pluginDefinition, context);

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

  fluent.getContext = function getContext() {
    return context;
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
