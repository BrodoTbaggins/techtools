const config = require('./config');
const exec = require('child_process').exec;

module.exports = function(username){
  return new Promise((resolve, reject) => {
    if(username.match(/doterrala/gi)){
      //Return empty name if local admin
      resolve(parseName());
    }
    if(process.platform === 'win32'){
      exec('net user '+username+' /domain | find /i "full name"', {cwd: 'C:\\Windows'}, (err, stdout, stderr) => {
        if(err){
          //Check if error is due to user not found
          if(err.message.match(/The user name could not be found/gi)){
            //Return empty name
            resolve(parseName());
          }else{
            reject(err);
          }
        }

        if(stderr){
          reject(stderr);
        }

        //Remove other characters from out
        const name = stdout.split(/\s{2,}/g)[1];

        resolve(parseName(name));
      });
    }else if(process.platform === 'darwin'){
      exec('dscl . -read "/Users/$(who am i | awk \'{print $1}\')" RealName | sed -n \'s/^ \/\/g;2p\'', (err, stdout, stderr) => {
        if(err){
          reject(err);
        }

        if(stderr){
          reject(stderr);
        }

        resolve(parseName(stdout));
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

  //Check if name is system admin
  if(name.match(/admin/gi)){
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
