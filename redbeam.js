const axios = require('axios');
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

//Function to get Asset information for the redbeam fields

//Function to get Asset ID
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

//Function to get asset manufacturer id or call the createManufacturer function if needed 
const getManufacturerID = man =>{
  return new Promise((resolve, reject) =>{
    redBeam.then(token => {
      axios.get(`https://app.redbeam.com/api/organization/manufacturer?offset=0&limit=1&page=1&pageSize=25&orderBy=title%3Aa&searchTerm=${man}&searchProperties=title`, {
      headers: {
        'Authorization': token
      }
    },)
    .then(res => {
      //If response is null the manufacturer does not exist
      if(res.data){
        resolve(res.data.items[0]._id)
      } else {
        createManufacturer(man).then(id => resolve(id))
      }
      
    })
    .catch(err => {reject(err);}
    );
    })
  })
}

//Function to get asset model id or call the createModel function if needed 
const getModelID = model =>{
  return new Promise((resolve, reject) =>{
    redBeam.then(token => {
      axios.get(`https://app.redbeam.com/api/item/model?offset=0&limit=1&page=1&pageSize=25&orderBy=title%3Aa&searchTerm=${model}&searchProperties=title`, {
      headers: {
        'Authorization': token
      }
    },)
    .then(res => {
      //If response is null the model does not exist
      if(res.data){
        resolve(res.data.items[0]._id)
      } else {
        createModel(model).then(id => resolve(id))
      }
      
    })
    .catch(err => {reject(err);}
    );
    })
  })
}

//Function to get person id from redbeam or call the createUser function if needed 
const getUserID = (firstName, lastName) =>{
  return new Promise((resolve, reject) =>{
    redBeam.then(token => {
      axios.get(`https://app.redbeam.com/api/organization/person?offset=0&limit=1&page=1&pageSize=25&orderBy=title%3Aa&searchTerm=${firstName}%20${lastName}&searchProperties=title`, {
      headers: {
        'Authorization': token
      }
    },)
    .then(res => {
      //If response is null the user does not exist
      if(res.data){
        resolve(res.data.items[0]._id)
      } else {
        createUser(firstName, lastName).then(id => resolve(id))
      }
      
    })
    .catch(err => {reject(err);}
    );
    })
  })
}

//Function to add new Asset in Redbeam
const createAsset = data => {

  //Prepare data for redbeam
  let redBeamData = {
    "assetNo": data.asset,
    "active": true,
    "cost": "0.00",
    "customFieldOne": `${data.network['Wi-Fi']}`,
    "customFieldTwo": data.network.Ethernet ? data.network.Ethernet : "",
    "customFieldThree": data.hostname,
    "customFieldFour": data.os,
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
      "title": data.manufacturer,
      "_id": data.manufacturerID
    },
    "serialNo": data.serialNumber,
    "description": "",
    "organization:person": {
      "title": `${data.firstName} ${data.lastName}`,
      "_id": data.userID
    },
    "item:model": {
      "title": data.model,
      "_id": data.modelID
    }
    
  }

  console.log(redBeamData)

  return new Promise((resolve, reject) =>{
    redBeam.then(token => {
      axios.post('https://app.redbeam.com/api/item/item', redBeamData, {
        headers: {
          'Authorization': token
        }})
    .then(res => {
      
        console.log(res.status)
      
      resolve(res)
    })
    .catch(err => {

      reject(err)
    
    }
    );
    })
  })
}

//Function to createManufacturer
const createManufacturer = man => {

  let redBeamData = {
    "title": man
  }

  return new Promise((resolve, reject) =>{
    redBeam.then(token => {
      axios.post('https://app.redbeam.com/api/organization/manufacturer', redBeamData, {
        headers: {
          'Authorization': token
        }})
    .then(res => {
  
      console.log(`Manufacturer ${man} has been created`)
      console.log(`With a status code of ${res.status} and id of ${res.data._id}`)
      
      resolve(res.data._id)
    })
    .catch(err => {

      reject(err)
    
    }
    );
    })
  })
}


//Function to createModel
const createModel = model => {
  let redBeamData = {
    "title": model
  }

  return new Promise((resolve, reject) =>{
    redBeam.then(token => {
      axios.post('https://app.redbeam.com/api/item/model', redBeamData, {
        headers: {
          'Authorization': token
        }})
    .then(res => {
  
      console.log(`Model ${model} has been created`)
      console.log(`With a status code of ${res.status} and id of ${res.data._id}`)
      
      resolve(res.data._id)
    })
    .catch(err => {

      reject(err)
    
    }
    );
    })
  })
}

//Function to createUser
const createUser = (firstName, lastName) => {
  let redBeamData = {
    "title": `${firstName} ${lastName}`
  }

  return new Promise((resolve, reject) =>{
    redBeam.then(token => {
      axios.post('https://app.redbeam.com/api/organization/person', redBeamData, {
        headers: {
          'Authorization': token
        }})
    .then(res => {
  
      console.log(`User ${firstName} ${lastName} has been created`)
      console.log(`With a status code of ${res.status} and id of ${res.data._id}`)
      
      resolve(res.data._id)
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
          "value": data.network['Wi-Fi']
        },
        {
          "op": "replace",
          "path": "/customFieldTwo",
          "value": data.network.Ethernet
        },
        {
          "op": "replace",
          "path": "/customFieldThree",
          "value": data.hostname
        },
        {
          "op": "replace",
          "path": "/customFieldFour",
          "value": data.os
        },
        {
          "op": "replace",
          "path": "/organization:manufacturer.title",
          "value": data.manufacturer
        },
        {
          "op": "replace",
          "path": "/serialNo",
          "value": data.serialNumber
        },
        {
          "op": "replace",
          "path": "/item:model.title",
          "value": data.model
        }
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
 
  getAssetID(data.asset).then(assetID => {

    if(assetID){
      console.log("Updating existing asset")
      updateAsset(assetID, data)
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
  model: 'BIGBOI9000',
  manufacturer: 'PLZDELETE',
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



//Random Tests are listed below.  Will be deleted for final product

//update(assetDataTest);

//updateAsset('6123a75e22479c8f9beb673c', assetDataTest)

//getManufacturerID(assetDataTest.manufacturer).then(id => console.log(`Manufacturer ID:${id}`))

//getModelID(assetDataTest.model).then(id => console.log(`Model ID:${id}`))

//getUserID(assetDataTest.firstName, assetDataTest.lastName).then(id => console.log(`User ID:${id}`))

module.exports = {
  update: update,
  getManufacturerID: getManufacturerID,
  getModelID: getModelID,
  getUserID: getUserID
}