#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var util = require('util');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var rest = require('restler');
var URL_DEFAULT = "http://hidden-mesa-2054.herokuapp.com/";
var ddd = 'happy';

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile, url) {
      var checks = loadChecks(checksfile).sort();
      var out = {};
      for(var ii in checks) {
          var present = $(checks[ii]).length > 0;
          out[checks[ii]] = present;
      }
      return out;
};

var loadFile = function(file, checks, url) {
    if (url) {
      rest.get(url).on('complete', function(result) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(result.message));
	    console.log('url: ' + url);
        } else {
          $ = cheerio.load(file);
          finishHim(result, checks, $);
        }
      });
    } else {
      $ = cheerio.load(fs.readFileSync(file));
      finishHim(file, checks, $);
    }
}


var finishHim = function(file, checks, $) {
    var checkJson = checkHtmlFile(file, checks, $);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

// rest.get(url).on('complete', );

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL index.html')
        .parse(process.argv);
    loadFile(program.file, program.checks, program.url);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
