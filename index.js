const getMac = require('./getmac');
const getName = require('./getName');
const os = require('os');
const redBeam = require('./redbeam');
const si = require('systeminformation');

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
  si.osInfo(),
  redBeam.getAsset(data.asset)
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

  //redBeam.getAsset()
  const redBeamData = res[4];
  redBeam.getUser(data.firstName, data.lastName).then(id => {

    //Store device information in redBeam template
    redBeamData.personId = id;

    //Deployed status ID
    redBeamData.statusId = '81223981-ecb3-4e5d-8ec5-a74f39d88781';

    if(data.serialNumber){
      redBeamData.serialNumber = data.serialNumber;
    }

    if(data.model){
      redBeamData.model = data.model;
    }

    if(data.network['Wi-Fi']){
      redBeamData.userField1 = data.network['Wi-Fi'];
    }

    if(data.network['Ethernet']){
      redBeamData.userField2 = data.network['Ethernet'];
    }

    if(data.hostname){
      redBeamData.userField3 = data.hostname;
    }

    if(data.os){
      redBeamData.userField4 = data.os;
    }

    //Send new data to redbeam
    redBeam.update(redBeamData).then(res => {
      console.log('Done!');
      process.exit();
    }).catch(err => {
      console.error(err);
      process.exit(1)
    })
  })
}).catch(err => {
  console.error(err);
  process.exit(1);
});
