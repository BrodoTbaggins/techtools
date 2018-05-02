const chalk = require('chalk');
const dialog = require('dialog');
const fs = require('fs');
const moment = require('moment');
const os = require('os');

const logPath = os.tmpdir()+'/Tech Tools/';
const networkLogPath = require('./config').networkLogPath + '/' + os.hostname().match(/\d+/)[0] + '/';
const logName = moment().format('YYYY-MM-DD_HH-mm-ss')+'.log';

//Check if log directory exists
if(!fs.existsSync(logPath)){
  fs.mkdirSync(logPath);
}

//Open file stream
const file = fs.createWriteStream(logPath+logName);

//Attempt connection to network log
var networkFile = null;
try{
  //Create log location if it doesn't exist
  if(!fs.existsSync(networkLogPath)){
    fs.mkdirSync(networkLogPath);
  }

  networkFile = fs.createWriteStream(networkLogPath+logName);
}catch(err){
  file.on('open', () => {
    file.write(moment().format('HH:mm:ss.SSS'));
    file.write('\n');
    file.write('Failed to open connection to network log location');
    file.write('\n');
    file.write(networkLogPath+logName);
    file.write('\n');
    file.write(err.stack);
    file.write('\n');
  });
}

//Close stream when app exits
process.on('exit', () => {
  file.end();

  if(networkFile){
    networkFile.end();
  }
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

  if(networkFile){
    networkFile.write(moment().format('HH:mm:ss.SSS'));
    networkFile.write('\n');
    networkFile.write(txt);
    networkFile.write('\n\n');
  }
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

  if(networkFile){
    if(err.stack){
      networkFile.write(err.stack);
    }else if(typeof err === 'object'){
      networkFile.write(JSON.stringify(err, null, 2));
    }else if(typeof err === 'string'){
      networkFile.write(err);
    }
  }

  file.write('\n\n', () => {
    console.log(chalk.red('A fatal error occured'));
    console.log();
    console.log(chalk.red('Log has been saved in'));
    console.log(chalk.red(logPath+logName));
    dialog.err('A fatal error occured\n\nLog has been saved in\n'+logPath+logName, 'Tech Tools', () => {
      process.exit(1);
    });
  });
}

module.exports = {
  write: write,
  error: error
}
