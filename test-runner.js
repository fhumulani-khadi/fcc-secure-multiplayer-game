var analyser = require('./assertion-analyser');
var EventEmitter = require('events').EventEmitter;
var Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path');

var mocha = new Mocha();
var testDir = './tests';

fs.readdirSync(testDir).filter(function(file){
    return file.substr(-3) === '.js';
}).forEach(function(file){
    mocha.addFile(
        path.join(testDir, file)
    );
});

var emitter = new EventEmitter();  
emitter.run = function() {
  var tests = [];
  var context = "";
  var separator = ' -> ';
  try {
  var runner = mocha.ui('tdd').run()
    .on('test end', function(test) {
        var body = test.body.replace(/\/\/.*\n|\/\*.*\*\//g, '');
        body = body.replace(/\s+/g,' ');
        var obj = {
          title: test.title,
          context: context.slice(0, -separator.length),
          state: test.state,
          assertions: analyser(body)
        };
        tests.push(obj);
    })
    .on('end', function() {
        emitter.report = tests;
        emitter.emit('done', tests);
    })
    .on('suite', function(s) {
      context += (s.title + separator);
    })
    .on('suite end', function(s) {
      context = context.slice(0, -(s.title.length + separator.length));
    });
  } catch(e) {
    throw(e);
  }
};

module.exports = emitter;
