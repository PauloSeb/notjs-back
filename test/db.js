var vows = require('vows');
var assert = require('assert');
var events = require('events');

vows.describe('CouchDB tests').addBatch({
  'getUser': {
    topic: function() {
      var promise = new (events.EventEmitter);
      var nano = require('nano')("http://localhost:5984");

      var notjs = nano.use('notjs');
      notjs.insert({"type": "user", "fbid": "1314556472", "name": "Paul Sebastien"}, "e96f475532e4cb7f730fc91fb600059f", function(err, body) {
        if(!err) {
          console.log("user added");
          notjs.insert({"language": "javascript", "views": { "getUserByFBID": { "map": "function(doc) { if (doc.type == 'user')  emit(doc.fbid, doc) }"}}}, "_design/users", function(err, body) {
            if(!err) {
              console.log("view added");
              notjs.view('users', 'getUserByFBID', { key : "1314556472" }, function(err, body) {
                if (!err) {
                  body.rows.forEach(function(doc) {
                    console.log((new Date()).toUTCString() + " :: user " + doc.value._id + " found!");
                    promise.emit('success', doc.value.name);
                  });
                } else { console.log(err);}
              });
            }
          });
        }
      });

      return promise;
    },
    'User found': function(message) {
      assert.equal(message, 'Paul Sebastien');
    }
  },
  'getSale': {
    topic: function() {
      var promise = new (events.EventEmitter);
      var nano = require('nano')("http://localhost:5984");

      var notjs = nano.use('notjs');
      notjs.insert({"type": "sale","date": "Fri, 06 Dec 2013 00:05:40 GMT","price": "299.90","product": "Nikon d90","description": "Reflex numerique","seller": "e96f475532e4cb7f730fc91fb600059f"}, function(err, body) {
        if(!err) {
          console.log("sale added");
          notjs.insert({"language": "javascript","views": {"getSalesOfUser": {"map": "function(doc) { if (doc.type == 'sale')  emit(doc.seller, doc) }"}}}, "_design/sales", function(err, body) {
            if(!err) {
              console.log("view added");
              notjs.view('sales', 'getSalesOfUser', {key : "e96f475532e4cb7f730fc91fb600059f" }, function(err, body) {
                if (!err) {
                  body.rows.forEach(function(doc) {
                    console.log((new Date()).toUTCString() + " :: sale " + doc.value._id + " found!");
                    promise.emit('success', doc.value.product);
                  });
                } else { console.log(err);}
              });
            }
          });
        } else { console.log(err);}
      });

      return promise;
    },
    'Sale found': function(message) {
      assert.equal(message, "Nikon d90");
    }
  },
}).export(module);