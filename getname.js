const config = require('./config');
const exec = require('child_process').exec;

module.exports = function(username){
  return new Promise((resolve, reject) => {
    if(process.platform === 'win32'){
      exec('net user %username% /domain | find /i "full name"', {cwd: 'C:\\Windows'}, (err, stdout, stderr) => {
        if(err){
          reject(err);
        }

        if(stderr){
          reject(stderr);
        }

        //Remove other characters from out
        const nameString = stdout.split(/\s{2,}/g)[1];

        resolve(parseName(name));
      });
    }else{
      resolve(parseName());
    }
  });
}

function parseName(name){
  const output = {
    first: null,
    last: null
  }

  if(!name){
    return output;
  }

  //Check if output is in "First Last" or "Last, First" format
  const lF = name.match(/(\S+), (\S+)/);
  const fL = name.match(/(\S+) (\S+)/);

  if(lF){
    output.last = lF[1];
    output.first = lF[2];
  }else if(fL){
    output.first = fL[1];
    output.last = fL[2];
  }

  return output;
}
