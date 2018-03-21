const axios = require('axios');
const config = require('./config');

//Open connection to redbeam
const redBeam = new Promise((resolve, reject) => {
  axios.post('https://useraccess.assettracking.redbeam.com/api/Authentication', {
    userName: config.redbeam.user,
    password: config.redbeam.password
  })
  .then(res => {
    //Check if cookie has been set
    if(res.headers['set-cookie']){

      //Parse cookie response
      let cookies = ''
      for(let i = 0; i < res.headers['set-cookie'].length; i++){
        if(cookies){
          cookies += '; ';
        }

        const match = res.headers['set-cookie'][i].match(/^(\S+)=(\S+);/);
        cookies += `${match[1]}=${match[2]}`;
      }


      //Create axios instance to return
      const instance = axios.create({
        headers: {
          Cookie: cookies
        }
      });

      resolve(instance);
    }
  })
  .catch(err => {
    //Check if credentials are incorrect
    if(err.response){
      if(err.response.status === 403){
        reject('Invalid credentials');
      }
    }

    reject(err);
  });
});

const getUser = (firstName, lastName) => {
  return new Promise((resolve, reject) => {
    redBeam.then(session => {
      //Create new person
      session.post('https://webapi.assettracking.redbeam.com/api/People', {
        id: '',
        code: '',
        lastName: lastName,
        firstName: firstName,
        street1: '',
        street2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone1: '',
        phone2: '',
        email: '',
        active: '',
        thirdPartyId: '',
        title: '',
        dateCreated: '',
        changedAt: '',
        lamportTimestamp: '',
        itcEvent: "0",
        itcId: "1",
        name: `${lastName}, ${firstName}`
      })
      .then(res => resolve(res.data.id))
      .catch(err => {
        if(err.response){
          if(err.response.status === 409){

            //User already exists, find existing user
            session.get('https://webapi.assettracking.redbeam.com/api/People')
            .then(res => {

              for(let i = 0; i < res.data.length; i++){
                if(res.data[i].firstName === firstName && res.data[i].lastName === lastName){
                  resolve(res.data[i].id);
                  break;
                }else{
                  continue;
                }
              }
            })
            .catch(err => reject(err));
          }else{
            reject(err);
          }
        }else{
          reject(err);
        }
      });
    })
    .catch(err => reject(err));
  });
}

const getAsset = assetTag => {
  return new Promise((resolve, reject) => {
    redBeam.then(session => {
      session.get('https://webapi.assettracking.redbeam.com/api/Items?getby=asset&value='+assetTag)
      .then(res => resolve(res.data))
      .catch(err => {
        if(err.response){
          if(err.response.status === 404){
            //Asset tag doesn't exist, create new
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
            data.code = assetTag;

            session.post('https://webapi.assettracking.redbeam.com/api/Items', data)
            .then(res => resolve(res.data))
            .catch(err => reject(err));
          }else{
            reject(err);
          }
        }else{
          reject(err);
        }
      });
    }).catch(err => reject(err));
  });
}

const updateAsset = data => {
  return new Promise((resolve, reject) => {
    redBeam.then(session => {
      session.put('https://webapi.assettracking.redbeam.com/api/Items/'+data.entityId, data)
      .then(res => resolve(res.data))
      .catch(err => reject(err));
    })
    .catch(err => reject(err));
  });
}

module.exports = {
  getUser: getUser,
  getAsset: getAsset,
  update: updateAsset
}
