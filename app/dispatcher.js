var guid = require('guid');
var listeners = {};

module.exports = {
  register:function (callback) {
    var id = guid.raw();
    listeners[id] = callback;
    return id;
  },

  dispatch:function (payload) {
    console.info('Dispatching...', payload);
    for (var id in listeners) {
      if (id) {
        var listener = listeners[id];
        listener(payload);
      }
    }
  },
};
