const exec = require('child_process').exec;
const log = require('./logger');
const Shell = require('node-powershell');

module.exports = function(username){
  return new Promise((resolve, reject) => {
    if(username.match(/doterrala/gi)){
      //Return empty name if local admin
      resolve(parseName());
    }

    switch(process.platform){
      case 'win32': {
        const ps = new Shell({
          executionPolicy: 'Bypass',
          noProfile: true
        });

        ps.addCommand('(Get-WmiObject -Class win32_process -ComputerName . | Where-Object name -Match explorer).getowner().user')
        ps.invoke()
          .then(output => {
            // Remove whitespace from output
            if(output){
              output = output.trim();

              // Return only the first name
              output = output.split('\n')[0];
            }
            
            log.write('Successfully queried WMI. Found ' + output);

            process.username = output;

            // Search for first, last name
            const command = 'net user "'+output+'" /domain | find /i "full name"';
            log.write('Executing: '+command);
            exec(command, {cwd: 'C:\\Windows'}, (err, stdout, stderr) => {
              if(err){
                log.write('Failed to find name');
    
                //Return empty name
                resolve(parseName());
                ps.dispose();
              }
    
              if(stderr){
                reject(stderr);
                ps.dispose();
              }
    
              //Remove other characters from out
              const name = stdout.split(/\s{2,}/g)[1];
    
              resolve(parseName(name));
              ps.dispose();
            });
          })
          .catch(err => {
            log.write('Failed to query WMI for name');
            resolve(parseName());
          });
        break;
      }

      case 'darwin': {
        exec('id -P $(stat -f%Su /dev/console) | cut -d : -f 8', (err, stdout, stderr) => {
          if(err){
            resolve(parseName());
          }

          if(stderr){
            resolve(parseName());
          }

          resolve(parseName(stdout));
        });
        break;
      }

      default: {
        resolve(parseName());
        break;
      }
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
