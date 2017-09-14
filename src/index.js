const command = require('./commands');

const network = require('./network');
const hostapd = require('./hostapd');
const dnsmasq = require('./dnsmasq');
const knownWifis = require('./known-wifis');

const startAP = () => {
  const asHotspot = true;
  network.config(asHotspot);
  dnsmasq.config();
  hostapd.config();
  setTimeout(() => {
    command('sudo systemctl enable hostapd && sudo systemctl enable dnsmasq');
    console.log('---> Robotois Access Point enabled, system going to reboot...');
    command('sudo reboot');
  }, 3000);
};

const connectWifi = (wifiId) => {
  const asHotspot = false;
  const wifiSettings = knownWifis.getWifi(wifiId);
  if (!wifiSettings) {
    console.log(`Unknown wifi: ${wifiId}`);
    return;
  }
  network.config(asHotspot);
  network.setWifi(wifiSettings);
  setTimeout(() => {
    command('sudo systemctl disable hostapd && sudo systemctl disable dnsmasq');
    console.log(`---> Robotois connecting to Wifi: "${wifiId}", system going to reboot...`);
    command('sudo reboot');
  }, 3000);
};

module.exports = {
  connectWifi,
  startAP,
  wifis: knownWifis,
};
