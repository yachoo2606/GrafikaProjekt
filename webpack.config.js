const path = require('path');
const glob = require('glob');

module.exports = {
  entry: {'app' : glob.sync('./src/**/*.js*')},
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
};