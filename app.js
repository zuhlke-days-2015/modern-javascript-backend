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
            loadAppFromPersistedDatabase();
        } else {
            parseMoviesFile();
        }
    });


    api.listen(process.env.PORT || 8080, config.apikey, function (runtimeFrom, runtimeTo) {
        return movies.chain().where(function (obj) {
            return obj.runtimeParsed > runtimeFrom && obj.runtimeParsed < runtimeTo;
        }).data();
    });


    function loadAppFromPersistedDatabase() {
        db.loadDatabase({}, function () {
            movies = db.getCollection('movies');
            console.log('sweet, we\'re going fast track and are up and running!');
        });
    }

    function parseMoviesFile() {
        console.log('we\'re going slow and are parsing the file ' + config.originalMoviesFile + ' into LokiJS');

        movies = db.addCollection('movies', {
            indices: ['runtimeParsed']
        });


        // not very efficient, but due the async tasks we don't know, when parsing/adding to database is finished. 
        // save when no inserts after 10s
        var idleTimer;
        movies.on('insert', function (data) {
            console.log('insert event fired for ' + data.imdbID);
            clearTimeout(idleTimer);
            idleTimer = setTimeout(function () {
                db.saveDatabase();
                console.log('db saved');
            }, 10000);
        });

	parser.parse(__dirname + config.originalMoviesFile, function (data) {
            movies.insert(data);
        }, function (data) {
            return data.imdbVotes > 6.5 && data.poster !== '' && (data.language === 'English' || data.language === 'German');
        });
    }
}());