const wifiAP = require('../src/index');

const wifis = wifiAP.wifis;

// console.log(wifiAP);

console.log(wifis.getWifi('home'));

console.log(wifis.getAll());
