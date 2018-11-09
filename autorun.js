const crypto = require('crypto');
const fs = require('fs');
const log = require('./logger');
const redBeam = require('./redbeam');

module.exports = function(data, redBeamData){
  const hashLocation = process.platform === 'win32' ? 'C:/Users/Public/AppData/Local/Tech Tools/' : '/Users/Shared/Tech Tools/';
  const hashFile = hashLocation + 'data.hash';

  console.log(redBeamData);

  // create hash folder
  if(!fs.existsSync(hashLocation)){
    fs.mkdirSync(hashLocation);
    fs.chmodSync(hashLocation, 0777);
  }

  // create hash
  if(!fs.existsSync(hashFile)){
    fs.writeFileSync(hashFile, '');
    fs.chmodSync(hashFile, 0777);
  }

  // hash data
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');

  // read hash file
  const currentHash = fs.readFileSync(hashFile, 'utf8');

  // hash is different, should update
  if(currentHash !== hash){
    // Send data to redbeam
    log.write('Sending data to RedBeam');
    redBeam.update(redBeamData).then(res => {
      log.write('RedBeam update successful');

      // update hash file
      fs.writeFileSync(hashFile, hash);
      log.write('Done updating hash');

      console.log('Done');
      log.write('Exiting');
    });
  }else{
    log.write('No change since last update');

    console.log('Done');
    log.write('Exiting');
  }
}