const Excel = require('exceljs');
const fs = require('fs');
const os = require('os');
const si = require('systeminformation');

const xlsxLocation = '\\\\ut-s-mgmt01\\iso\\Tech Tools\\Inventory Info\\Template.xlsx';

//Gather all usable information
const data = {
  hostname: os.hostname(),
  asset: os.hostname().match(/\d+/)[0],
  username: os.userInfo().username,
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

//Get system information
si.system().then(res => {
  data.manufacturer = res.manufacturer;
  data.model = res.model;
  data.serialNumber = res.serial;

  writeFile();
});

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
  dataToPush[9] = data.username;
  dataToPush[11] = 'Deployed';
  dataToPush[26] = data.network['Wi-Fi'];
  dataToPush[27] = data.network['Ethernet'];
  dataToPush[28] = data.hostname;

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
    console.error(err);
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
