var vows = require('vows');
var assert = require('assert');
var events = require('events');

vows.describe('CouchDB tests').addBatch({
  'insert': {
    topic: function() {
      var promise = new (events.EventEmitter);
      var nano = require('nano')("http://localhost:5984");

      var notjs = nano.use('notjs');
      notjs.insert({ test: "success" }, "test", function(err, body, header) {
        if(!err) {
          console.log(body);
          promise.emit('success', body.id);
        } else {
          console.log(err);
        }
      });

      return promise;
    },
    'hello received': function(message) {
      assert.equal(message, 'test');
    }
  }
}).export(module);