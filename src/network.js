const fs = require('fs');
const { apTemplate, contentReplacer } = require('./templates');

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

const denyInterfaces = (asHotspot) => {
  fs.readFile('/etc/dhcpcd.conf', 'utf8', (err, data) => {
    if (err) throw err;
    const hasTemplate = data.match(/(#--ap-begin)\n(.+\n)(#--ap-end)/gi) !== null;
    // console.log('network[interfaces] noTemplate: ', hasTemplate);
    const newData = hasTemplate ?
      data.replace(/(#--ap-begin)\n(.+\n)(#--ap-end)/gi, contentReplacer(denyWlan(asHotspot))) :
      [data, apTemplate(denyWlan(asHotspot))].join('\n');
    // console.log('network[interfaces] newData: ', newData);
    fs.writeFile('/etc/dhcpcd.conf', newData, (error) => {
      if (err) throw error;
      console.log('network[dhcpcd]... done!!');
    });
  });
};

const interfaces = (asHotspot) => {
  fs.readFile('/etc/network/interfaces', 'utf8', (err, data) => {
    if (err) throw err;
    const hasTemplate = data.match(/(#--ap-begin)\n(.+(\n.+)+\n)(#--ap-end)/gi) !== null;
    // console.log('network[interfaces] hasTemplate: ', hasTemplate);
    const newData = hasTemplate ?
      data.replace(/(#--ap-begin)\n(.+(\n.+)+\n)(#--ap-end)/gi, contentReplacer(networkInterfaces(asHotspot), 4)) :
      data.replace(/(.+wlan0(\n.+)+conf)/gi, apTemplate(networkInterfaces(asHotspot)));
    // console.log('network[interfaces] newData: ', newData);
    fs.writeFile('/etc/network/interfaces', newData, (error) => {
      if (err) throw error;
      console.log('network[interfaces]... done!!');
    });
  });
};

exports.config = (asHotspot) => {
  denyInterfaces(asHotspot);
  interfaces(asHotspot);
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
