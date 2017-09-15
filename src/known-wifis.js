const fs = require('fs');
const path = require('path');
const knownWifis = require('./wifis.json');

exports.getSettings = (ssid, password, psk = true) => `network={
    ssid="${ssid}"
    psk="${password}"
  }`;

// const saveWifi = (id, settings) => {
//   if (id) {
//     knownWifis[`${id}`] = settings;
//     fs.writeFile(path.join(__dirname, '/wifis.json'), JSON.stringify(knownWifis), (err) => {
//       if (err) throw err;
//       console.log('wifis.json updated... done!!');
//     });
//   }
// };

// exports.addWifi = (id, ssid, password) => {
//   const settings = getSettings(id, ssid, password);
//   saveWifi(id, settings);
// };
//
// exports.removeWifi = (id) => {
//   knownWifis[`${id}`] = undefined;
//   fs.writeFile(path.join(__dirname, '/wifis.json'), JSON.stringify(knownWifis), (err) => {
//     if (err) throw err;
//     console.log('wifis.json updated... done!!');
//   });
// };
//
// exports.getWifi = (id) => {
//   const settings = knownWifis[`${id}`];
//   if (settings) {
//     return settings.str;
//   }
//   console.log(`Wifi with id: ${id} does not exist in the database...`);
//   return undefined;
// };
//
// exports.getAll = () => knownWifis;
