const ActiveDirectory = require('activedirectory');
const config = require('./config');

module.exports = function(username){
  const name = {
    first: null,
    last: null
  }

  return new Promise((resolve, reject) => {
    if(process.platform === 'win32'){
      const ad = new ActiveDirectory(config.ad);
      ad.findUser(username, function(err, user){
        if(err){
          reject(err);
        }

        if(user){
          name.first = user.givenName;
          name.last = user.sn;
        }

        resolve(name);
      });
    }else{
      resolve(name);
    }
  });
}
