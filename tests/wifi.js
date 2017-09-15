// const command = require('../src/commands');
// const fs = require('fs');
const wifiAP = require('../');

//   exec('wpa_passphrase Mayitos m4y1t4c4m0', (error, stdout, stderr) => {
//   if (error) {
//     console.error(`exec error: ${error}`);
//     return;
//   }
//   console.log(`stdout: ${stdout}`);
//   console.log(`stderr: ${stderr}`);
// });

// const restartWpa = () => {
//   fs.readFile('/run/wpa_supplicant.wlan0.pid', 'utf8', (err, data) => {
//     if (err) {
//       console.error(err.message);
//       command('sudo wpa_supplicant -s -B -P /run/wpa_supplicant.wlan0.pid -i wlan0 -D nl80211,wext -c /etc/wpa_supplicant/wpa_supplicant.conf');
//       return;
//     }
//     console.log('wpaPID:', data);
//     process.kill(data, 'SIGTERM');
//     command('sudo wpa_supplicant -s -B -P /run/wpa_supplicant.wlan0.pid -i wlan0 -D nl80211,wext -c /etc/wpa_supplicant/wpa_supplicant.conf');
//   });
// };

// command('wpa_passphrase Mayitos m4y1t4c4m0');

// restartWpa();
wifiAP.connectWifi('Mayitos', 'm4y1t4c4m0');
// setTimeout(() => {
// }, 3000);
