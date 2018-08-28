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
const writeCSV = require('./writeCSV');

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
const promises = [
  getMac(),
  getName(data.username),
  si.system(),
  si.osInfo(),
  redBeam.getAsset(data.asset)
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

  //redBeam.getAsset()
  const redBeamData = res[4];

  //Query redbeam for manufacturer ID and name ID if a name was found in the system
  log.write('Getting manufacturer ID');
  const promises = [redBeam.getManufacturer(data.manufacturer)];
  if(data.firstName && data.lastName){
    log.write('Getting user ID');
    promises.push(redBeam.getUser(data.firstName, data.lastName));
  }

  Promise.all(promises).then(res => {
    log.write('RedBeam promises finished');

    //Add manufacturer ID
    if(res[0]){
      redBeamData.manufacturerId = res[0];
    }

    //Add name to redBeamData
    if(res[1]){
      redBeamData.personId = res[1];
      //Assigned status ID
      redBeamData.statusId = '81223981-ecb3-4e5d-8ec5-a74f39d88781';
    }else{
      //Unassigned IDs
      redBeamData.personId = '2269e681-0208-4427-ba0d-1fc039bbbd37';
      redBeamData.statusId = '5eb257a2-f2bf-402e-aada-2755d343ec7f';
    }

    //Prepare data to send to RedBeam
    if(data.serialNumber){
      redBeamData.serialNumber = data.serialNumber;
    }
    if(data.model){
      redBeamData.model = data.model;
    }
    if(data.network){
      if(data.network['Wi-Fi']){
        redBeamData.userField1 = data.network['Wi-Fi'];
      }
      if(data.network['Ethernet']){
        redBeamData.userField2 = data.network['Ethernet'];
      }
    }
    if(data.hostname){
      redBeamData.userField3 = data.hostname;
    }
    if(data.os){
      redBeamData.userField4 = data.os;
    }

    log.write('Finished writing RedBeam data');
    log.write(JSON.stringify(redBeamData, null, 2));

    // Check if we want to update a CSV instead
    const fileIndex = process.argv.indexOf('--csv');
    const csvLocation = fileIndex > -1 ? process.argv[fileIndex + 1] : false;

    if(csvLocation){
      writeCSV(csvLocation, data)
        .then(() => {
          auditFile();
          console.log('Done');
          log.write('Exiting');
        })
        .catch(log.error);

      return;
    }

    //Send updated data to redbeam
    log.write('Sending data to RedBeam');
    redBeam.update(redBeamData).then(res => {
      log.write('RedBeam update successful');

      // Write audit file
      auditFile();

      console.log('Done');
      log.write('Exiting');
    });
  }).catch(log.error);
}).catch(log.error);
