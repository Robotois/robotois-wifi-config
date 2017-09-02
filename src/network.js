const fs = require('fs');

const dhcpcd = (line) => `# A sample configuration for dhcpcd.
# See dhcpcd.conf(5) for details.

# Allow users of this group to interact with dhcpcd via the control socket.
#controlgroup wheel

# Inform the DHCP server of our hostname for DDNS.
hostname

# Use the hardware address of the interface for the Client ID.
clientid
# or
# Use the same DUID + IAID as set in DHCPv6 for DHCPv4 ClientID as per RFC4361.
#duid

# Persist interface configuration when dhcpcd exits.
persistent

# Rapid commit support.
# Safe to enable by default because it requires the equivalent option set
# on the server to actually work.
option rapid_commit

# A list of options to request from the DHCP server.
option domain_name_servers, domain_name, domain_search, host_name
option classless_static_routes
# Most distributions have NTP support.
option ntp_servers
# Respect the network MTU.
# Some interface drivers reset when changing the MTU so disabled by default.
#option interface_mtu

# A ServerID is required by RFC2131.
require dhcp_server_identifier

# Generate Stable Private IPv6 Addresses instead of hardware based ones
slaac private

# A hook script is provided to lookup the hostname if not set by the DHCP
# server, but it should not be run by default.
nohook lookup-hostname

${line}
`;

const denyInterfaces = (asHotspot) => asHotspot ? dhcpcd('denyinterfaces wlan0\n') : dhcpcd('#denyinterfaces wlan0\n');

const interfaces = (ipConf) =>
`# interfaces(5) file used by ifup(8) and ifdown(8)

# Please note that this file is written to be used with dhcpcd
# For static IP, consult /etc/dhcpcd.conf and 'man dhcpcd.conf'

# Include files from /etc/network/interfaces.d:
source-directory /etc/network/interfaces.d

auto lo
iface lo inet loopback

iface eth0 inet manual

${ipConf}

allow-hotplug wlan1
iface wlan1 inet manual
    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf
`;

const hotspotIP = `allow-hotplug wlan0
iface wlan0 inet static
  address 10.10.1.1
  netmask 255.255.255.0
  network 10.10.1.0
#    wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf`;

const wifiIP = `allow-hotplug wlan0
iface wlan0 inet manual
  wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf`;

const networkInterfaces = asHotspot => (asHotspot ?
  interfaces(hotspotIP) :
  interfaces(wifiIP)
);

exports.config = (asHotspot) => {
  /*
    Setup dhcpcd deny interfaces
   */
  fs.writeFile('/etc/dhcpcd.conf', denyInterfaces(asHotspot), (err) => {
    if (err) throw err;
    console.log('Deny Interfaces... done!!');
  })
  /*
    Set the IP configuration
   */
  fs.writeFile('/etc/network/interfaces', networkInterfaces(asHotspot), (err) => {
    if (err) throw err;
    console.log('Network Interfaces... done!!');
  })

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
      console.log('wpa_supplicant... done!!');
    })
  }
};
