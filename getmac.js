const exec = require('child_process').exec;
const os = require('os');

const wifiInterfaces = ['Wi-Fi', 'Wireless'];
const ethInterfaces = ['Ethernet', 'Local Area Connection'];
const blacklistInterfaces = ['VirtualBox Host-Only Network', 'Bluetooth Network Connection'];

module.exports = function(){
  return new Promise((resolve, reject) => {
    if(process.platform === 'win32'){
      const macs = {};

      exec('getmac /fo csv /v', {cwd: 'C:\\Windows'}, (err, stdout, stderr) => {
        if(err){
          reject(err);
        }

        if(stderr){
          reject(stderr);
        }

        //Parse CSV into array
        const allMacs = stdout.split('\n');

        //Remove CSV header
        allMacs.shift();

        //Parse all macs
        for(let i = 0; i < allMacs.length; i++){
          const currentMac = allMacs[i].split(',');

          //Continue if array is empty
          if(!currentMac[0].trim() || !currentMac[2].trim()){
            continue;
          }

          //Clean up interface name and mac
          const interfaceName = currentMac[0].replace(/['"]+/g, '');
          const nicName = currentMac[1].replace(/['"]+/g, '');
          const mac = currentMac[2].replace(/['"]+/g, '').replace(/\-+/g, ':');

          //Check if interface is in black list
          if(blacklistInterfaces.indexOf(interfaceName) > -1){
            continue;
          }

          //Check if we're looking for this interface
          wifiInterfaces.forEach(nic => {
            if(nicName.indexOf(nic) > -1){
              macs['Wi-Fi'] = mac;
            }
          });

          ethInterfaces.forEach(nic => {
            if(nicName.indexOf(nic) > -1){
              macs['Ethernet'] = mac;
            }
          });
        }

        resolve(macs);
      });
    }else if(process.platform === 'darwin'){
      try{
        resolve({'Wi-Fi': os.networkInterfaces().en0[0].mac});
      }catch(err){
        resolve();
      }
    }else{
      resolve();
    }
  });
}
