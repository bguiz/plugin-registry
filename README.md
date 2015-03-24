# `plugin-registry`

Maintain a flexible and composable registry of plugins for your project.

[![NPM](https://nodei.co/npm/plugin-registry.png)](https://github.com/bguiz/plugin-registry/)

[![Build Status](https://travis-ci.org/bguiz/plugin-registry.svg?branch=master)](https://travis-ci.org/bguiz/plugin-registry)

## Usage

First, install `plugin-registry` locally.

```
npm install --save plugin-registry
```

Next, create a plugin registry for your tool.

```javascript
var pluginRegistry = require('plugin-registry');

pluginRegistry
  .get('my-tool')
  .context({
    toolPath: __dirname,
  })
  .add([
    'my-tool-foo-task',
    'my-tool-bar-task'
  ]);
```

Finally, access the plugin registry when you need it.

```javascript
var pluginRegistry = require('plugin-registry');

pluginRegistry
  .get('my-tool')
  .getAllOfCategory('task')
  .forEach(function eachTaskPluginDefinition(definition) {
    // Use `plugin` to do awesome things!
  });
```

Plugin registry will find the plugins by their name.
See advanced usage section below for details.

## Advanced usage

Plugins may be specified as objects as well,
not just strings:

```javascript
var pluginRegistry = require('plugin-registry');

pluginRegistry
  .get('my-tool')
  .context({
    toolPath: __dirname,
    projectPath: process.cwd(),
  })
  .add([
    {
      name: 'my-tool-foo-task',
    },
    {
      name: 'my-tool-bar-transform',
      category: 'stream-transform',
      requirePath: '/absolute/path/to/my-tool-bar-transform'
    }
  ]);
```

### Plugin Definition

#### `name`

- Type: `string`
- Optional: `false`
- Default: Not Applicable

#### `category`

- Type: `string`
- Optional: `true`
- Default: `task`

#### `requirePath`

- Type: `string`
- Optional: `true`
- Default: Determined programmatically based on value of name
  - By looking in the possible following locations:
    - A dependency of the tool using the plugin registry
    - A dependency of the project at the current working directory
    - A sibling folder of the tool using the plugin registry
      - If tool is a global installation, this will pick up other global installations
- Notes:
  - If specified, `requirePath` must be an absolute path
  - Relative paths are not allowed

### Parsed Plugin Definition

After plugin definitions have been parsed,
their optional values will be set,
as described above.

In addition, the plugin definitions are augmented:

#### `plugin`

The `require()`d plugin.

The plugin **must**, of course, be valid Javascript or JSON,
as per NodeJs' and CommonJs' specifications,
in order for this to work.

## Author

Maintained by Brendan Graetz

[bguiz.com](http://bguiz.com/)

## Licence

GPLv3
