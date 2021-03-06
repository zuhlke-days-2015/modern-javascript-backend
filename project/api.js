(function () {
    'use strict';

    var express = require('express');

    exports.listen = function (port, apikey, query) {
        var app = express();

        app.use('/discover/movie', function (req, res, next) {
            if (!req.query.apikey || req.query.apikey !== apikey) {
                res.send({
                    movies: [],
                    error: 'apikey wrong or missing'
                });
            } else {
                next();
            }
        });

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