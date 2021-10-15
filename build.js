const {exec} = require('pkg');

exec(['index.js', '--targets', 'node14-win-x64,node14-macos-x64', '--output', 'build/tech_tools']);
