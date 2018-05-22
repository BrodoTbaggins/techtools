const axios = require('axios');
const config = require('./config');

document.addEventListener('DOMContentLoaded', function(){

  // Add listeners for buttons
  document.getElementById('submit').addEventListener('click', formHandler);
  document.getElementById('cancel').addEventListener('click', function(){
    // Clear both inputs
    [document.getElementById('asset'), document.getElementById('serial')].forEach(input => input.value = null);
  });

  // Add event listeners for keyboard shortcuts
  document.addEventListener('keydown', function(e){
    if(e.which !== 9 && e.which !== 13){
      return;
    }

    // Stop page from tabbing or submitting
    e.preventDefault();

    // Go back to previous element if shift is held
    if(e.shiftKey){
      switch(e.target.id){
        case 'asset':
          serial.focus();
          break;

        case 'serial':
          asset.focus();
          break;

        default:break;
      }
      return;
    }

    formHandler();
  });
});

function formHandler(){
  const asset = document.getElementById('asset');
  const serial = document.getElementById('serial');

  // Select top most element with no value
  if(!asset.value.trim()){
    asset.focus();
    return;
  }

  if(!serial.value.trim()){
    serial.focus();
    return;
  }

  console.log('a');

  if(asset.value.trim() && serial.value.trim()){
    send(asset.value.trim(), serial.value.trim());
  }
}

function send(asset, serial){
  const data = {
    id: '00000000-0000-0000-0000-000000000000',
    entityId: '',
    code: '',
    description: '',
    serialNumber: '',
    manufacturerId: 'ad347b99-2b38-42d7-8aaf-80f2e21237b1',
    vendorId: '8e86efee-420d-4de6-8251-df404b198289',
    locationId: '38013da6-06ef-4ff2-9472-7b92845da927',
    itemTypeId: '1a3fc08d-e433-48d7-8e94-6758f7e13504',
    statusId: '5eb257a2-f2bf-402e-aada-2755d343ec7f',
    personId: '2269e681-0208-4427-ba0d-1fc039bbbd37',
    firstName: '',
    lastName: '',
    accountId: '158470c9-5a8d-4238-994a-3e6c0c3e9601',
    departmentId: '74e8cdf1-0a57-4214-b4ad-deea40b0fe9d',
    model: '',
    poNumber: '',
    cost: 0,
    warrantyNumber: '',
    leaseNumber: '',
    notes: '',
    quantity: 0,
    inactive: false,
    warrantyStartDate: null,
    warrantyEndDate: null,
    leaseStartDate: null,
    leaseEndDate: null,
    acquisitionDate: null,
    dateCreated: null,
    changedAt: null,
    effectiveStartDate: null,
    effectiveEndDate: null,
    tenantId: '',
    editingUserName: '',
    userName: '',
    userField1: '',
    userField2: '',
    userField3: '',
    userField4: '',
    userField5: '',
    userField6: '',
    userField7: '',
    userField8: '',
    userField9: '',
    userField10: '',
    userField11: '',
    userField12: '',
    userField13: '',
    userField14: '',
    userField15: '',
    userField16: '',
    userField17: '',
    userField18: '',
    userField19: '',
    userField20: '',
    userField21: '',
    userField22: '',
    userField23: '',
    userField24: '',
    userField25: '',
    lamportTimestamp: '',
    itcEvent: '0',
    itcId: '1',
    target: {
      id: '',
      entityId: '',
      code: '',
      description: '',
      serialNumber: '',
      manufacturerId: '',
      vendorId: '',
      locationId: '',
      itemTypeId: '',
      statusId: '',
      personId: '',
      firstName: '',
      lastName: '',
      accountId: '',
      departmentId: '',
      model: '',
      poNumber: '',
      cost: 0,
      warrantyNumber: '',
      leaseNumber: '',
      notes: '',
      quantity: 0,
      inactive: false,
      warrantyStartDate: null,
      warrantyEndDate: null,
      leaseStartDate: null,
      leaseEndDate: null,
      acquisitionDate: null,
      dateCreated: null,
      changedAt: null,
      effectiveStartDate: null,
      effectiveEndDate: null,
      tenantId: '',
      editingUserName: '',
      userName: '',
      userField1: '',
      userField2: '',
      userField3: '',
      userField4: '',
      userField5: '',
      userField6: '',
      userField7: '',
      userField8: '',
      userField9: '',
      userField10: '',
      userField11: '',
      userField12: '',
      userField13: '',
      userField14: '',
      userField15: '',
      userField16: '',
      userField17: '',
      userField18: '',
      userField19: '',
      userField20: '',
      userField21: '',
      userField22: '',
      userField23: '',
      userField24: '',
      userField25: '',
      lamportTimestamp: '',
      itcEvent: '0',
      itcId: '1'
    }
  }

  data.code = asset.toString();
  data.serialNumber = serial.toString();
  data.statusId = '61b258e1-c297-4550-aa7f-94159203d2c5'; // Storage
  data.personId = '2269e681-0208-4427-ba0d-1fc039bbbd37'; // Unassigned
  data.locationId = '5cd08e0c-5e46-4f29-be3a-7056af3eae97' // IT Storage

  axios.post('https://webapi.assettracking.redbeam.com/api/Items', data)
  .then(console.log);
}

// Authenticate with redbeam
// We can't use the redbeam.js module due to CORS
const redbeam = axios.post('https://useraccess.assettracking.redbeam.com/api/Authentication', {
  userName: config.redbeam.user,
  password: config.redbeam.password
});
