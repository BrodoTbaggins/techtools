const Excel = require('exceljs');
const os = require('os');
const si = require('systeminformation');

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
  //Open workbook
  const workbook = new Excel.Workbook();
  const file = '\\\\ut-s-mgmt01\\iso\\Tech Tools\\Inventory Info\\Template.xlsx';

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
  workbook.xlsx.readFile(file)
  .then(() => {
    workbook.getWorksheet('Data').addRow(dataToPush);
    return workbook.xlsx.writeFile(file);
  })
  .then(() => {
    console.log('done');
  })
  .catch(err => {
    console.error(err);
  });
}
