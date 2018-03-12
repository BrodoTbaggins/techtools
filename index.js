const os = require('os');

//Gather all usable information
const data = {
  hostname: os.hostname(),
  asset: os.hostname().match(/\d+/)[0],
  username: os.homedir().split('\\')[os.homedir().split('\\').length - 1],
  network: {}
}

//Gather MAC's
const nic = os.networkInterfaces();
for(let i in nic){
  //Don't include VirtualBox or Loopbacks
  if(i.match(/virtualbox/gi) || i.match(/loopback/gi)){
    continue;
  }

  data.network[i] = nic[i][0].mac;
}

console.log(data);
