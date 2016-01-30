/*global */
'use strict';
var 
  configRoutes,
  fsHandle      = require( 'fs' );

configRoutes = function ( app, server ) {

  app.use( '/', function ( request, response ) {
   response.redirect( '/sol.html' );
  });
};

module.exports = { configRoutes : configRoutes };
