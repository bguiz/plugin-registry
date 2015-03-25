'use strict';

var path = require('path');

var pluginRegistry = require('../index');

var helper = require('./helper');

function resetRegistry() {
  pluginRegistry.reset();
}

describe('[basic]', function() {
  describe('[access]', function() {
    describe('[registry creation]', function() {
      beforeEach(resetRegistry);

      it('Should create a default registry', function(done) {
        var instance = pluginRegistry.get();
        expect(instance).toBeDefined();
        expect(typeof instance.registry).toBe('object');
        expect(typeof instance.context).toBe('function');
        expect(typeof instance.add).toBe('function');
        expect(typeof instance.getAllOfCategory).toBe('function');
        expect(typeof instance.getFullRegistry).toBe('function');
        expect(typeof instance.getContext).toBe('function');
        done();
      });

      it('Should be able to create multiple registries', function(done) {
        var instance1;
        var instance2;
        expect(function() {
          instance1 = pluginRegistry.get('foo');
        }).not.toThrow();
        expect(function() {
          instance2 = pluginRegistry.get('bar');
        }).not.toThrow();
        expect(instance1).not.toEqual(instance2);

        done();
      });

      it('Should return the previous instance when accessing an already registered registry', function(done) {
        var instance1;
        var instance2;
        expect(function() {
          instance1 = pluginRegistry.get('foo');
        }).not.toThrow();
        expect(function() {
          instance2 = pluginRegistry.get('foo');
        }).not.toThrow();
        expect(instance1).toEqual(instance2);

        done();
      });

      it('Should not be able to create multiple default registries', function(done) {
        var instance1;
        var instance2;
        expect(function() {
          instance1 = pluginRegistry.get();
        }).not.toThrow();
        expect(function() {
          instance2 = pluginRegistry.get();
        }).not.toThrow();
        expect(instance1).toEqual(instance2);

        done();
      });

      it('Should allow context to be set on a registry exactly once', function(done) {
        var instance2;
        instance2 = pluginRegistry.get('foo');
        expect(function() {
          instance2.context({ myOption: 123 });
        }).not.toThrow();
        expect(function() {
          instance2.context({ myOption: 456 });
        }).toThrowError('Can only set context once for registry foo');
        done();
      });

      it('Should validate plugin definitions', function(done) {
        var instance1;
        var instance2;

        expect(function() {
          instance1 = pluginRegistry.get(42);
        }).toThrowError('Invalid name for registry');

        instance2 = pluginRegistry.get('foo');

        expect(function() {
          instance2.add({
            name: 'task-name',
          });
        }).toThrowError('Plugins should have a category');

        expect(function() {
          instance2.add({
            category: 'task',
          });
        }).toThrowError('Plugins should have a name');

        expect(function() {
          instance2.add({
            name: 'task-name',
            category: 'task',
            requirePath: './relative/path',
          });
        }).toThrowError('Require path specified should be an absolute path');

        done();
      });
    });

    describe('[add one plugin]', function() {
      //TODO replace with `beforeAll` once we get jasmine 2.1
      beforeEach(function() {
        helper.createPlugin({
          requirePath: './node_modules/foo-plugin',
          name: 'foo-plugin',
          category: 'generic-plugin',
        });
      });

      //TODO replace with `afterAll` once we get jasmine 2.1
      afterEach(function() {
        helper.cleanUpPlugin({
          requirePath: './node_modules/foo-plugin',
        });
      });

      describe('[]', function() {
        beforeEach(resetRegistry);

        it('Should register a single plugin', function(done) {
          var instance2;
          instance2 = pluginRegistry.get('foo');
          expect(function() {
            instance2.add({
              name: 'foo-plugin',
              category: 'generic-plugin',
            });
          }).not.toThrow();
          done();
        });

        it('Should register a single plugin with string (name) only', function(done) {
          var instance2;
          instance2 = pluginRegistry.get('foo');
          expect(function() {
            instance2.add('foo-plugin');
          }).not.toThrow();
          done();
        });

        it('Should load plugin with a explicit require path', function(done) {
          var instance2;
          instance2 = pluginRegistry.get('foo');
          expect(function() {
            instance2.add({
              requirePath: path.resolve(__dirname, '../node_modules/foo-plugin'),
              name: 'foo-plugin',
              category: 'generic-plugin',
            });
          }).not.toThrow();
          done();
        });

        it('Should not load a plugin with an explicit require path where the path is not absolute', function(done) {
          var instance2;
          instance2 = pluginRegistry.get('foo');
          expect(function() {
            instance2.add({
              requirePath: '../node_modules/foo-plugin',
              name: 'foo-plugin',
              category: 'generic-plugin',
            });
          }).toThrowError('Require path specified should be an absolute path');
          done();
        });
      });
    });

    describe('[add multiple plugins]', function() {
      //TODO replace with `beforeAll` once we get jasmine 2.1
      beforeEach(function() {
        helper.createPlugin({
          requirePath: './node_modules/foo-plugin',
          name: 'foo-plugin',
          category: 'generic-plugin',
        });
        helper.createPlugin({
          requirePath: './node_modules/bar-plugin',
          name: 'bar-plugin',
          category: 'generic-plugin',
        });
      });

      //TODO replace with `afterAll` once we get jasmine 2.1
      afterEach(function() {
        helper.cleanUpPlugin({
          requirePath: './node_modules/foo-plugin',
        });
        helper.cleanUpPlugin({
          requirePath: './node_modules/bar-plugin',
        });
      });

      describe('[]', function() {
        beforeEach(resetRegistry);

        it('Should register multiple plugins specified as arguments', function(done) {
          var instance2;
          instance2 = pluginRegistry.get('foo');
          expect(function() {
            instance2.add({
              requirePath: path.resolve(__dirname, '../node_modules/foo-plugin'),
              name: 'foo-plugin',
              category: 'generic-plugin',
            }, {
              requirePath: path.resolve(__dirname, '../node_modules/bar-plugin'),
              name: 'bar-plugin',
              category: 'generic-plugin',
            });
          }).not.toThrow();
          done();
        });

        it('Should register multiple plugins specified as an array', function(done) {
          var instance2;
          instance2 = pluginRegistry.get('foo');
          expect(function() {
            var pluginDefintions = [
              {
                requirePath: path.resolve(__dirname, '../node_modules/foo-plugin'),
                name: 'foo-plugin',
                category: 'generic-plugin',
              },
              {
                requirePath: path.resolve(__dirname, '../node_modules/bar-plugin'),
                name: 'bar-plugin',
                category: 'generic-plugin',
              }
            ];
            instance2.add(pluginDefintions);
          }).not.toThrow();
          done();
        });

        it('Should register multiple plugins fluently', function(done) {
          expect(function() {
            pluginRegistry
              .get('foo')
              .add({
                requirePath: path.resolve(__dirname, '../node_modules/foo-plugin'),
                name: 'foo-plugin',
                category: 'generic-plugin',
              })
              .add({
                requirePath: path.resolve(__dirname, '../node_modules/bar-plugin'),
                name: 'bar-plugin',
                category: 'generic-plugin',
              });
          }).not.toThrow();
          done();
        });
      });

    });

    describe('[plugins in different locations]', function() {
      var toolLocalBasePath = path.resolve(__dirname, '..');
      var projectLocalRootPath = path.resolve(__dirname, '../plugin-registry-test-temp-folder');
      var projectLocalBasePath = path.resolve(projectLocalRootPath, 'project/another');

      var toolLocalPath = path.resolve(toolLocalBasePath, './node_modules/tool-local-plugin');
      var projectLocalPath = path.resolve(projectLocalBasePath, './node_modules/project-local-plugin');
      var globalPath = path.resolve(toolLocalBasePath, '../global-plugin');

      //TODO replace with `beforeAll` once we get jasmine 2.1
      beforeEach(function() {
        helper.createPlugin({
          requirePath: toolLocalPath,
          name: 'tool-local-plugin',
          category: 'plugin-type-1',
        });
        helper.createPlugin({
          requirePath: projectLocalPath,
          name: 'project-local-plugin',
          category: 'plugin-type-2',
        });
        helper.createPlugin({
          requirePath: globalPath,
          name: 'global-plugin',
          category: 'plugin-type-2',
        });
      });

      //TODO replace with `afterAll` once we get jasmine 2.1
      afterEach(function() {
        helper.cleanUpPlugin({
          requirePath: toolLocalPath,
        });
        helper.cleanUpPlugin({
          requirePath: projectLocalRootPath,
        });
        helper.cleanUpPlugin({
          requirePath: globalPath,
        });
      });

      describe('[test for files]', function() {
        beforeEach(resetRegistry);

        it('Should test for files in tool local location', function(done) {
          expect(function() {
            pluginRegistry
              .get('foo')
              .context({
                toolPath: toolLocalBasePath,
                projectPath: projectLocalBasePath,
              })
              .add({
                name: 'tool-local-plugin',
                category: 'generic-plugin',
              });
          }).not.toThrow();

          done();
        });

        it('Should test for files in project local location', function(done) {
          expect(function() {
            pluginRegistry
              .get('foo')
              .context({
                toolPath: toolLocalBasePath,
                projectPath: projectLocalBasePath,
              })
              .add({
                name: 'project-local-plugin',
                category: 'generic-plugin',
              });
          }).not.toThrow();

          done();
        });

        it('Should test for files in global location', function(done) {
          expect(function() {
            pluginRegistry
              .get('foo')
              .context({
                toolPath: toolLocalBasePath,
                projectPath: projectLocalBasePath,
              })
              .add({
                name: 'global-plugin',
                category: 'generic-plugin',
              });
          }).not.toThrow();

          done();
        });

        it('Should test for files in all locations', function(done) {
          expect(function() {
            pluginRegistry
              .get('foo')
              .context({
                toolPath: toolLocalBasePath,
                projectPath: projectLocalBasePath,
              })
              .add({
                name: 'tool-local-plugin',
                category: 'generic-plugin',
              })
              .add({
                name: 'project-local-plugin',
                category: 'generic-plugin',
              })
              .add({
                name: 'global-plugin',
                category: 'generic-plugin',
              });
          }).not.toThrow();

          done();
        });
      });

      describe('[query registry]', function() {
        beforeEach(resetRegistry);

        it('Should clear registry when reset called', function(done) {
          var instance2 = pluginRegistry
            .get('foo')
            .context({
              toolPath: toolLocalBasePath,
              projectPath: projectLocalBasePath,
            })
            .add({
              name: 'tool-local-plugin',
              category: 'generic-plugin',
            })
            .add({
              name: 'project-local-plugin',
              category: 'generic-plugin',
            })
            .add({
              name: 'global-plugin',
              category: 'generic-plugin',
            });

          expect(function() {
            pluginRegistry.reset();
          }).not.toThrow();

          instance2 = pluginRegistry.get('foo');
          expect(instance2.getFullRegistry()).toEqual({});
          expect(instance2.getAllOfCategory('generic-plugin')).toEqual([]);

          done();
        });

        it('Should get empty array when get all of category called on category that does not yet exist', function(done) {
          var instance2 = pluginRegistry
            .get('foo');
          expect(instance2.getAllOfCategory('generic-plugin')).toEqual([]);

          instance2
            .context({
              toolPath: toolLocalBasePath,
              projectPath: projectLocalBasePath,
            })
            .add({
              name: 'tool-local-plugin',
              category: 'generic-plugin',
            })
            .add({
              name: 'project-local-plugin',
              category: 'generic-plugin',
            })
            .add({
              name: 'global-plugin',
              category: 'generic-plugin',
            });
          expect(instance2.getAllOfCategory('non-existent-category')).toEqual([]);

          done();
        });

        it('Should get all of one category', function(done) {
          var instance2 = pluginRegistry
            .get('foo')
            .context({
              toolPath: toolLocalBasePath,
              projectPath: projectLocalBasePath,
            })
            .add({
              name: 'tool-local-plugin',
              category: 'plugin-type-1',
            })
            .add({
              name: 'project-local-plugin',
              category: 'plugin-type-2',
            })
            .add({
              name: 'global-plugin',
              category: 'plugin-type-2',
            });

          instance2 = pluginRegistry.get('foo');
          expect(instance2.getAllOfCategory('plugin-type-1').length).toEqual(1);
          expect(instance2.getAllOfCategory('plugin-type-2').length).toEqual(2);

          ['plugin-type-1', 'plugin-type-2']
            .forEach(function eachPluginCategory(category) {
              instance2.getAllOfCategory(category)
                .forEach(function eachPluginDefinition(definition) {
                  expect(definition.plugin).toBeDefined();
                  expect(definition.plugin.category).toEqual(category);
                });
            });

          done();
        });

        it('Should get all of one category specified with absolute paths', function(done) {
          var instance2 = pluginRegistry
            .get('foo')
            .context({
              toolPath: toolLocalBasePath,
              projectPath: projectLocalBasePath,
            })
            .add({
              name: 'tool-local-plugin',
              category: 'plugin-type-1',
              requirePath: toolLocalPath,
            })
            .add({
              name: 'project-local-plugin',
              category: 'plugin-type-2',
              requirePath: projectLocalPath,
            })
            .add({
              name: 'global-plugin',
              category: 'plugin-type-2',
              requirePath: globalPath,
            });

          instance2 = pluginRegistry.get('foo');
          expect(instance2.getAllOfCategory('plugin-type-1').length).toEqual(1);
          expect(instance2.getAllOfCategory('plugin-type-2').length).toEqual(2);

          ['plugin-type-1', 'plugin-type-2']
            .forEach(function eachPluginCategory(category) {
              instance2.getAllOfCategory(category)
                .forEach(function eachPluginDefinition(definition) {
                  expect(definition.plugin).toBeDefined();
                  expect(definition.plugin.category).toEqual(category);
                });
            });

          done();
        });

        it('Should get entire registry', function(done) {
          var instance2 = pluginRegistry
            .get('foo')
            .context({
              toolPath: toolLocalBasePath,
              projectPath: projectLocalBasePath,
            })
            .add({
              name: 'tool-local-plugin',
              category: 'plugin-type-1',
            })
            .add({
              name: 'project-local-plugin',
              category: 'plugin-type-2',
            })
            .add({
              name: 'global-plugin',
              category: 'plugin-type-2',
            });

          instance2 = pluginRegistry.get('foo');
          var registry = instance2.getFullRegistry();
          expect(registry['plugin-type-1'].length).toEqual(1);
          expect(registry['plugin-type-2'].length).toEqual(2);

          ['plugin-type-1', 'plugin-type-2']
            .forEach(function eachPluginCategory(category) {
              registry[category]
                .forEach(function eachPluginDefinition(definition) {
                  expect(definition.plugin).toBeDefined();
                  expect(definition.plugin.category).toEqual(category);
                });
            });

          done();
        });
      });
    });

  });
});
