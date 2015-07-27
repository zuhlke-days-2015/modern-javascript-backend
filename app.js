(function () {
    'use strict';

    var parser = require('./project/parser.js'),
        api = require('./project/api.js'),
        loki = require('lokijs'),
        db = new loki('MovieDB'),
        movies = db.addCollection('movies', {
            indices: ['runtimeParsed']
        });

    parser.parse(__dirname + '/project/data/omdbMovies.txt', function (data) {
        movies.insert(data);
    }, function (data) {
        return data.imdbVotes > 6.5 && data.poster !== '';
    });
    api.listen(8080, function (runtimeFrom, runtimeTo) {
        return movies.chain().where(function (obj) {
            return obj.runtimeParsed > runtimeFrom && obj.runtimeParsed < runtimeTo;
        }).data();
    });
}());
