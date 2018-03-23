const fs = require('fs');
const moment = require('moment');
const os = require('os');

const logPath = os.tmpdir()+'/Tech Tools/';
const logName = moment().format('YYYY-MM-DD_HH-mm-ss')+'.log';

//Check if log directory exists
if(!fs.existsSync(logPath)){
  fs.mkdirSync(logPath);
}

//Open file stream
const file = fs.createWriteStream(logPath+logName);

//Close stream when app exits
process.on('exit', () => {
  file.end();
});

const write = txt => {
  file.write(moment().format('HH:mm:ss.SSS'));
  file.write('\n');
  file.write(txt);
  file.write('\n\n');
}

module.exports = {
  write: write
}
