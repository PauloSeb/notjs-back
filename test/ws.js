var vows = require('vows');
var assert = require('assert');
var events = require('events');
var port = process.env.PORT || 5000;
var WebSocket = require('ws');
 
vows.describe('WebSocket https tests').addBatch({
  'HTTPS': {
    topic: function() {
      var promise = new (events.EventEmitter);
      var ws = new WebSocket("ws://localhost:"+port);
    
      ws.on('open', function() {
        ws.send('{"type":"test","payload":"helloworld"}');

        ws.on('message', function(message) {
          promise.emit('success', message);
          ws.close();
        });
      });
 
      return promise;
    },
    'should receive message': function(message) {
      assert.equal(message, 'helloworld');
    }
  }
}).export(module);