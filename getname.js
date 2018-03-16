const ActiveDirectory = require('activedirectory');
const config = require('./config');

let input;

module.exports = function(username){
  return new Promise((resolve, reject) => {
    const ad = new ActiveDirectory(config.ad);
    ad.findUser(username, function(err, user){
      if(err){
        reject(err);
      }

      if(user){
        const name = {
          first: user.givenName,
          last: user.sn
        }

        resolve(name);
      }

      resolve();
    });
  });
}
