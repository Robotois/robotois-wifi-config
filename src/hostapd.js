const fs = require('fs');

const wifiSettings = (ssid, pass) => `# This is the name of the WiFi interface we configured above
interface=wlan0

# Use the nl80211 driver with the brcmfmac driver
driver=nl80211

# This is the name of the network
ssid=${ssid}

# Use the 2.4GHz band
hw_mode=g

# Use channel 6
channel=6

# Enable 802.11n
ieee80211n=1

# Enable WMM
wmm_enabled=1

# Enable 40MHz channels with 20ns guard interval
ht_capab=[HT40][SHORT-GI-20][DSSS_CCK-40]

# Accept all MAC addresses
macaddr_acl=0

# Use WPA authentication
auth_algs=1

# Require clients to know the network name
ignore_broadcast_ssid=0

# Use WPA2
wpa=2

# Use a pre-shared key
wpa_key_mgmt=WPA-PSK

# The network passphrase
wpa_passphrase=${pass}

# Use AES, instead of TKIP
rsn_pairwise=CCMP`;

const hostapdSettings = (ssid, pass) => {
  fs.writeFile('/etc/hostapd/hostapd.conf', wifiSettings(ssid, pass), (error) => {
    if (error) throw error;
    console.log('hostapd[wifiSettings]... done!!');
  });
};

const hostapdDefault = () => {
  fs.readFile('/etc/default/hostapd', 'utf8', (err, data) => {
    if (err) throw err;
    const noConf = data.match(/#DAEMON_CONF=""/gi);
    // console.log(data);
    if (noConf) {
      const newData = data.replace(/(#DAEMON_CONF="")/gi, 'DAEMON_CONF="/etc/hostapd/hostapd.conf"');
      // console.log(newData);
      fs.writeFile('/etc/default/hostapd', newData, (error) => {
        if (error) throw error;
        console.log('hostapd[DAEMON_CONF] done!!');
      });
    }
  });
};

exports.config = (ssid, pass) => {
  hostapdSettings(ssid, pass);
  hostapdDefault();
};
