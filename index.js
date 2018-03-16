const getMac = require('./getmac');
const getName = require('./getName');
const os = require('os');
const si = require('systeminformation');
const write = require('./writeFile');

//Gather synchronous data
const data = {
  hostname: os.hostname(),
  asset: os.hostname().match(/\d+/)[0],
  username: os.userInfo().username
}

//Gather asynchronous data
const promises = [
  getMac(),
  getName(data.username),
  si.system(),
  si.osInfo()
];

Promise.all(promises).then(res => {
  //getMac()
  data.network = res[0];

  //getName()
  data.firstName = res[1].first;
  data.lastName = res[1].last;

  //si.system()
  data.model = res[2].model;
  data.manufacturer = res[2].manufacturer;
  data.serialNumber = res[2].serial;

  //si.osInfo()
  data.os = res[3].distro;

  write(data);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
