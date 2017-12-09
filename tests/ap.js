// const fs = require('fs');
const wifiAP = require('../');

// const killWpa = () => {
//   fs.readFile('/run/wpa_supplicant.wlan0.pid', 'utf8', (err, data) => {
//     if (err) {
//       console.error(err.message);
//       return;
//     }
//     console.log('wpaPID:', data);
//     process.kill(data, 'SIGINT');
//   });
// };

// killWpa();
wifiAP.startAP();
