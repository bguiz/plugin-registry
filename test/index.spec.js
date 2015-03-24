'use strict';

var path = require('path');

var pluginRegistry = require('../index');

var helper = require('./helper');

describe('[basic]', function() {
  describe('[access]', function() {
    afterEach(function() {
      pluginRegistry.reset();
    });

    describe('[registry creation]', function() {
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
        }).toThrowError('Require path should resolve to an absolute path');

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

      //TODO @bguiz - remaining tests
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
        }).toThrowError('Require path should resolve to an absolute path');
        done();
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

    describe('[plugins in different locations]', function() {
      var toolLocalBasePath = path.resolve(__dirname, '..');
      var projectLocalBasePath = path.resolve(__dirname, '../plugin-registry-test-temp-folder/project/another');

      var toolLocalPath = path.resolve(toolLocalBasePath, './node_modules/tool-local-plugin');
      var projectLocalPath = path.resolve(projectLocalBasePath, './node_modules/project-local-plugin');
      var globalPath = path.resolve(toolLocalBasePath, '../global-plugin');

      console.log('toolLocalPath', toolLocalPath);
      console.log('projectLocalPath', projectLocalPath);
      console.log('globalPath', globalPath);

      //TODO replace with `beforeAll` once we get jasmine 2.1
      beforeEach(function() {
        helper.createPlugin({
          requirePath: toolLocalPath,
          name: 'tool-local-plugin',
          category: 'generic-plugin',
        });
        helper.createPlugin({
          requirePath: projectLocalPath,
          name: 'project-local-plugin',
          category: 'generic-plugin',
        });
        helper.createPlugin({
          requirePath: globalPath,
          name: 'global-plugin',
          category: 'generic-plugin',
        });
      });

      //TODO replace with `afterAll` once we get jasmine 2.1
      afterEach(function() {
        helper.cleanUpPlugin({
          requirePath: toolLocalPath,
        });
        helper.cleanUpPlugin({
          requirePath: projectLocalPath,
        });
        helper.cleanUpPlugin({
          requirePath: globalPath,
        });
      });

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
    });

    describe('[query registry]', function() {
      it('Should clear registry when reset called');

      it('Should get all of one category');

      it('Should get empty array when get all of category called on category that does not yet exist');

      it('Should get entire registry');
    });
  });
});
