const axios = require('axios');
const config = require('./config');

//Open connection to redbeam
const session = new Promise((resolve, reject) => {
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

session.then(session => console.log(session)).catch(err => console.error(err));
