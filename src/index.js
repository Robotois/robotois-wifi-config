const command = require('./commands');

const network = require('./network');
const hostapd = require('./hostapd');
const dnsmasq = require('./dnsmasq');

const configureNetwork = async (asHotspot) => {
  await command('sudo systemctl daemon-reload');
  if (asHotspot) {
    await command('sudo systemctl enable hostapd && sudo systemctl enable dnsmasq');
    console.log('---> Robotois Access Point enabled... Restarting');
  } else {
    await command('sudo systemctl disable hostapd && sudo systemctl disable dnsmasq');
    console.log('---> Robotois connecting to Wifi... Restarting');
  }
  await command('sudo shutdown -r now');
};

const startAP = (ssid, pass) => {
  const asHotspot = true;
  network.config(asHotspot);
  dnsmasq.config();
  hostapd.config(ssid, pass);
  setTimeout(() => {
    configureNetwork(asHotspot);
  }, 1000);
};

const connectWifi = async (ssid, password) => {
  const asHotspot = false;
  const wifiSettings = await command(`wpa_passphrase ${ssid} ${password}`);
  if (!wifiSettings) {
    console.log(`Unknown wifi: ${ssid}`);
    return;
  }
  network.config(asHotspot);
  network.setWifi(wifiSettings);
  setTimeout(() => {
    configureNetwork(asHotspot);
  }, 1000);
};

module.exports = {
  connectWifi,
  startAP,
};
