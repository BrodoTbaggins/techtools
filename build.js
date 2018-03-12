const {exec} = require('pkg');

exec(['index.js', '--target', 'latest-win-x86', '--output', 'build/app.exe']);
