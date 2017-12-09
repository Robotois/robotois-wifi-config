const command = require('./commands');

const network = require('./network');
const hostapd = require('./hostapd');
const dnsmasq = require('./dnsmasq');

const configureNetwork = async (asHotspot) => {
  await command('sudo systemctl daemon-reload');
  if (asHotspot) {
    // await command('sudo ifdown wlan0 && sudo ifup wlan0');
    // await command('sudo systemctl restart dhcpcd');
    // await command('sudo systemctl restart hostapd && sudo systemctl restart dnsmasq');
    await command('sudo systemctl enable hostapd && sudo systemctl enable dnsmasq');
    console.log('---> Robotois Access Point enabled... Restarting');
  } else {
    await command('sudo systemctl disable hostapd && sudo systemctl disable dnsmasq');
    // await command('sudo systemctl stop hostapd && sudo systemctl stop dnsmasq');
    // await command('sudo systemctl restart dhcpcd');
    // await command('sudo ifdown wlan0 && sudo ifup wlan0');
    // await command('sudo wpa_cli reconfigure && sudo wpa_cli disconnect && sudo wpa_cli reconnect');
    console.log('---> Robotois connecting to Wifi... Restarting');
  }
  await command('sudo shutdown -r now');
};

const startAP = () => {
  const asHotspot = true;
  network.config(asHotspot);
  dnsmasq.config();
  hostapd.config();
  setTimeout(() => {
    configureNetwork(asHotspot);
  }, 2000);
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
  }, 2000);
};

module.exports = {
  connectWifi,
  startAP,
};
