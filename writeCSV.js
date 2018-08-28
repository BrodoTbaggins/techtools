const fs = require('fs');

module.exports = function(path, data){
  return new Promise((resolve, reject) => {
    console.log('Writing csv');

    if(!fs.existsSync(path)){
      fs.appendFileSync(path, 'Hostname, Asset Tag, Username, WiFi MAC, Ethernet Mac, First Name, Last Name, Model, Manufacturer, Serial Number, OS\n');
    }

    // Format data
    const outputData = [
      data.hostname,
      data.asset,
      data.username,
      data.network['Wi-Fi'],
      data.network['Ethernet'],
      data.firstName,
      data.lastName,
      data.model,
      data.manufacturer,
      data.serialNumber,
      data.os
    ].map(a => `"${a}"`);

    fs.appendFile(path, outputData.join(',')+'\n', err => {
      if(err){
        reject(err);
        return;
      }

      resolve();
    });
  });
}