# `plugin-registry`

Maintain a flexible and composable registry of plugins for your project.

[![NPM](https://nodei.co/npm/plugin-registry.png)](https://github.com/bguiz/plugin-registry/)

[![Build Status](https://travis-ci.org/bguiz/plugin-registry.svg?branch=master)](https://travis-ci.org/bguiz/plugin-registry)
[![Coverage Status](https://coveralls.io/repos/bguiz/plugin-registry/badge.svg?branch=master)](https://coveralls.io/r/bguiz/plugin-registry?branch=master)

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

### `context(pluginContext)`

When the tool asks plugin registry to find its plugins by name -
and not specify an explicit `requirePath`,
it attempts to infer the location of the plugin from a number of possible locations,
based on the location of the tool,
and the location of the project.

The default values for each of these work well in most cases, however,
they can be explicitly specified too if this is desired.

Note that this method can only be called once -
it does not make sense for the context to change once set.

#### `toolPath`

- Type: `string` - an **absolute** file path
- Optional: `true`
- Default: `path.dirname(module.parent.id)`, if available, otherwise `path.resolve(__dirname, '../..')`

#### `projectPath`

- Type: `string` - an **absolute** file path
- Optional: `true`
- Default: `path.resolve('.')` (current working directory)

### `add(pluginDefintion)`

#### `name`

- Type: `string`
- Optional: `false`
- Default: Not Applicable

#### `category`

- Type: `string`
- Optional: `true`
- Default: `task`

#### `requirePath`

- Type: `string` - an **absolute** file path
- Optional: `true`
- Default: Determined programmatically based on value of name
  - By looking in the possible following locations:
    - A dependency of the tool using the plugin registry
    - A dependency of the project at the current working directory
    - A sibling folder of the tool using the plugin registry
      - If tool is a global installation, this will pick up other global installations

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

## Contributing

This repository uses the **git flow** branching strategy.
If you wish to contribute, please branch from the **develop** branch -
pull requests will only be requested if they request merging into the develop branch.

## Author

Maintained by Brendan Graetz

[bguiz.com](http://bguiz.com/)

## Licence

GPLv3
