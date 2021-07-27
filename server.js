/*
 * @Server.js
 */
"use strict";




// require("babel-polyfill");


let express = require('express'),
	bodyParser = require('body-parser'),
	apiRoutes = require('./ApiRoutes');



//  create server app
let app = express();
let port = process.env.PORT || 3000;

// parsing
// app.use(bodyParser.text());
app.use(bodyParser.json());

// api
app.use(apiRoutes);


//  run
app.listen(port, () => console.log( "Express server listening on port " + port) );
