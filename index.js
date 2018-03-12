const os = require('os');

//Gather all usable information
const data = {
  hostname: os.hostname(),
  asset: os.hostname().match(/\d+/)[0],
  username: os.homedir().split('\\')[os.homedir().split('\\').length - 1]
}

console.log(data);
