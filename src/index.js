const fs = require('fs');

const command = require('./commands');
const network = require('./network');
const hostapd = require('./hostapd');
const dnsmasq = require('./dnsmasq');
const knownWifis = require('./known-wifis');

const asHotspot = false;
network.config(asHotspot);
hostapd.config(asHotspot);
dnsmasq.config(asHotspot);
// knownWifis.addWifi('home', 'Mayitos', 'm4y1t4c4m0');
// knownWifis.addWifi('yovany-cel', 'yovanylg', '12345678');
command('sudo systemctl daemon-reload');
if (asHotspot) {
  command('sudo systemctl restart dhcpcd');
  command('sudo ifconfig wlan0 down');
  command('sudo ifconfig wlan0 up');
  command('sudo systemctl restart hostapd && sudo systemctl restart dnsmasq');
} else {
  command('sudo systemctl stop hostapd.service && sudo systemctl stop dnsmasq');
  command('sudo systemctl restart dhcpcd');
  command('sudo ifconfig wlan0 down');
  command('sudo ifconfig wlan0 up');
  // command('sudo wpa_supplicant -s -B -P /run/wpa_supplicant.wlan0.pid -i wlan0 -D nl80211,wext -c /etc/wpa_supplicant/wpa_supplicant.conf');
}

const wifi = knownWifis.getWifi('home');
network.setWifi(wifi);
