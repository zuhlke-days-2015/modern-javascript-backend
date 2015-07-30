/*jslint node: true, nomen: true */

(function () {
    'use strict';

    var fs = require('fs'),
        config = require('./config'),
        parser = require('./project/parser.js'),
        api = require('./project/api.js'),
        loki = require('lokijs'),
        db = new loki('MovieDB.json'),
        movies;


    fs.exists(__dirname + '/MovieDB.json', function (exists) {
        if (exists) {
            db.loadDatabase({}, function () {
                movies = db.getCollection('movies');
            });
            console.log('sweet, we\'re going fast track and are up and running!');
        } else {
            movies = db.addCollection('movies', {
                indices: ['runtimeParsed']
            });

            parser.parse(__dirname + '/project/data/omdbMovies.txt', function (data) {
                movies.insert(data);
            }, function (data) {
                return data.imdbVotes > 6.5 && data.poster !== '' && (data.language === 'English' || data.language === 'German');
            }, function () {
                console.log('sweet! all movies loaded');
                db.saveDatabase();
            });
        }
    });


    api.listen(process.env.PORT || 8080, config.apikey, function (runtimeFrom, runtimeTo) {
        return movies.chain().where(function (obj) {
            return obj.runtimeParsed > runtimeFrom && obj.runtimeParsed < runtimeTo;
        }).data();
    });
}());