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

module.exports = {
  getUser: getUser,
}
