const fs = require('fs');
const log = require('./logger');

module.exports = function(){
  if(process.platform !== 'win32'){
    return;
  }
  
  if(process.auditFile){
    log.write('Writing audit file');

    const path = 'C:/Program Files/Tech Tools/';
  
    if(!fs.existsSync(path)){
      fs.mkdirSync(path);
    }
  
    fs.writeFileSync(path + process.auditFile, new Date());
    log.write('Finished writing audit file');
  }
}