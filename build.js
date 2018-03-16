const {exec} = require('pkg');

exec(['index.js', '--targets', 'node8-win-x86,node8-macos-x64', '--output', 'build/tech_tools']);
