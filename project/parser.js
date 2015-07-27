(function () {
    'use strict';

    var loki = require('lokijs'),
        csv = require('csv'),
        fs = require('fs'),
        readline = require('readline'),
        Stream = require('stream'),
        Timestring = require('timestring');

    exports.parse = function (path, processParsedLine, filter) {
        var parser = csv.parse({
                delimiter: '\t',
                encoding: 'UTF-8'
            }),
            timestring = new Timestring(),
            instream = fs.createReadStream(path),
            outstream = new Stream(),
            rl = readline.createInterface(instream, outstream);

        rl.on('line', function (line) {
            csv.parse(line, {
                delimiter: '\t'
            }, function (err, output) {
                try {
                    if (output && output[0][5] !== '') {
                        var result = {
                            id: output[0][0],
                            imdbID: output[0][1],
                            title: output[0][2],
                            year: output[0][3],
                            imdbVotes: output[0][12],
                            runtimeOriginal: output[0][5],
                            runtimeParsed: timestring.parse(output[0][5]),
                            genre: output[0][6],
                            released: output[0][7],
                            poster: output[0][14]
                        };
                        if (filter !== undefined && filter(result)) {
                            processParsedLine(result);
                        }
                    }
                } catch (e) {
                    console.log('error while parsing', output, e);
                }
            });
        });

        rl.on('close', function () {
            console.log('sweet! all movies loaded');
        });
    };
}());
