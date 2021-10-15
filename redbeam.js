const axios = require('axios');
const { redbeam } = require('./config');
const config = require('./config');

//Authenticate with Redbeam and get a JWT
const redBeam = new Promise((resolve, reject) => {
    axios.post('https://app.redbeam.com/api/security/auth', {
      username: config.redbeam.user,
      password: config.redbeam.password
    },)
    .then(res => {
      
      resolve(res.data.tokenKey);
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

//Function to get Asset info and return the id number
const getAssetID = assetTag => {
  return new Promise((resolve, reject) =>{
    redBeam.then(token => {
      axios.get(`https://app.redbeam.com/api/item/item?offset=0&limit=1&page=1&pageSize=25&orderBy=title%3Aa&searchTerm=${assetTag}&searchProperties=assetNo`, {
      headers: {
        'Authorization': token
      }
    },)
    .then(res => {
      //If response is null the asset does not exist
      if(res.data){
        resolve(res.data.items[0]._id)
      } else {
        resolve()
      }
      
    })
    .catch(err => {reject(err);}
    );
    })
  })
}

//Function to add new Asset in Redbeam
const createAsset = (data) => {

  //Prepare data for redbeam
  let redBeamData = {
    "assetNo": `${data.asset}`,
    "active": true,
    "cost": "0.00",
    "customFieldOne": `${data.network['Wi-Fi']}`,
    "customFieldTwo": "Wired Mac",
    "customFieldThree": `${data.hostname}`,
    "customFieldFour": `${data.os}`,
    "location:building": {
      "title": "A3",
      "_id": "6123a75522479c8f9beb513d"
    },
    "location:company": {
      "title": "doTerra",
      "_id": "6123a75422479c8f9beb4cf4"
    },
    "location:location": {
      "title": "A331 IT Storage Room",
      "_id": "6123a75522479c8f9beb529c"
    },
    "organization:manufacturer": {
      "title": `${data.manufacturer}`,
      "_id": "6123a75422479c8f9beb4e99"
    },
    "serialNo": `${data.serialNumber}`,
    "description": "",
    "organization:person": {
      "_id": "6123a75422479c8f9beb4de6",
      "title": `${data.firstName} ${data.lastName}`
    }
  }

  return new Promise((resolve, reject) =>{
    redBeam.then(token => {
      axios.post('https://app.redbeam.com/api/item/item', redBeamData, {
        headers: {
          'Authorization': token
        }})
    .then(res => {
      if(res){
        console.log(res.status)
      }
      
      resolve(res)
    })
    .catch(err => {

      reject(err)
    
    }
    );
    })
  })
}


//Function to Update an existing Asset in Redbeam
const updateAsset = (assetID, data) => {
  return new Promise((resolve, reject) =>{
    redBeam.then(token => {
      axios({
        method: 'patch',
        url: `https://app.redbeam.com/api/item/item/${assetID}`,
        headers: {
          'Authorization': token
        },
        data: [{
          "op": "replace",
          "path": "/organization:person.title",
          "value": `${data.firstName} ${data.lastName}`
        },
        {
          "op": "replace",
          "path": "/customFieldOne",
          "value": `${data.network['Wi-Fi']}`
        },
        {
          "op": "replace",
          "path": "/customFieldTwo",
          "value": `Wired Mac`
        },
        {
          "op": "replace",
          "path": "/customFieldThree",
          "value": `${data.hostname}`
        },
        {
          "op": "replace",
          "path": "/customFieldFour",
          "value": `${data.os}`
        },
        {
          "op": "replace",
          "path": "/organization:manufacturer.title",
          "value": `${data.manufacturer}`
        },
        {
          "op": "replace",
          "path": "/serialNo",
          "value": `${data.serialNumber}`
        },
        ]
      })
    .then(res => {
      if(res){
        console.log(res.status)
      }
      
      resolve(res)
    })
    .catch(err => {

      reject(err)
    
    }
    );
    })
  })
}

//Update function that ties the other functions together
const update = (data) => {

  getAssetID(data.asset).then(id => {
    
    if(id){
      console.log("Updating existing asset")
      updateAsset(id, data)
      return
    } else {
      console.log("Creating new asset")
      createAsset(data)
      return
      }

})
}


let assetDataTest = {
  hostname: 'UTMPG06891',
  asset: '06891',
  username: undefined,
  network: {
    'Thunderbolt Ethernet Slot 1': '64:4b:f0:10:9c:7e',
    'Wi-Fi': 'f0:18:98:1c:c5:3b',
    'Bluetooth PAN': 'f0:18:98:19:ea:b8',
    'Thunderbolt 1': '82:92:15:e3:a4:01',
    'Thunderbolt 2': '82:92:15:e3:a4:00',
    'Thunderbolt 3': '82:92:15:e3:a4:05',
    'Thunderbolt 4': '82:92:15:e3:a4:04',
    'Thunderbolt Bridge': '82:92:15:e3:a4:01'
  },
  firstName: 'Darth',
  lastName: 'Vader',
  model: 'MacBookPro15,1',
  manufacturer: 'Apple Inc.',
  serialNumber: 'C02X31WAJG5L',
  os: 'macOS'
}

let assetDataTest2 = {
  hostname: 'STRONGBOI06891',
  asset: '06891',
  username: undefined,
  network: {
    'Thunderbolt Ethernet Slot 1': '64:4b:f0:10:9c:7e',
    'Wi-Fi': 'aa:aa:aa:aa:aa:aa',
    'Bluetooth PAN': 'f0:18:98:19:ea:b8',
    'Thunderbolt 1': '82:92:15:e3:a4:01',
    'Thunderbolt 2': '82:92:15:e3:a4:00',
    'Thunderbolt 3': '82:92:15:e3:a4:05',
    'Thunderbolt 4': '82:92:15:e3:a4:04',
    'Thunderbolt Bridge': '82:92:15:e3:a4:01'
  },
  firstName: 'Darth',
  lastName: 'Vader',
  model: 'MacBookPro15,1',
  manufacturer: 'Apples',
  serialNumber: 'AAAAAAAA',
  os: 'BIGSURBOI'
}

//update(assetDataTest2);

//updateAsset('6123a75e22479c8f9beb673c', assetDataTest)


module.exports = {
  update: update
}