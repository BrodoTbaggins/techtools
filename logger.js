const dialog = require('dialog');
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

//Handle all uncaught rejections
process.on('unhandledRejection', (err, p) => {
  error(err);
});

const write = txt => {
  file.write(moment().format('HH:mm:ss.SSS'));
  file.write('\n');
  file.write(txt);
  file.write('\n\n');
}

const error = err => {
  file.write(moment().format('HH:mm:ss.SSS'));
  file.write('\n');

  if(err.stack){
    file.write(err.stack);
  }else if(typeof err === 'object'){
    file.write(JSON.stringify(err, null, 2));
  }else if(typeof err === 'string'){
    file.write(err);
  }

  file.write('\n\n', () => {
    dialog.err('A fatal error occured\n\nLog has been saved in\n'+logPath+logName, 'Tech Tools', () => {
      process.exit(1);
    });
  });
}

module.exports = {
  write: write,
  error: error
}
