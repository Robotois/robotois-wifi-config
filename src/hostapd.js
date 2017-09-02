const fs = require('fs');

const wifiSettings = (hotspotName, pass) => `# This is the name of the WiFi interface we configured above
interface=wlan0
# Use the nl80211 driver with the brcmfmac driver
driver=nl80211
# This is the name of the network
ssid=${hotspotName}
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
rsn_pairwise=CCMP
`;

const hostapd = (confLine) => `# Defaults for hostapd initscript
#
# See /usr/share/doc/hostapd/README.Debian for information about alternative
# methods of managing hostapd.
#
# Uncomment and set DAEMON_CONF to the absolute path of a hostapd configuration
# file and hostapd will be started during system boot. An example configuration
# file can be found at /usr/share/doc/hostapd/examples/hostapd.conf.gz
#
${confLine}

# Additional daemon options to be appended to hostapd command:-
# 	-d   show more debug messages (-dd for even more)
# 	-K   include key data in debug messages
# 	-t   include timestamps in some debug messages
#
# Note that -B (daemon mode) and -P (pidfile) options are automatically
# configured by the init.d script and must not be added to DAEMON_OPTS.
#
#DAEMON_OPTS=""
`;
const hostapdSetConf = (asHotspot) => asHotspot ? hostapd('DAEMON_CONF="/etc/hostapd/hostapd.conf"') : hostapd('#DAEMON_CONF=""')

const confReplacer = (match, p1, offset, string) => 'DAEMON_CONF="/etc/hostapd/hostapd.conf"';

exports.config = (asHotspot) => {
  /*
    Hostapd wifi settings
   */
  fs.access('/etc/hostapd/hostapd.conf', (err) => {
    if (!err) {
      console.error('hostapd.conf already exists!!');
      return;
    }

    fs.writeFile('/etc/hostapd/hostapd.conf', wifiSettings('robotois-wifi', '12345678'), (err) => {
      if (err) throw err;
      console.log('hostapd Interfaces... done!!');
    })
  });

  fs.readFile('/etc/default/hostapd', 'utf8', (err, data) => {
    if (err) throw err;
    const noConf = data.match(/#DAEMON_CONF=""/gi);
    // console.log(data);
    if (noConf) {
      const newData = data.replace(/(#DAEMON_CONF="")/, confReplacer);
      // console.log(newData);
      fs.writeFile('/etc/default/hostapd', newData, (err) => {
        if (err) throw err;
        console.log('/etc/default/hostapd DAEMON_CONF!!');
      })
    }
  });

}
