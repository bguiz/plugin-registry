'use strict';

var pluginRegistry = require('../index');

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
        expect(typeof instance.options).toBe('function');
        expect(typeof instance.add).toBe('function');
        expect(typeof instance.getAllOfCategory).toBe('function');
        expect(typeof instance.getFullRegistry).toBe('function');
        done();
      });

      it('Should be able to create mutliple registries', function(done) {
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

      it('Should not be able to create mutliple default registries', function(done) {
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

      it('Should allow options to be set on a registry exactly once', function(done) {
        var instance2;
        instance2 = pluginRegistry.get('foo');
        expect(function() {
          instance2.options({ myOption: 123 });
        }).not.toThrow();
        expect(function() {
          instance2.options({ myOption: 456 });
        }).toThrow('Can only set options once for registry foo');
        done();
      });
    });

    describe('[add one plugin]', function() {
      it('Should validate plugin definitions', function(done) {
        var instance1;
        var instance2;

        expect(function() {
          instance1 = pluginRegistry.get(42);
        }).toThrow('Invalid name for registry');

        instance2 = pluginRegistry.get('foo');

        expect(function() {
          instance2.add({
            name: 'task-name',
          });
        }).toThrow('Plugins should have a category');

        expect(function() {
          instance2.add({
            category: 'task',
          });
        }).toThrow('Plugins should have a name');

        expect(function() {
          instance2.add({
            name: 'task-name',
            category: 'task',
            requirePath: './relative/path',
          });
        }).toThrow('Require path should resolve to an absolute path');

        done();
      });

    //TODO @bguiz - remaining tests
      it('Should register a single plugin');
      it('Should register a single plugin with name string only', function(done) {
        //TODO create a mock plugin folder to test this
        // expect(function() {
        //   instance2.add('a-string-task');
        // }).not.toThrow();
        done();
      });
      it('Should test for files in the various possible locations');
      it('Should load plugin with a explicit require path');
      it('Should not load a plugin with an explicit require path where the path is not absolute');
    });

    describe('[add multiple plugins]', function() {
      it('Should register multiple plugins specified as an array');
      it('Should register multiple plugins specified as arguments');
    });

    describe('[query registry]', function() {
      it('Should clear registry when reset called');
      it('Should get all of one category');
      it('Should get empty array when get all of category called on category thta does not yet exist');
      it('Should get entire registry');
    });
  });
});
