var vows = require('vows');
var assert = require('assert');
var events = require('events');

vows.describe('CouchDB tests').addBatch({
  'getUser': {
    topic: function() {
      var promise = new (events.EventEmitter);
      var nano = require('nano')("http://localhost:5984");

      var notjs = nano.use('notjs');
      notjs.insert({"type": "user", "fbid": "1314556472", "name": "Paul Sebastien", "sales": [], "news": []}, "e96f475532e4cb7f730fc91fb600059f", function(err, body) {
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
  }
}).export(module);