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
  },
  'user connection': {
    topic: function() {
      var promise = new (events.EventEmitter);
      var ws = new WebSocket("ws://localhost:"+port);
    
      ws.on('open', function() {
        ws.send('{"type":"getUserByFb","payload":{"fbid":"65","name":"Jean DUPONT"}}');

        ws.on('message', function(message) {
          console.log(message);
          promise.emit('success', JSON.parse(message).type);
          ws.close();
        });
      });
      return promise;
    },
    'should receive userId': function(message) {
      assert.equal(message, "userId");
    }
  },
  'create sale': {
    topic: function() {
      var promise = new (events.EventEmitter);
      var ws = new WebSocket("ws://localhost:"+port);
    
      ws.on('open', function() {
        ws.send('{"type":"createSale","payload":{"name":"Nikon d90","description":"Reflex numerique", "price":"299.90", "seller":"e96f475532e4cb7f730fc91fb600059f"}}');

        ws.on('message', function(message) {
          console.log(message);
          promise.emit('success', JSON.parse(message).type);
          ws.close();
        });
      });
      return promise;
    },
    'should receive saleId': function(message) {
      assert.equal(message, "saleId");
    }
  }
}).export(module);