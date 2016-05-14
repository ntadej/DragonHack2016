/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    sassOptions: {
      includePaths: [
        'bower_components/Skeleton-Sass/scss'
      ]
    }
  });

  app.import('vendor/RTCMultiConnection.js');
  app.import('vendor/connection.js');

  return app.toTree();
};
