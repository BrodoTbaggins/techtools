// Check if we're running in audit mode
const auditIndex = process.argv.indexOf('--audit');
process.auditFile = auditIndex === -1 ? false : process.argv[auditIndex + 1];

const log = require('./logger');
log.write('Starting app');

log.write('Loading dependencies');
const auditFile = require('./auditFile');
const getMac = require('./getmac');
const getName = require('./getName');
const os = require('os');
const redBeam = require('./redbeam');
const si = require('systeminformation');


// check if we're running in automatic mode
process.auto = process.argv.indexOf('--auto') > -1;

//Gather synchronous data
log.write('Gathering synchronous data');
const data = {
  hostname: os.hostname(),
  asset: os.hostname().match(/\d+/)[0],
  username: process.argv.indexOf('--username') > -1 ? process.argv[process.argv.indexOf('--username') + 1] : os.userInfo().username
}
log.write(JSON.stringify(data, null, 2));

//Gather asynchronous data
log.write('Starting promises');
let promises = [
  getMac(),
  getName(data.username),
  si.system(),
  si.osInfo()

];

Promise.all(promises).then(res => {
  log.write('Promises finished');
  //getMac()
  data.network = res[0];

  //getName()
  data.firstName = res[1].first;
  data.lastName = res[1].last;
  data.username = process.username;

  //si.system()
  data.model = res[2].model;
  data.manufacturer = res[2].manufacturer;
  data.serialNumber = res[2].serial;

  //si.osInfo()
  data.os = res[3].distro;

  log.write('Finished writing data');
  log.write(JSON.stringify(data, null, 2));

  log.write('Starting redbeam promises')
  promises = [
    redBeam.getManufacturerID(data.manufacturer),
    redBeam.getModelID(data.model),
    redBeam.getUserID(data.firstName, data.lastName)
  ]

  Promise.all(promises).then(res => {
    log.write("Redbeam promises finished")

    //getManufacturerID()
    data.manufacturerID = res[0]

    //getModelID()
    data.modelID = res[1]

    //getUserID()
    data.userID = res[2]

    log.write("Finished adding IDs to data")

  //Update Redbeam
  log.write('Sending data to RedBeam')
  redBeam.update(data)

  }).catch(log.error)

}).catch(log.error)