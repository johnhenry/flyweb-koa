// set babel in entry file
require('babel-register')({
  plugins: ['transform-async-to-generator'],
  presets:['stage-3', 'es2015', 'es2016', 'es2017']
});
require("babel-polyfill");
require('./index.js');
