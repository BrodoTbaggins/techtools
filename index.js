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

  //Query redbeam for manufacturer ID and name ID if a name was found in the system
  const promises = [redBeam.getManufacturer(data.manufacturer)];
  if(data.firstName && data.lastName){
    promises.push(redBeam.getUser(data.firstName, data.lastName));
  }

  Promise.all(promises).then(res => {

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

    //Send updated data to redbeam
    redBeam.update(redBeamData).then(res => console.log('Done'));
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}).catch(err => {
  console.error(err);
  process.exit(1);
});
