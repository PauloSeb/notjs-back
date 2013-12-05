var vows = require('vows');
var assert = require('assert');
var events = require('events');

vows.describe('CouchDB tests').addBatch({
  'insert': {
    topic: function() {
      var promise = new (events.EventEmitter);
      var nano = require('nano')("http://localhost:5984");

      var notjs = nano.use('notjs');
      notjs.insert({ test: "success" }, "hello", function(err, body, header) {
        if(!err) promise.emit('success', body.id);
      });

      return promise;
    },
    'hello received': function(message) {
      assert.equal(message, 'hello');
    }
  }
}).export(module);