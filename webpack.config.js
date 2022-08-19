const path = require('path');
const glob = require('glob');

module.exports = {
  // entry: './src/*.js',
  entry: {'app' : glob.sync('./src/**/*.js*')},
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
};