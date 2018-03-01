const fs = require('fs');
const { apTemplate, contentReplacer } = require('./templates');
const fileWriter = require('./fileWriter');

const denyWlan = asHotspot => (asHotspot ? 'denyinterfaces wlan0' : '#denyinterfaces wlan0');

const hotspotIP = `allow-hotplug wlan0
iface wlan0 inet static
  address 192.168.0.1
  netmask 255.255.255.0
  network 192.168.0.0
  broadcast 192.168.0.255`;

const wpaSupplicant = `allow-hotplug wlan0
iface wlan0 inet manual
  wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf`;

const networkInterfaces = asHotspot => (asHotspot ? hotspotIP : wpaSupplicant);

const denyInterfaces = asHotspot => (data) => {
  const hasTemplate = data.match(/(#--ap-begin)\n(.+\n)(#--ap-end)/gi) !== null;
  return hasTemplate ?
    data.replace(/(#--ap-begin)\n(.+\n)(#--ap-end)/gi, contentReplacer(denyWlan(asHotspot))) :
    [data, apTemplate(denyWlan(asHotspot))].join('\n');
};

const interfaces = asHotspot => (data) => {
  const hasTemplate = data.match(/(#--ap-begin)\n(.+(\n.+)+\n)(#--ap-end)/gi) !== null;
  return hasTemplate ?
    data.replace(/(#--ap-begin)\n(.+(\n.+)+\n)(#--ap-end)/gi, contentReplacer(networkInterfaces(asHotspot), 4)) :
    data.replace(/(.+wlan0(\n.+)+conf)/gi, apTemplate(networkInterfaces(asHotspot)));
};

exports.config = (asHotspot) => {
  fileWriter('/etc/dhcpcd.conf', denyInterfaces(asHotspot));
  fileWriter('/etc/network/interfaces', interfaces(asHotspot));
};

const wpaTemplate = wifi => `
country=GB
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

${wifi}
`;

exports.setWifi = (wifiSettings) => {
  if (wifiSettings) {
    fs.writeFile('/etc/wpa_supplicant/wpa_supplicant.conf', wpaTemplate(wifiSettings), (err) => {
      if (err) throw err;
      console.log('setWifi[wpa_supplicant]... done!!');
    });
  }
};
