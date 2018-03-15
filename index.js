const ActiveDirectory = require('activedirectory');
const exec = require('child_process').exec;
const Excel = require('exceljs');
const fs = require('fs');
const os = require('os');
const si = require('systeminformation');
const config = require('./config');

const wifiInterfaces = ['Wi-Fi', 'Wireless Network Connection'];
const ethInterfaces = ['Ethernet', 'Local Area Connection'];

const xlsxLocation = config.xlsxLocation;

//Gather all usable information
const data = {
  hostname: os.hostname(),
  asset: os.hostname().match(/\d+/)[0],
  username: os.userInfo().username,
  network: {}
}

//Get mac address for windows
exec('getmac /fo csv /v', {cwd: 'C:\\Windows'}, (err, stdout, stderr) => {
  if(err){
    throw err;
  }

  if(stderr){
    console.log('ERROR', stderr);
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
    const mac = currentMac[2].replace(/['"]+/g, '');

    //Check if we're looking for this interface
    if(wifiInterfaces.indexOf(nicName) >= 0){
      data.network['Wi-Fi'] = mac;
      continue;
    }else if(ethInterfaces.indexOf(nicName) >= 0){
      data.network['Ethernet'] = mac;
      continue;
    }
  }
});

//Get system information
si.system().then(res => {
  data.manufacturer = res.manufacturer;
  data.model = res.model;
  data.serialNumber = res.serial;

  //Get OS
  si.osInfo().then(res => {
    data.os = res.distro;

    //Query AD to get username
    const ad = new ActiveDirectory(config.ad);
    ad.findUser(data.username, function(err, user) {
      if (err) {
        console.log('ERROR');
        console.log();
        console.log(JSON.stringify(err));
        return;
      }

      if(user){
        data.firstName = user.givenName;
        data.lastName = user.sn;
      }

      writeFile();
    });
  });
});

let failedAttempts = 0;
function writeFile(){
  //Check if file needs to be created
  if(!fs.existsSync(xlsxLocation)){
    return createFile();
  }

  //Open workbook
  const workbook = new Excel.Workbook();

  //Compile data to push
  const dataToPush = [];
  dataToPush[0] = data.asset;
  dataToPush[5] = data.serialNumber;
  dataToPush[6] = data.model;
  dataToPush[7] = data.manufacturer;
  dataToPush[9] = data.firstName;
  dataToPush[10] = data.lastName;
  dataToPush[11] = 'Deployed';
  dataToPush[26] = data.network['Wi-Fi'];
  dataToPush[27] = data.network['Ethernet'];
  dataToPush[28] = data.hostname;
  dataToPush[29] = data.os;

  //Push values to workbook
  workbook.xlsx.readFile(xlsxLocation)
  .then(() => {
    workbook.getWorksheet('Data').addRow(dataToPush);
    return workbook.xlsx.writeFile(xlsxLocation);
  })
  .then(() => {
    console.log('done');
  })
  .catch(err => {
    //If file write failed, wait 3 seconds then try again
    failedAttempts++;
    if(failedAttempts < 3){
      setTimeout(writeFile, 3000);
    }else{
      //Excel file is locked and cannot be edited, create JSON instead
      console.log(err);
      writeJSONFile();
    }
  });
}

function createFile(){
  const workbook = new Excel.Workbook();
  const sheet = workbook.addWorksheet('Data');

  //Required columns required for proper import
  const rows = [
    'Asset_ID',
    'Description',
    'Region',
    'Building_x002F_Floor',
    'Room',
    'Serial_No.',
    'Model_Name',
    'Manufacturer',
    'Department',
    'First_Name',
    'Last_Name',
    'Status',
    'Asset_Type',
    'Notes',
    'Vendor',
    'Purchase_Order',
    'Acquisition_Date',
    'Cost',
    'Account',
    'Warranty_No.',
    'Warranty_Start_Date',
    'Warranty_End_Date',
    'Lease_Start_Date',
    'Lease_End_Date',
    'Lease_No.',
    'Inactive',
    'Wireless_MAC',
    'Wired_Mac_Address',
    'Host_Name',
    'Operating_System',
    'Seat',
    'Maintenance_Notes'
  ];
  sheet.addRow(rows);
  workbook.xlsx.writeFile(xlsxLocation).then(() => {
    writeFile();
  });
}

function writeJSONFile(){
  fs.writeFile(config.jsonLocation+data.asset+'.json', JSON.stringify(data), err => {
    if(err){
      console.log(err);
      return;
    }

    console.log('JSON created');
  });
}
