const exec = require('child_process').exec;
const os = require('os');

const wifiInterfaces = ['Wi-Fi', 'Wireless'];
const ethInterfaces = ['Ethernet', 'Local Area Connection'];
const blacklistInterfaces = ['VirtualBox Host-Only Network', 'Bluetooth Network Connection'];

module.exports = function(){
  return new Promise((resolve, reject) => {

    switch(process.platform){
      case 'win32': {
        exec('getmac /fo csv /v', {cwd: 'C:\\Windows'}, (err, stdout, stderr) => {
          const macs = {}
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
        break;
      }

      case 'darwin': {
        const macs = {}
        exec('networksetup -listallhardwareports', (err, stdout, stderr) => {
          if(err || stderr){
            resolve();
          }

          // Seperate each interface
          const res = stdout.split('\n\n');
          for(let i of res){
            const match = i.match(/Hardware Port: (.+)\n?.*?\nEthernet Address: ([a-f0-9:]+)/i);
            if(match){
              macs[match[1]] = match[2];
            }
          }
          resolve(macs);
        });
        break;
      }

      default: {
        resolve();
        break;
      }
    }
  });
}
