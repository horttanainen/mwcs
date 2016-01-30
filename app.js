/*global */
'use strict';
var
 http     = require( 'http'),
 express  = require( 'express' ),
 routes   = require( './routes' ),

 app      = express(),

 server   = http.createServer( app );

//------------------- BEGIN SERVER CONFIGURATION ------------------
app.use( express.static( __dirname + '/public' ) );

routes.configRoutes( app, server );
//-------------------- END SERVER CONFIGURATION -------------------

//--------------------- BEGIN START SERVER --------------------
server.listen(process.env.PORT || 3000)
console.log(
'Express server listening on port %d in %s mode',
 server.address().port, app.settings.env
 );
//---------------------- END START SERVER ---------------------

