const Excel = require('exceljs');
const fs = require('fs');
const xlsxLocation = require('./config').xlsxLocation;

let failedAttempts = 0;

module.exports = function(data){
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
    console.log('Update successful');
    process.exit();
  })
  .catch(err => {
    //If file write failed, wait 3 seconds then try again
    failedAttempts++;
    if(failedAttempts < 3){
      setTimeout(writeFile, 3000);
    }else{
      //Excel file is locked and cannot be edited, create JSON instead
      fs.writeFile(config.jsonLocation+data.asset+'.json', JSON.stringify(data), err => {
        if(err){
          console.log(err);
          return;
        }

        console.log('JSON created');
        process.exit();
      });
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
