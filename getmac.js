const exec = require('child_process').exec;

const wifiInterfaces = ['Wi-Fi', 'Wireless Network Connection'];
const ethInterfaces = ['Ethernet', 'Local Area Connection'];

module.exports = function(){
  return new Promise((resolve, reject) => {
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
        const nicName = currentMac[0].replace(/['"]+/g, '');
        const mac = currentMac[2].replace(/['"]+/g, '').replace(/\-+/g, ':');

        //Check if we're looking for this interface
        if(wifiInterfaces.indexOf(nicName) >= 0){
          macs['Wi-Fi'] = mac;
          continue;
        }else if(ethInterfaces.indexOf(nicName) >= 0){
          macs['Ethernet'] = mac;
          continue;
        }
      }

      resolve(macs);
    });
  });
}
