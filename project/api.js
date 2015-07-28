(function () {
    'use strict';

    var express = require('express');

    exports.listen = function (port, query) {
        var app = express();
  
        app.get('/discover/movie', function (req, res) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.type('application/json; charset=utf-8');
            var result = {
                movies: query(req.query.runtimeFrom, req.query.runtimeTo)
            };
            res.send(JSON.stringify(result));
        });

        app.listen(port);
    };
}());
