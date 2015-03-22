'use strict';

var pluginRegistry = require('../index');

describe('[basic]', function() {
  describe('[access]', function() {
    afterEach(function() {
      pluginRegistry.reset();
    });

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

    it('Should validate plugin definitions', function(done) {
      var instance1;
      var instance2;
      expect(function() {
        instance1 = pluginRegistry.get(42);
      }).toThrow('Invalid name for registry');
      instance2 = pluginRegistry.get('foo');
      //TODO create a mock plugin folder to test this
      // expect(function() {
      //   instance2.add('a-string-task');
      // }).not.toThrow();
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
    it('Should test for files in the various possible locations');
    it('Should load plugin with a explicit require path');
    it('Should not load a plugin with an explicit require path where the path is not absolute');
    it('Should allow options to be set on a registry exactly once');

    describe('[add plugins to single registry]', function() {
      it('Should register a single plugin');
      it('Should register multiple plugins specified as an array');
      it('Should register multiple plugins specified as arguments');
    });

    it('Should clear registry when reset called');
    it('Should get all of one category');
    it('Should get empty array when get all of category called on category thta does not yet exist');
    it('Should get entire registry');

    // it('Should ');
  });
});
