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
      var instance1 = pluginRegistry.get('foo');
      var instance2 = pluginRegistry.get('bar');

      done();
    });

    it('Should not be able to create mutliple registries with the same name');
    it('Should not be able to create mutliple default registries');
  });
});
